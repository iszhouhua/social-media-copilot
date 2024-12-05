import { Button } from "@/components/ui/button";
import { throttle } from "lodash";
import { toast } from "sonner";
import { aweme as api } from "@/platforms/dy/http";
import { Logo } from "@/components/logo";

export const Component = (props: {
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
    const awemeMix = document.querySelector('div[data-e2e="aweme-mix"]');
    mounted.render(<Component type={match[1] as any} awemeId={match[2]} isMix={!!awemeMix} />);
  }
});