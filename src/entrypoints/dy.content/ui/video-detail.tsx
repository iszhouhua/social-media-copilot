import { CopyButton, CopyOption } from "@/components/copy/copy-button";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { createSocialMediaCopilotUi, defineSocialMediaCopilotUi } from "@/utils/ui";
import { throttle } from "lodash";
import { toast } from "sonner";
import { aweme as awemeApi } from "../api";
import { getPostMedias } from "../utils/media";

export const Component = (props: {
  type: "video" | "note";
  awemeId: string;
  isMix?: boolean;
}) => {
  const [aweme, setAweme] = useState<DouyinAPI.AwemeDetail>();

  const getAweme = async () => {
    if (aweme) return aweme;
    const awemeDetail = await awemeApi.awemeDetail(props.awemeId).then(res => res.aweme_detail);
    setAweme(awemeDetail);
    return awemeDetail;
  }


  const handlerDownloadVideo = async () => {
    const aweme = await getAweme();
    const files = getPostMedias(aweme, ["video"]);
    for (const file of files) {
      await sendMessage("download", {
        filename: file.filename,
        url: file.url,
      });
    }
    toast.success("下载成功");
  };

  const handleOpenDialog = async () => {
    const aweme = await getAweme();
    sendMessage('openTaskDialog', {
      name: 'post-comment',
      post: {
        postId: props?.awemeId,
        commentCount: aweme.statistics.comment_count,
        title: aweme.desc,
        url: "https://www.douyin.com/video/" + props?.awemeId
      }
    });
  }

  const handlerDownloadMix = async () => {
    const aweme = await getAweme();
    const mixId = aweme.mix_info?.mix_id;
    if (!mixId) {
      toast.error("获取合集信息失败，当前视频可能并非合集");
      return;
    }
    sendMessage('openTaskDialog', {
      name: 'mix-post',
      mixInfo: aweme.mix_info
    });
  }

  const copyOptions: CopyOption[] = [{
    label: "视频ID",
    value: "aweme_id"
  }, {
    label: "点赞数",
    value: "statistics.digg_count",
    hidden: true
  }, {
    label: "收藏数",
    value: "statistics.collect_count",
    hidden: true
  }, {
    label: "评论数",
    value: "statistics.comment_count",
    hidden: true
  }, {
    label: "分享数",
    value: "statistics.share_count",
    hidden: true
  }, {
    label: "视频描述",
    value: "desc"
  }];

  return (<>
    <Logo />
    <Button size="sm" className="text-xs h-8 px-2" onClick={throttle(handlerDownloadVideo, 2000)}>{props?.type === "note" ? "下载图集" : "下载无水印视频"}</Button>
    <CopyButton size="sm" className="text-xs h-8 px-2" options={copyOptions} getData={getAweme}>复制视频信息</CopyButton>
    <Button size="sm" className="text-xs h-8 px-2" onClick={throttle(handleOpenDialog, 2000)}>导出评论</Button>
    {props?.isMix && <Button size="sm" className="text-xs h-8 px-2" onClick={throttle(handlerDownloadMix, 2000)}>导出合集</Button>}
  </>);
};

const ui = defineSocialMediaCopilotUi({
  name: 'social-media-copilot-dy-video',
  position: "inline",
  className: "z-50 flex gap-4 bg-transparent mr-8",
  isolateEvents: true,
  anchor: () => {
    const activeVideo = document.querySelectorAll('div[data-e2e="feed-active-video"] xg-right-grid');
    return activeVideo?.length > 0 ? activeVideo[activeVideo.length - 1] : document.querySelector('xg-right-grid');
  },
  append: "before",
  matches: ["*://www.douyin.com/video/*", "*://www.douyin.com/note/*", (url) => {
    return url.pathname === "/" || !!url.searchParams.get('modal_id');
  }],
  render: ({ root }) => {
    if (listenerTimerId) {
      clearTimeout(listenerTimerId);
      listenerTimerId = undefined;
    }
    if (remove) {
      remove();
      remove = undefined;
    };
    if (location.pathname === '/') {
      recommendListener();
    }
    const match = location.pathname.match(/^\/(video|note)\/(\d+)$/);
    let type: any, awemeId: string, isMix: boolean;
    if (match) {
      const awemeMix = document.querySelector('div[data-e2e="aweme-mix"]');
      type = match[1];
      awemeId = match[2];
      isMix = !!awemeMix;
    } else {
      const activeVideo = document.querySelector("div[data-e2e=\"feed-active-video\"]");
      if (!activeVideo) return root;
      awemeId = activeVideo.getAttribute("data-e2e-vid") as string;
      type = activeVideo.querySelector(".account-card")?.textContent === "图文" ? "note" : "video";
      isMix = !!activeVideo.querySelector(".mix-detail-container");
      if (!isMix && activeVideo.querySelector('.under-title-tag')?.textContent?.startsWith('合集')) {
        isMix = true;
      }
    }
    root.render(<Component type={type} awemeId={awemeId} isMix={isMix} />);
  }
});


/**
 * 监听推荐页视频变化
 */
let listenerTimerId: number | undefined;
let remove: (() => void) | undefined;
const recommendListener = function () {
  listenerTimerId = window.setInterval(() => {
    const activeVideo = document.querySelector('div[data-e2e="feed-active-video"] xg-right-grid');
    if (!activeVideo) {
      if (location.pathname !== '/') clearInterval(listenerTimerId);
      return;
    }
    if (!activeVideo.hasAttribute('social-media-copilot-dy-video')) {
      clearInterval(listenerTimerId);
      createSocialMediaCopilotUi(ui)
        .then(f => remove = f);
    }
  }, 1e3);
};

export default ui;