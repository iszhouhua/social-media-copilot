import { Button } from "@/components/ui/button";
import JSZip from "jszip";
import copy from "copy-to-clipboard";
import { toast } from "sonner";
import { throttle } from "lodash";
import { Logo } from "@/components/logo";

type Note = {
  noteId: string
  type: "normal" | "video"
  title: string
  desc: string
  imageList: Array<{
    urlDefault: string
    urlPre: string
    width: number
    height: number
  }>
  video: {
    capa: {
      duration: number
    }
    consumer: {
      originVideoKey: string
    }
    image: {
      firstFrameFileid: string
      thumbnailFileid: string
    }
  }
  interactInfo: {
    collectedCount: string
    commentCount: string
    likedCount: string
    shareCount: string
  }
}

const Component = (props: {
  note: Note
}) => {
  const { note } = props;
  const taskDialog = useTaskDialog('post-comment');

  const exportMedia = async () => {
    const filename = (note.title || note.desc?.substring(0, 20) || note.noteId) + (note.type == "video" ? ".mp4" : ".zip");
    let url: string;
    if (note.type == "video") {
      const hosts = ["https://sns-video-bd.xhscdn.com/", "https://sns-video-hw.xhscdn.com/"];
      const randomIndex = Math.floor(Math.random() * hosts.length);
      const videoKey = note.video?.consumer?.originVideoKey;
      if(!videoKey){
        toast.error("视频链接获取失败,请刷新页面重试!");
        return
      }
      url = hosts[randomIndex] + videoKey;
    } else {
      const images = note?.imageList?.map((item: any) => item.urlDefault || item.urlPre);
      if(!images?.length){
        toast.error("图片链接获取失败,请刷新页面重试!");
        return
      }
      const zip = new JSZip();
      images.forEach((image, index) => {
        const imageData = fetch(image).then((res) => res.blob());
        zip.file(`图${index + 1}.png`, imageData, { binary: true });
      });
      const blob = await zip.generateAsync({ type: "blob" });
      url = URL.createObjectURL(blob);
    }
    await browser.runtime.sendMessage<"download">({ name: "download", body: { url, filename } });
    URL.revokeObjectURL(url);
  };

  const copyContent = () => {
    let content = `标题:${note.title}\n内容:${note.desc}`;
    if (copy(content)) {
      toast.success("复制成功");
    } else {
      toast.error("复制失败");
    }
  };

  const handleOpenDialog = async () => {
    taskDialog.open({
      post: {
        postId: note.noteId,
        commentCount: parseInt(note?.interactInfo?.commentCount),
        title: (note.title || note.desc?.substring(0, 20))
      }
    })
  }

  return (<>
    <Logo />
    <Button onClick={throttle(exportMedia, 2000)}>{note.type == "video" ? "下载无水印视频" : "下载笔记图片"}</Button>
    <Button onClick={copyContent}>复制文案</Button>
    <Button onClick={handleOpenDialog}>导出评论</Button>
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
    if (!res?.note) {
      return remove();
    }
    mounted.render(<Component note={res.note} />);
  }
});