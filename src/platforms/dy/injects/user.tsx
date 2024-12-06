import { Button } from "@/components/ui/button";
import { throttle } from "lodash";
import { user } from "@/platforms/dy/http";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import copy from "copy-to-clipboard";
import ReactDOM from "react-dom/client";

const App = (props: {
    userId: string
}) => {
    const { userId } = props;
    const [userInfo, setUserInfo] = useState<user.UserInfo>();
    const taskDialog = useTaskDialog('author-post');


    const getUserInfo = async () => {
        if (userInfo) return userInfo;
        // 仅第一次请求时从接口获取数据
        const userProfile = await user.userProfileOther(userId);
        setUserInfo(userProfile.user);
        return userProfile.user;
    }

    const handlerOpenExportDialog = () => {
        getUserInfo()
            .then((user) => {
                taskDialog.open({
                    author: {
                        authorId: userId,
                        authorName: user.nickname,
                        postCount: user.aweme_count
                    }
                })
            }).catch((err) => {
                toast.error(`达人信息获取失败:${err.message}`);
            })
    }

    const copyUserData = async () => {
        const userInfo = await getUserInfo();
        let content = `达人名称:${userInfo.nickname}
      抖音号:${userInfo.unique_id || userInfo.short_id}
      粉丝数:${userInfo.follower_count}
      个人简介:${userInfo.signature}`;
        if (copy(content)) {
            toast.success("复制成功");
        } else {
            toast.error("复制失败");
        }
    }

    return (<>
        <Logo />
        <Button onClick={throttle(copyUserData, 2000)}>复制达人信息</Button>
        <Button onClick={throttle(handlerOpenExportDialog, 2000)}>导出视频数据</Button>
    </>);
};

const options: SmcContentScriptUiOptions = {
    position: "inline",
    anchor: "//div[@data-e2e='user-info']/..",
    append: "after",
    isMatch: (url: URL) =>  url.pathname.startsWith('/user/'),
    onMount: (container: HTMLElement) => {
        container.className = "max-w-[1208px] my-[20px] mx-auto flex gap-4";
        const root = ReactDOM.createRoot(container);
        let userId = location.pathname.split("/")[2];
        root.render(<App userId={userId} />);
        return root;
    },
    onRemove: (root: ReactDOM.Root) => {
        root?.unmount();
    }
}
export default options;