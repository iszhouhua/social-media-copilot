import { Button } from "@/components/ui/button";
import copy from "copy-to-clipboard";
import { toast } from "sonner";
import { throttle } from "lodash";
import { Logo } from "@/components/logo";
import { NoteCard, webV1Feed } from "../http/note";
import ReactDOM from "react-dom/client";

const App = (props: {
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
      const detail = await webV1Feed(noteId, search.get("source") || "pc_feed", xsec_token)
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
    const filename = (note.title || noteId);
    if (note.type == "video") {
      const videoKey = note.video?.consumer?.origin_video_key;
      const url = "https://sns-video-bd.xhscdn.com/" + videoKey;
      await browser.runtime.sendMessage<"download">({ name: "download", body: { url, filename } });
    } else {
      note.image_list.forEach((item, index) => {
        const image = item.url_default || item.url_pre;
        browser.runtime.sendMessage<"download">({ name: "download", body: { url: image, filename: (note.title || noteId) + `图${index + 1}.png` } });
        if (item.live_photo) {
          for (const key of Object.keys(item.stream)) {
            const liveUrl = item.stream?.[key]?.[0]?.master_url;
            if (liveUrl) {
              browser.runtime.sendMessage<"download">({ name: "download", body: { url: liveUrl, filename: (note.title || noteId) + `图${index + 1}.mp4` } });
            }
          };
        }
      });
    }
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


const options: SmcContentScriptUiOptions = {
  position: "inline",
  anchor: "#noteContainer > div.interaction-container > div.author-container",
  append: "after",
  isMatch: (url: URL) =>  /^\/explore\/[a-zA-Z0-9]{24}$/.test(url.pathname),
  onMount: (container: HTMLElement) => {
      container.className = "flex px-6 pb-[24px] gap-4";
      const root = ReactDOM.createRoot(container);
      const noteId = location.pathname.split("/").reverse()[0];
      const isVideo = !!document.querySelector('#noteContainer[data-type="video"]');
      root.render(<App noteId={noteId} isVideo={isVideo} />);
      return root;
  },
  onRemove: (root: ReactDOM.Root) => {
      root?.unmount();
  }
}
export default options;