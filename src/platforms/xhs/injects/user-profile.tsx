import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
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

const Component = (props: {
  userId: string
  userPageData: UserPageData
}) => {
  const { userId, userPageData } = props;
  const taskDialog = useTaskDialog('author-post');

  const copyUserData = () => {
    let content = `博主名称:${userPageData.basicInfo.nickname}
    小红书号:${userPageData.basicInfo.redId}
    粉丝数:${userPageData.interactions?.find(item => item.type === "fans")?.count}
    个人简介:${userPageData.basicInfo.desc}`;
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
        authorName: userPageData.basicInfo.nickname,
      }
    })
  }

  return (<>
    <Logo />
    <Button onClick={() => window.open(`https://pgy.xiaohongshu.com/solar/pre-trade/blogger-detail/${userId}`)}>前往蒲公英主页</Button>
    <Button onClick={copyUserData}>复制博主信息</Button>
    <Button onClick={handlerOpenExportDialog}>导出笔记数据</Button>
  </>);
};

export default defineInjectContentScriptUi({
  position: "inline",
  className: "flex pt-[20px] gap-4",
  isMatch: () => /^\/user\/profile\/[a-zA-Z0-9]{24}$/.test(location.pathname),
  anchor: "#userPageContainer .user-info .info-part .info",


  async onMount({ mounted, remove }) {
    const res = await browser.runtime.sendMessage<"executeScript">({
      name: "executeScript",
      body: "const data = window[\"__INITIAL_STATE__\"].user.userPageData;return data._rawValue||data._value||data;"
    });
    if (!res?.basicInfo) {
      return remove();
    }
    const userId = location.pathname.split("/")[3];
    mounted.render(<Component userId={userId} userPageData={res} />);
  }
});