import { Button } from "@/components/ui/button";
import { throttle } from "lodash";
import { toast } from "sonner";
import JSZip from "jszip";
import { aweme as api } from "@/platforms/dy/http";
import { Logo } from "@/components/logo";

export const Component = (props: {
  type: "video" | "note";
  awemeId: string;
}) => {
  const { type, awemeId } = props;
  const [aweme, setAweme] = useState<api.AwemeDetail>();
  const taskDialog = useTaskDialog('post-comment');

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
    } else if (aweme.media_type === 4) {
      const vid = aweme.video.play_addr.uri;
      url = `https://aweme.snssdk.com/aweme/v1/play/?video_id=${vid}`;
    } else {
      toast.error("媒体类型非法");
      return;
    }
    const filename = (aweme.desc || aweme.aweme_id) + (type === "note" ? ".zip" : ".mp4");
    await browser.runtime.sendMessage<"download">({ name: "download", body: { url, filename } });
    URL.revokeObjectURL(url);
  };

  const getAweme = async () => {
    if (aweme) return aweme;
    const awemeDetail = await api.awemeDetail(awemeId).then(res => res.aweme_detail);
    setAweme(awemeDetail);
    return awemeDetail;
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

  return (<>
    <Logo />
    <Button size="sm" onClick={throttle(handlerDownloadVideo, 2000)}>{type === "note" ? "下载图集" : "下载无水印视频"}</Button>
    <Button size="sm" onClick={throttle(handleOpenDialog, 2000)}>导出评论</Button>
  </>);
};

// 视频详情页
export default defineInjectContentScriptUi({
  position: "inline",
  className: "flex gap-4 bg-transparent mr-8",
  isMatch: () => /^\/(video|note)\/(\d+)$/.test(location.pathname),
  anchor: "xg-right-grid",
  append: "before",
  async onMount({ mounted, remove }) {
    const match = location.pathname.match(/^\/(video|note)\/(\d+)$/);
    if (!match) return remove();
    mounted.render(<Component type={match[1] as any} awemeId={match[2]} />);
  }
});