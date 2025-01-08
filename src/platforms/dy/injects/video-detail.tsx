import { Button } from "@/components/ui/button";
import { throttle } from "lodash";
import { toast } from "sonner";
import { aweme as api } from "@/platforms/dy/http";
import { Logo } from "@/components/logo";
import ReactDOM from "react-dom/client";

export const App = (props: {
  type: "video" | "note";
  awemeId: string;
  isMix?: boolean;
}) => {
  const { type, awemeId, isMix } = props;
  const [aweme, setAweme] = useState<api.AwemeDetail>();
  const mixPost = useTaskDialog("mix-post");
  const taskDialog = useTaskDialog('post-comment');

  const handlerDownloadVideo = async () => {
    const aweme = await getAweme();
    if (!aweme) {
      toast.error("获取视频信息失败");
      return;
    }
    if (aweme.media_type === 2) {
      aweme.images?.map((item) => item.url_list.reverse()[0]).forEach((image, index) => {
        browser.runtime.sendMessage<"download">({ name: "download", body: { url: image, filename: (aweme.desc || aweme.aweme_id) + `-图${index + 1}.png` } });
      });
    } else if (aweme.media_type === 4) {
      const url = aweme.video?.play_addr?.url_list?.[0];
      await browser.runtime.sendMessage<"download">({ name: "download", body: { url, filename: (aweme.desc || aweme.aweme_id) + ".mp4" } });
    }
  };

  const getAweme = async () => {
    try {
      if (aweme) return aweme;
      const awemeDetail = await api.awemeDetail(awemeId).then(res => res.aweme_detail);
      setAweme(awemeDetail);
      return awemeDetail;
    } catch (e: any) {
      toast.error(e.message);
      throw e;
    }
  };

  const handleOpenDialog = async () => {
    const aweme = await getAweme();
    taskDialog.open({
      post: {
        postId: awemeId,
        commentCount: aweme.statistics.comment_count,
        title: aweme.desc
      }
    })
  }

  const handlerDownloadMix = async () => {
    const aweme = await getAweme();
    const mixId = aweme.mix_info?.mix_id;
    if (!mixId) {
      toast.error("获取合集信息失败");
      return;
    }
    mixPost.open({
      mixInfo: aweme.mix_info
    });
  }

  return (<>
    <Logo />
    <Button size="sm" onClick={throttle(handlerDownloadVideo, 2000)}>{type === "note" ? "下载图集" : "下载无水印视频"}</Button>
    <Button size="sm" onClick={throttle(handleOpenDialog, 2000)}>导出评论</Button>
    {isMix && <Button size="sm" onClick={throttle(handlerDownloadMix, 2000)}>导出合集</Button>}
  </>);
};

const options: SmcContentScriptUiOptions = {
  position: "inline",
  anchor: () => {
    const activeVideo = document.querySelectorAll('div[data-e2e="feed-active-video"] xg-right-grid');
    return activeVideo?.length > 0 ? activeVideo[activeVideo.length - 1] : document.querySelector('xg-right-grid');
  },
  append: "before",
  isMatch: (url: URL) => {
    if (/^\/(video|note)\/(\d+)$/.test(url.pathname)) return true;
    if (url.searchParams.get('modal_id')) return true;
    if (url.pathname === "/") return true;
    return false;
  },
  onMount: (container: HTMLElement) => {
    container.className = "flex gap-4 bg-transparent mr-8 z-50";
    const root = ReactDOM.createRoot(container);
    const match = location.pathname.match(/^\/(video|note)\/(\d+)$/);
    let type: any, awemeId: any;
    if (match) {
      type = match[1];
      awemeId = match[2];
    } else {
      awemeId = new URLSearchParams(location.search).get('modal_id');
      const activeVideo = document.querySelector('div[data-e2e="feed-active-video"]');
      if (activeVideo) {
        type = activeVideo.querySelector(".account-card")?.textContent === "图文" ? "note" : "video";
        if (!awemeId) {
          awemeId = activeVideo.getAttribute("data-e2e-vid");
        }
      }
    }
    if (location.pathname === '/') {
      recommendListener(awemeId);
    }
    if(!awemeId)return root;
    const awemeMix = document.querySelector('div[data-e2e="aweme-mix"]');
    root.render(<App type={type} awemeId={awemeId} isMix={!!awemeMix} />);
    return root;
  },
  onRemove: (root: ReactDOM.Root) => {
    root?.unmount();
  }
}
export default options;

/**
 * 监听推荐视频变化
 */
let listenerTimerId: number;
const recommendListener = function (awemeId: string) {
  clearInterval(listenerTimerId);
  listenerTimerId = window.setInterval(() => {
    if (location.pathname !== '/') {
      clearInterval(listenerTimerId);
      return;
    }
    const newAwemeId = document.querySelector('div[data-e2e="feed-active-video"]')?.getAttribute("data-e2e-vid");
    if (newAwemeId && newAwemeId !== awemeId) {
      // 视频变了
      const url = new URL(window.location.href);
      url.searchParams.set("modal_id", newAwemeId);
      window.history.pushState({}, '', url);
    }
  }, 1e3);
};