import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { user } from "@/services/dy";
import { extension, website } from "@/utils/messaging";
import copy from "copy-to-clipboard";
import { throttle } from "lodash";
import { toast } from "sonner";

const Component = () => {
    const [userId, setUserId] = useState<string>();

    useEffect(() => {
        let userId = location.pathname.split("/")[2];
        if (userId.startsWith('MS4wLjABAAAA')) {
            setUserId(userId);
        } else if (userId === 'self') {
            website.sendMessage("getWindowValue", ["SSR_RENDER_DATA", "app", "user", "info", "secUid"]).then(res => {
                setUserId(res);
            })
        }
    }, []);

    const copyUserData = async () => {
        const userProfile = await user.userProfileOther(userId!);
        const userInfo = userProfile.user;
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

    const handlerOpenExportDialog = async () => {
        const userProfile = await user.userProfileOther(userId!);
        const userInfo = userProfile.user;
        extension.sendMessage("openTaskDialog", {
            name: "author-post",
            author: {
                authorId: userId,
                authorName: userInfo?.nickname,
                postCount: userInfo?.aweme_count,
                url: location.href
            }
        });
    }

    return (userId && <>
        <Logo />
        <Button onClick={throttle(copyUserData, 2000)}>复制达人信息</Button>
        <Button onClick={throttle(handlerOpenExportDialog, 2000)}>导出视频数据</Button>
    </>);
};

export default defineSocialMediaCopilotUi({
    name: 'social-media-copilot-dy-user',
    position: "inline",
    className: "max-w-[1208px] my-[20px] mx-auto flex gap-4",
    anchor: "//div[@data-e2e='user-info']/..",
    append: "after",
    matches: ["*://www.douyin.com/user/*"],
    children: <Component />,
});