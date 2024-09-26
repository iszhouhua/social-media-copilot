import { defineContentScriptUI } from "../ui";
import { Button } from "@/components/ui/button";
import React from "react";
import { AuthorPostExportDialog } from "@/components/task/author-post";
import { throttle } from "lodash";
import { xingtu, user } from "@/services/dy";
import { toast } from "sonner";
import { browser } from "wxt/browser";
import { Logo } from "@/components/logo";
import copy from "copy-to-clipboard";

const Component = (props: {
    userId: string
}) => {
    const { userId } = props;
    const [openDialog, setOpenDialog] = React.useState<boolean>(false);
    const [userInfo, setUserInfo] = React.useState<user.UserInfo>();
    const [starId, setStarId] = React.useState<string>("");


    const getUserInfo = async () => {
        if (userInfo) return userInfo;
        // 仅第一次请求时从接口获取数据
        const userProfile = await user.userProfileOther(userId);
        setUserInfo(userProfile.user);
        return userProfile.user;
    }

    const handlerOpenXingtu = async () => {
        try {
            const userInfo = await getUserInfo();
            if (!userInfo.official_cooperation) {
                toast.warning("当前达人尚未入驻星图，无法前往");
                return
            }
            let tempId = starId;
            if (!tempId) {
                // 仅第一次请求时从接口获取数据
                const xtInfo = await xingtu.entranceAuthorInfo(userInfo.uid);
                if (!xtInfo.id) {
                    throw new Error(xtInfo.base_resp?.status_message || "获取星图信息失败");
                }
                tempId = xtInfo.id;
                setStarId(xtInfo.id);
            }
            window.open(`https://www.xingtu.cn/ad/creator/author/douyin/${tempId}/1`);
        } catch (err: any) {
            console.error(err);
            toast.error(`达人信息获取失败:${err.message}`);
        }
    }

    const handlerOpenExportDialog = () => {
        getUserInfo()
            .then(() => setOpenDialog(true))
            .catch((err) => {
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
        <Button onClick={throttle(handlerOpenXingtu, 2000)}>前往星图主页</Button>
        <Button onClick={throttle(copyUserData, 2000)}>复制达人信息</Button>
        <Button onClick={throttle(handlerOpenExportDialog, 2000)}>导出视频数据</Button>
        {openDialog && <AuthorPostExportDialog onClose={() => setOpenDialog(false)} authorId={userId} authorName={userInfo?.nickname} />}
    </>);
};

export default defineContentScriptUI({
    position: "inline",
    className: "max-w-[1208px] my-[20px] mx-auto flex gap-4",
    anchor: "//div[@data-e2e='user-info']/..",
    append: "after",
    isMatch: () => location.pathname.startsWith('/user/'),
    async onMount({ mounted, remove }) {
        let userId = location.pathname.split("/")[2];
        if (userId === 'self') {
            userId = await browser.runtime.sendMessage<"executeScript">({
                name: "executeScript",
                body: "return window.SSR_RENDER_DATA?.app?.user?.info?.secUid;"
            });
        }
        if (!userId || !userId.startsWith('MS4wLjABAAAA')) {
            return remove();
        }
        mounted.render(<Component userId={userId} />);
    }
});