import { CopyButton, CopyOption } from "@/components/copy/copy-button";
import { visionVideoDetail, VisionVideoDetail } from "../api/vision-video-detail";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { commentListQuery } from "../api/comment-list-query";
import { throttle } from "lodash";
import { getPostMedias } from "../utils/media";
import { Logo } from "@/components/logo";

export type Props = {
    photoId: string;
};

export const Component = ({ photoId }: Props) => {
    const [videoDetail, setVideoDetail] = useState<VisionVideoDetail>();

    const getVideoDetail = async () => {
        if (videoDetail?.photo?.id === photoId) return videoDetail;
        const response = await visionVideoDetail({ page: "detail", photoId: photoId, webPageArea: new URLSearchParams(location.search).get('area') });
        setVideoDetail(response.visionVideoDetail);
        return response.visionVideoDetail;
    };

    const copyOptions: CopyOption[] = [{
        label: "视频ID",
        value: "photo.id"
    }, {
        label: "视频描述",
        value: "photo.caption"
    }, {
        label: "达人ID",
        value: "author.id"
    }, {
        label: "达人昵称",
        value: "author.name",
    }, {
        label: "点赞数",
        value: "photo.likeCount",
        hidden: true
    }, {
        label: "播放量",
        value: "photo.viewCount",
        hidden: true
    }];


    const handlerDownloadVideo = async () => {
        const aweme = await getVideoDetail();
        const files = getPostMedias(aweme, ["video"]);
        for (const file of files) {
            await sendMessage("download", {
                filename: file.filename,
                url: file.url,
            });
        }
        toast.success("下载成功");
    }

    const handleOpenDialog = async () => {
        const post = await getVideoDetail();
        const commentCount = await commentListQuery(photoId, "").then((res) => res.visionCommentList.commentCountV2).catch(() => 0);
        sendMessage('openTaskDialog', {
            name: 'post-comment',
            post: {
                postId: photoId,
                commentCount,
                title: post.photo.caption,
                url: `https://www.kuaishou.com/short-video/${photoId}`
            }
        });
    }

    return (<div className="flex gap-4">
        <Logo />
        <Button size="sm" className="text-xs h-8 px-2" onClick={throttle(handlerDownloadVideo, 2000)}>下载视频</Button>
        <CopyButton size="sm" className="text-xs h-8 px-2" options={copyOptions} getData={getVideoDetail}>复制视频信息</CopyButton>
        <Button size="sm" className="text-xs h-8 px-2" onClick={throttle(handleOpenDialog, 2000)}>导出评论</Button>
    </div>);
};

export default defineSocialMediaCopilotUi({
    name: "short-video",
    anchor: "//div[contains(@class,'short-video-info-container-detail')]",
    append: "after",
    matches: ["*://www.kuaishou.com/short-video/*"],
    position: "inline",
    render: ({ root, remove }) => {
        const photoId = location.pathname.split("/")[2];
        if (!photoId) {
            return remove();
        }
        root.render(<Component photoId={photoId} />);
    },
});