import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { aweme as api } from "@/services/dy";
import { extension } from "@/utils/messaging";
import JSZip from "jszip";
import { throttle } from "lodash";
import { toast } from "sonner";

export const Component = () => {
  const [awemeInfo, setAwemeInfo] = useState<{
    type: "video" | "note";
    awemeId: string;
    isMix?: boolean;
  }>();

  useEffect(() => {
    const match = location.pathname.match(/^\/(video|note)\/(\d+)$/);
    if (match) {
      const awemeMix = document.querySelector('div[data-e2e="aweme-mix"]');
      setAwemeInfo({
        type: match[1] as any,
        awemeId: match[2],
        isMix: !!awemeMix
      });
      return;
    }
    const activeVideo = document.querySelector("div[data-e2e=\"feed-active-video\"]");
    if (!activeVideo) return;
    const awemeId = activeVideo.getAttribute("data-e2e-vid");
    if (!awemeId) return;
    const type = activeVideo.querySelector(".account-card")?.textContent === "图文" ? "note" : "video";
    let isMix = !!activeVideo.querySelector(".mix-detail-container");
    if (!isMix && activeVideo.querySelector('.under-title-tag')?.textContent?.startsWith('合集')) {
      isMix = true;
    }
    setAwemeInfo({ type, awemeId, isMix });
  }, []);

  const handlerDownloadVideo = async () => {
    const aweme = await api.awemeDetail(awemeInfo?.awemeId!).then(res => res.aweme_detail);
    if (!aweme) {
      toast.error("获取视频信息失败");
      return;
    }
    let url: string;
    if (aweme.media_type === 2) {
      const zip = new JSZip();
      aweme.images?.map((item) => item.url_list.reverse()[0]).forEach((image, index) => {
        const imageData = fetch(image).then((res) => res.blob());
        zip.file(`图${index + 1}.jpeg`, imageData, { binary: true });
      });
      const blob = await zip.generateAsync({ type: "blob" });
      url = URL.createObjectURL(blob);
    } else if (aweme.media_type === 4) {
      const vid = aweme.video.play_addr.uri;
      url = `https://aweme.snssdk.com/aweme/v1/play/?video_id=${vid}`;
    } else {
      toast.error("媒体类型非法");
      return;
    }
    const filename = (aweme.desc || aweme.aweme_id) + (awemeInfo?.type === "note" ? ".zip" : ".mp4");
    await extension.sendMessage("download", { url, filename });
    toast.success("下载成功");
    URL.revokeObjectURL(url);
  };

  const handleOpenDialog = async () => {
    const aweme = await api.awemeDetail(awemeInfo?.awemeId!).then(res => res.aweme_detail);
    extension.sendMessage('openTaskDialog', {
      name: 'post-comment',
      post: {
        postId: awemeInfo?.awemeId,
        commentCount: aweme.statistics.comment_count,
        title: aweme.desc,
        url: "https://www.douyin.com/video/" + awemeInfo?.awemeId
      }
    });
  }

  const handlerDownloadMix = async () => {
    const aweme = await api.awemeDetail(awemeInfo?.awemeId!).then(res => res.aweme_detail);
    const mixId = aweme.mix_info?.mix_id;
    if (!mixId) {
      toast.error("获取合集信息失败");
      return;
    }
    extension.sendMessage('openTaskDialog', {
      name: 'mix-post',
      mixInfo: aweme.mix_info
    });
  }

  return (awemeInfo && <>
    <Logo />
    <Button size="sm" onClick={throttle(handlerDownloadVideo, 2000)}>{awemeInfo?.type === "note" ? "下载图集" : "下载无水印视频"}</Button>
    <Button size="sm" onClick={throttle(handleOpenDialog, 2000)}>导出评论</Button>
    {awemeInfo?.isMix && <Button size="sm" onClick={throttle(handlerDownloadMix, 2000)}>导出合集</Button>}
  </>);
};

const ui = defineSocialMediaCopilotUi({
  name: 'social-media-copilot-dy-video',
  position: "inline",
  className: "flex gap-4 bg-transparent mr-8",
  anchor: () => {
    const activeVideo = document.querySelector('div[data-e2e="feed-active-video"] xg-right-grid');
    return activeVideo ?? document.querySelector('xg-right-grid');
  },
  append: "before",
  matches: ["*://www.douyin.com/video/*", "*://www.douyin.com/note/*", (url: URL) => {
    if (url.pathname === "/") {
      recommendListener();
      return true;
    };
    const modalId = new URLSearchParams(url.search).get("modal_id");
    if (!modalId) return false;
    return /^[0-9]+$/.test(modalId);
  }],
  children: <Component />,
});


/**
 * 监听推荐页视频变化
 */
let listenerTimerId: number;
const recommendListener = function () {
  clearTimeout(listenerTimerId);
  listenerTimerId = window.setInterval(() => {
    const activeVideo = document.querySelector('div[data-e2e="feed-active-video"] xg-right-grid');
    if (!activeVideo) {
      clearInterval(listenerTimerId);
      return;
    }
    if (!activeVideo.hasAttribute('social-media-copilot-dy-video')) {
      clearInterval(listenerTimerId);
      ui.mount();
    }
  }, 1e3);
};

export default ui;