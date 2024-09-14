import { defineContentScriptUI, getAnchor, triggerCreateContentScriptUI } from "../ui";
import { Button } from "@/components/ui/button";
import icon from "@/public/icon/32.png";
import React from "react";
import { throttle } from "lodash";
import { browser } from "wxt/browser";
import { toast } from "sonner";
import { CommentExportDialog } from "@/components/comment/single-export-dialog";
import JSZip from "jszip";
import { getAwemeDetail } from "@/services/dy/aweme";
import type { AwemeDetail } from "@/services/dy/aweme.d";

const App = (props: {
  type: "video" | "note";
  awemeId: string;
}) => {
  const { type, awemeId } = props;
  const [aweme, setAweme] = React.useState<AwemeDetail>();
  const [openDialog, setOpenDialog] = React.useState<boolean>(false);

  const handlerDownloadVideo = async () => {
    const aweme = await getAweme();
    if (!aweme) {
      toast.error("获取视频信息失败");
      return;
    }
    let url: string;
    if (aweme.media_type === 2) {
      const zip = new JSZip();
      aweme.images?.map((item) => item.url_list.reverse()[0]).forEach((image, index) => {
        const imageData = fetch(image).then((res) => res.blob());
        zip.file(`图${index + 1}.png`, imageData, { binary: true });
      });
      const blob = await zip.generateAsync({ type: "blob" });
      url = URL.createObjectURL(blob);
    } else {
      const vid = aweme.video.play_addr.uri;
      url = `https://aweme.snssdk.com/aweme/v1/play/?video_id=${vid}`;
    }
    const filename = (aweme.desc || aweme.aweme_id) + (type === "note" ? ".zip" : ".mp4");
    await browser.runtime.sendMessage<"download">({ name: "download", body: { url, filename } });
    URL.revokeObjectURL(url);
  };

  const getAweme = async () => {
    if (aweme) return aweme;
    const awemeDetail = await getAwemeDetail(awemeId).then(res => res.aweme_detail);
    setAweme(awemeDetail);
    return awemeDetail;
  };

  const handleOpenDialog = async () => {
    await getAweme();
    setOpenDialog(true);
  }

  return (<>
    <img src={icon} alt="社媒助手"></img>
    <Button size="sm" onClick={throttle(handlerDownloadVideo, 2000)}>{type === "note" ? "下载图集" : "下载无水印视频"}</Button>
    <Button size="sm" onClick={throttle(handleOpenDialog, 2000)}>导出评论</Button>
    {openDialog && <CommentExportDialog onClose={() => setOpenDialog(false)} postId={awemeId} maxValue={aweme?.statistics?.comment_count ?? 0} />}
  </>);
};

// 视频详情页
const detailDefinition = defineContentScriptUI({
  position: "inline",
  className: "flex gap-4 bg-transparent mr-8",
  isMatch: () => /^\/(video|note)\/(\d+)$/.test(location.pathname),
  anchor: "xg-right-grid",
  append: "before",
  async onMount({ mounted, remove }) {
    const match = location.pathname.match(/^\/(video|note)\/(\d+)$/);
    if (!match) return remove();
    mounted.render(<App type={match[1] as any} awemeId={match[2]} />);
  }
});

// 视频推荐页
const recommendDefinition = defineContentScriptUI({
  ...detailDefinition,
  isMatch: () => {
    if (detailDefinition.isMatch()) return false;
    if (location.pathname === "/") return true;
    const modalId = new URLSearchParams(location.search).get("modal_id");
    if (!modalId) return false;
    return /^[0-9]+$/.test(modalId);
  },
  anchor: "div[data-e2e=\"feed-active-video\"] xg-right-grid",
  async onMount({ mounted, remove, anchor }) {
    const activeVideo = document.querySelector("div[data-e2e=\"feed-active-video\"]");
    if (!activeVideo) return remove();
    const awemeId = activeVideo.getAttribute("data-e2e-vid");
    if (!awemeId) return remove();
    const type = activeVideo.querySelector(".account-card")?.textContent === "图文" ? "note" : "video";
    mounted.render(<App type={type} awemeId={awemeId} />);

    if (location.pathname === "/") {
      // 首页需要监听视频变化
      recommendListener(anchor);
    } else {
      // 其余页面不需要监听
      clearTimeout(listenerTimerId);
    }
  }
});

/**
 * 监听推荐视频变化
 */
let listenerTimerId: number;
const recommendListener = function (anchor: Element) {
  clearTimeout(listenerTimerId);
  listenerTimerId = window.context.setInterval(() => {
    if (!recommendDefinition.isMatch()) {
      clearInterval(listenerTimerId);
      return;
    }
    const newAnchor = getAnchor(recommendDefinition);
    if (newAnchor !== anchor) {
      // 节点变了，触发创建
      clearInterval(listenerTimerId);
      triggerCreateContentScriptUI();
    }
  }, 500);
};
