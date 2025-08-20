import { CopyButton, CopyOption } from "@/components/copy/copy-button";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { defineSocialMediaCopilotUi } from "@/utils/ui";
import { throttle } from "lodash";
import { user } from "../api";

const Component = ({ userId }: {
    userId: string
}) => {
    const [userInfo, setUserInfo] = useState<DouyinAPI.UserInfo>();

    const getUserInfo = async () => {
        if (userInfo) return userInfo;
        const userProfile = await user.userProfileOther(userId);
        const info = userProfile.user;
        if (!info.unique_id) info.unique_id = info.short_id;
        setUserInfo(info);
        return info;
    }

    const handlerOpenExportDialog = async () => {
        const userInfo = await getUserInfo();
        sendMessage("openTaskDialog", {
            name: "author-post",
            author: {
                authorId: userId,
                authorName: userInfo?.nickname,
                postCount: userInfo?.aweme_count,
                url: "https://www.douyin.com/user/" + userId
            }
        });
    }

    const copyOptions: CopyOption[] = [{
        label: "达人UID",
        value: "uid"
    }, {
        label: "抖音号",
        value: "unique_id"
    }, {
        label: "达人昵称",
        value: "nickname"
    }, {
        label: "粉丝数",
        value: "follower_count",
        hidden: true
    }, {
        label: "获赞",
        value: "total_favorited",
        hidden: true
    }, {
        label: "关注",
        value: "following_count",
        hidden: true
    }, {
        label: "个人简介",
        value: "signature"
    }];

    return (<>
        <Logo />
        <CopyButton size="sm" options={copyOptions} getData={getUserInfo}>复制达人信息</CopyButton>
        <Button size="sm" onClick={throttle(handlerOpenExportDialog, 2000)}>导出视频数据</Button>
    </>);
};

export default defineSocialMediaCopilotUi({
    name: 'social-media-copilot-dy-user',
    position: "inline",
    className: "max-w-[1208px] my-[20px] mx-auto flex gap-4",
    anchor: "//div[@data-e2e='user-info']/..",
    append: "after",
    matches: ["*://www.douyin.com/user/*"],
    render: ({ root, remove }) => {
        let userId = location.pathname.split("/")[2];
        if (userId.startsWith('MS4wLjABAAAA')) {
            root.render(<Component userId={userId} />);
        } else {
            remove();
        }
    }
});