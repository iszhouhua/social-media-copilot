import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import copy from "copy-to-clipboard";
import { toast } from "sonner";
import ReactDOM from "react-dom/client";

type UserPageData = {
  basicInfo: {
    desc: string
    gender: number
    imageb: string
    images: string
    ipLocation: string
    nickname: string
    redId: string
  }
  extraInfo: {

    blockType: string
    fstatus: string
  }
  interactions: Array<{
    count: string
    name: string
    type: string
  }>
  tags: Array<{
    name: string
    tagType: string
  }>
}

const App = (props: {
  userId: string
}) => {
  const { userId } = props;
  const [userPageData,setUserPageData] = useState<UserPageData>();
  const taskDialog = useTaskDialog('author-post');

  useEffect(() => {
    browser.runtime.sendMessage<"executeScript">({
      name: "executeScript",
      body: "const data = window[\"__INITIAL_STATE__\"].user.userPageData;return data._rawValue||data._value||data;"
    }).then(setUserPageData);
  }, []);

  const copyUserData = () => {
    let content = `博主名称:${userPageData!.basicInfo.nickname}
    小红书号:${userPageData!.basicInfo.redId}
    粉丝数:${userPageData!.interactions?.find(item => item.type === "fans")?.count}
    个人简介:${userPageData!.basicInfo.desc}`;
    if (copy(content)) {
      toast.success("复制成功");
    } else {
      toast.error("复制失败");
    }
  }

  const handlerOpenExportDialog = () => {
    taskDialog.open({
      author: {
        authorId: userId,
        authorName: userPageData!.basicInfo.nickname,
      }
    })
  }

  return (userPageData && <>
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