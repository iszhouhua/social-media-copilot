import { CopyButton, CopyOption } from "@/components/copy/copy-button";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { throttle } from "lodash";
import { visionProfile, VisionProfileResult } from "../api/vision-profile";


type Props = {
    userId: string;
};

const Component = ({ userId }: Props) => {
    const [profileInfo, setProfileInfo] = useState<VisionProfileResult>();

    const getUserInfo = async () => {
        if (profileInfo?.profile?.user_id === userId) return profileInfo;
        const response = await visionProfile({ userId });
        setProfileInfo(response.visionProfile.userProfile);
        return response.visionProfile.userProfile;
    }

    const copyOptions: CopyOption[] = [{
        label: "达人ID",
        value: "profile.user_id"
    }, {
        label: "达人昵称",
        value: "profile.user_name"
    }, {
        label: "作品数",
        value: "ownerCount.photo_public",
        hidden: true
    }, {
        label: "粉丝数",
        value: "ownerCount.fan",
        hidden: true
    }, {
        label: "关注",
        value: "ownerCount.follow",
        hidden: true
    }, {
        label: "个人介绍",
        value: "profile.user_text"
    }];

    const handlerOpenExportDialog = async () => {
        const userInfo = await getUserInfo();
        sendMessage("openTaskDialog", {
            name: "author-post",
            author: {
                authorId: userId,
                authorName: userInfo.profile.user_name,
                postCount: userInfo?.ownerCount.photo_public,
                url: "https://kuaishou.com/profile/" + userId
            }
        });
    }

    return (<div className="flex gap-4">
        <Logo />
        <CopyButton size="sm" options={copyOptions} getData={getUserInfo}>复制达人信息</CopyButton>
        <Button size="sm" onClick={throttle(handlerOpenExportDialog, 2000)}>导出视频数据</Button>
    </div>);
};

export default defineSocialMediaCopilotUi({
    name: "user-profile",
    position: "inline",
    anchor: ".profile-view div.profile-top",
    matches: ["*://www.kuaishou.com/profile/*"],
    render: ({ root, remove }) => {
        const userId = location.pathname.split('/')[2];
        if (!userId) {
            return remove();
        }
        return root.render(<Component userId={userId} />);
    },
});