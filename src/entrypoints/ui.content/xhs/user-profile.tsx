import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { extension, website } from "@/utils/messaging";
import copy from "copy-to-clipboard";
import { toast } from "sonner";

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

const Component = () => {
  const userId = location.pathname.split('/').reverse()[0];
  const [userPageData, setUserPageData] = useState<UserPageData>();

  useEffect(() => {
    website.sendMessage("getWindowValue", ["__INITIAL_STATE__", "user", "userPageData", "_rawValue"])
      .then(res => setUserPageData(res));
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
    extension.sendMessage('openTaskDialog', {
      name: 'author-post',
      author: {
        id: userId,
        name: userPageData!.basicInfo.nickname,
        url: location.href
      }
    })
  }

  return (userPageData && <>
    <Logo />
    <Button onClick={copyUserData}>复制博主信息</Button>
    <Button onClick={handlerOpenExportDialog}>导出笔记数据</Button>
  </>);
};

export default defineSocialMediaCopilotUi({
  name: 'social-media-copilot-xhs-user-profile',
  position: "inline",
  className: "flex pt-[20px] gap-4",
  matches: ["*://www.xiaohongshu.com/user/profile/*"],
  anchor: "#userPageContainer .user-info .info-part .info",
  children: <Component />
});