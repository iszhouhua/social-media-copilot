import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { webV1Feed } from "@/services/xhs/note";
import { extension, website } from "@/utils/messaging";
import { sendMessage } from "@/utils/messaging/extension";
import copy from "copy-to-clipboard";
import JSZip from "jszip";
import { throttle } from "lodash";
import { toast } from "sonner";

const Component = () => {
  const [noteInfo, setNoteInfo] = useState<{
    noteId: string;
    type: "video" | "normal";
    title: string;
    desc: string;
    xsecToken: string;
  }>();

  useEffect(() => {
    const noteId = location.pathname.split("/").reverse()[0];
    website.sendMessage("getWindowValue", ["__INITIAL_STATE__", "note", "noteDetailMap", noteId])
      .then(res => setNoteInfo(res.note));
  }, []);

  const getNoteCard = async () => {
    const search = new URLSearchParams(location.search);
    const xsec_token = search.get("xsec_token");
    if (!xsec_token) {
      throw new Error("笔记信息获取失败，缺少xsec_token参数！");
    }
    const detail = await webV1Feed(noteInfo?.noteId!, search.get("source") || "pc_feed", xsec_token, ["jpg"])
      .then(res => res.items?.[0]?.note_card);
    return detail;
  };

  const exportMedia = async () => {
    const note = await getNoteCard();
    const filename = (note.title || noteInfo?.noteId) + (note.type == "video" ? ".mp4" : ".zip");
    let url: string;
    if (note.type == "video") {
      const hosts = ["https://sns-video-bd.xhscdn.com/", "https://sns-video-hw.xhscdn.com/"];
      const randomIndex = Math.floor(Math.random() * hosts.length);
      const videoKey = note.video?.consumer?.origin_video_key;
      url = hosts[randomIndex] + videoKey;
    } else {
      const zip = new JSZip();
      note.image_list.forEach((item, index) => {
        const image = item.url_default || item.url_pre;
        const imageData = fetch(image).then((res) => res.blob());
        zip.file(`图${index + 1}.jpg`, imageData, { binary: true });
        if (item.live_photo) {
          for (const key of Object.keys(item.stream)) {
            const liveUrl = item.stream?.[key]?.[0]?.master_url;
            if (liveUrl) {
              const liveData = fetch(liveUrl).then((res) => res.blob());
              zip.file(`图${index + 1}.mp4`, liveData, { binary: true });
            }
          };
        }
      });
      const blob = await zip.generateAsync({ type: "blob" });
      url = URL.createObjectURL(blob);
    }
    await sendMessage("download", { url, filename });
    toast.success("下载成功");
    URL.revokeObjectURL(url);
  };

  const copyContent = async () => {
    const note = await getNoteCard();
    let content = `标题：${note.title}\n内容：${note.desc}`;
    if (copy(content)) {
      toast.success("复制成功");
    } else {
      toast.error("复制失败");
    }
  };

  const handleOpenDialog = async () => {
    const note = await getNoteCard();
    extension.sendMessage('openTaskDialog', {
      name: 'post-comment',
      post: {
        postId: note.note_id,
        commentCount: parseInt(note.interact_info?.comment_count),
        title: note.title,
        url: location.href
      }
    })
  }

  return (noteInfo && <>
    <Logo />
    <Button onClick={throttle(exportMedia, 2000)}>{noteInfo.type == "video" ? "下载无水印视频" : "下载笔记图片"}</Button>
    <Button onClick={throttle(copyContent, 2000)}>复制文案</Button>
    <Button onClick={throttle(handleOpenDialog, 2000)}>导出评论</Button>
  </>);
};

export default defineSocialMediaCopilotUi({
  name: 'social-media-copilot-xhs-explore',
  position: "inline",
  append: "after",
  className: "flex px-6 pb-[24px] gap-4",
  matches: ["*://www.xiaohongshu.com/explore/*"],
  anchor: "#noteContainer > div.interaction-container > div.author-container",
  children: <Component />
});