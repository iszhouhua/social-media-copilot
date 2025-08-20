import { CopyButton, CopyOption } from "@/components/copy/copy-button";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { defineSocialMediaCopilotUi } from "@/utils/ui";
import { throttle } from "lodash";
import { toast } from "sonner";
import { webV1Feed } from "../api/note";
import { getPostMedias } from "../utils/media";

const Component = (props: {
  noteId: string;
  xsecToken: string;
}) => {
  const { noteId, xsecToken } = props;
  const [noteCard, setNoteCard] = useState<XhsAPI.NoteCard>();

  const getNoteCard = async () => {
    if (noteCard) return noteCard;
    const res = await webV1Feed(noteId, 'pc_feed', xsecToken);
    const card = res.items?.[0]?.note_card;
    setNoteCard(card);
    return card;
  };

  const downloadMedia = async () => {
    const noteCard = await getNoteCard();
    const files = getPostMedias(noteCard, ['video']);
    for (const file of files) {
      await sendMessage("download", {
        filename: file.filename,
        url: file.url,
      });
    }
    toast.success("下载成功");
  };

  const handleOpenDialog = async () => {
    const noteCard = await getNoteCard();
    sendMessage('openTaskDialog', {
      name: 'post-comment',
      post: {
        postId: noteCard.note_id,
        commentCount: parseInt(noteCard.interact_info?.comment_count),
        title: noteCard.title,
        url: location.href
      }
    })
  }

  const copyOptions: CopyOption[] = [{
    label: "笔记ID",
    value: "note_id"
  }, {
    label: "点赞数",
    value: "interact_info.liked_count",
    hidden: true
  }, {
    label: "收藏数",
    value: "interact_info.collected_count",
    hidden: true
  }, {
    label: "评论数",
    value: "interact_info.comment_count",
    hidden: true
  }, {
    label: "分享数",
    value: "interact_info.share_count",
    hidden: true
  }, {
    label: "笔记标题",
    value: "title"
  }, {
    label: "笔记内容",
    value: "desc"
  }];

  return (<>
    <Logo />
    <Button size="sm" onClick={throttle(downloadMedia, 3000)}>下载笔记视频/图片</Button>
    <CopyButton size="sm" options={copyOptions} getData={getNoteCard}>复制笔记信息</CopyButton>
    <Button size="sm" onClick={throttle(handleOpenDialog, 2000)}>导出评论</Button>
  </>);
};

export default defineSocialMediaCopilotUi({
  name: 'social-media-copilot-xhs-explore',
  position: "inline",
  append: "after",
  className: "flex px-6 pb-[24px] gap-4",
  matches: ["*://www.xiaohongshu.com/explore/*"],
  anchor: "#noteContainer > div.interaction-container > div.author-container",
  render: ({ root, remove }) => {
    const noteId = location.pathname.split("/").reverse()[0];
    const xsecToken = new URL(location.href).searchParams.get("xsec_token") as string;
    if (!noteId || !xsecToken) {
      remove();
      return;
    }
    root.render(<Component noteId={noteId} xsecToken={xsecToken} />);
  }
});