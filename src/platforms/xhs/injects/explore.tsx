import { Button } from "@/components/ui/button";
import JSZip from "jszip";
import copy from "copy-to-clipboard";
import { toast } from "sonner";
import { throttle } from "lodash";
import { Logo } from "@/components/logo";
import { NoteCard, webV1Feed } from "../http/note";

const Component = (props: {
  noteId: string;
  isVideo: boolean;
}) => {
  const { noteId, isVideo } = props;
  const taskDialog = useTaskDialog('post-comment');
  const [noteCard, setNoteCard] = useState<NoteCard>();

  const getNoteCard = async () => {
    try {
      if (noteCard) return noteCard;
      const search = new URLSearchParams(location.search);
      const xsec_token = search.get("xsec_token");
      if (!xsec_token) {
        throw new Error("笔记信息获取失败，缺少xsec_token参数！");
      }
      const detail = await webV1Feed(noteId, search.get("source") || "pc_feed", xsec_token, ["jpg"])
        .then(res => res.items?.[0]?.note_card);
      setNoteCard(detail);
      return detail;
    } catch (e: any) {
      toast.error(e.message);
      throw e;
    }
  };

  const exportMedia = async () => {
    const note = await getNoteCard();
    const filename = (note.title || noteId) + (note.type == "video" ? ".mp4" : ".zip");
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
    await browser.runtime.sendMessage<"download">({ name: "download", body: { url, filename } });
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
    taskDialog.open({
      post: {
        postId: note.note_id,
        commentCount: parseInt(note.interact_info?.comment_count),
        title: note.title
      }
    })
  }

  return (<>
    <Logo />
    <Button onClick={throttle(exportMedia, 2000)}>{isVideo ? "下载无水印视频" : "下载笔记图片"}</Button>
    <Button onClick={throttle(copyContent, 2000)}>复制文案</Button>
    <Button onClick={throttle(handleOpenDialog, 2000)}>导出评论</Button>
  </>);
};

export default defineInjectContentScriptUi({
  position: "inline",
  append: "after",
  className: "flex px-6 pb-[24px] gap-4",
  isMatch: () => /^\/explore\/[a-zA-Z0-9]{24}$/.test(location.pathname),
  anchor: "#noteContainer > div.interaction-container > div.author-container",
  async onMount({ mounted, remove }) {
    const res = await browser.runtime.sendMessage<"executeScript">({
      name: "executeScript",
      body: "const noteId = location.pathname.split(\"/\")[2];return window[\"__INITIAL_STATE__\"]?.note?.noteDetailMap[noteId];"
    });
    const noteId = location.pathname.split("/").reverse()[0];
    if (!noteId || noteId.length != 24) {
      return remove();
    }
    const isVideo = !!document.querySelector('#noteContainer[data-type="video"]');
    mounted.render(<Component noteId={noteId} isVideo={isVideo} />);
  }
});