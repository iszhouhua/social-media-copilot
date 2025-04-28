import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import copy from "copy-to-clipboard";
import { toast } from "sonner";
import ReactDOM from "react-dom/client";
import { webV1UserOtherinfo } from "../http/user";

const App = (props: {
  userId: string
}) => {
  const { userId } = props;
  const taskDialog = useTaskDialog('author-post');

  const copyUserData = async () => {
    const userPageData = await webV1UserOtherinfo(userId);
    let content = `博主名称:${userPageData.basic_info.nickname}
    小红书号:${userPageData!.basic_info.red_id}
    粉丝数:${userPageData!.interactions?.find(item => item.type === "fans")?.count}
    个人简介:${userPageData!.basic_info.desc}`;
    if (copy(content)) {
      toast.success("复制成功");
    } else {
      toast.error("复制失败");
    }
  }

  const handlerOpenExportDialog = async () => {
    const userPageData = await webV1UserOtherinfo(userId);
    taskDialog.open({
      author: {
        authorId: userId,
        authorName: userPageData!.basic_info.nickname,
      }
    })
  }

  return (<>
    <Logo />
    <Button onClick={copyUserData}>复制博主信息</Button>
    <Button onClick={handlerOpenExportDialog}>导出笔记数据</Button>
  </>);
};

const options: SmcContentScriptUiOptions = {
  position: "inline",
  anchor: "#userPageContainer .user-info .info-part .info",
  isMatch: (url: URL) =>  /^\/user\/profile\/[a-zA-Z0-9]{24}$/.test(url.pathname),
  onMount: (container: HTMLElement) => {
      container.className = "flex pt-[20px] gap-4";
      const root = ReactDOM.createRoot(container);
      const userId = location.pathname.split("/")[3];
      root.render(<App userId={userId} />);
      return root;
  },
  onRemove: (root: ReactDOM.Root) => {
      root?.unmount();
  }
}
export default options;