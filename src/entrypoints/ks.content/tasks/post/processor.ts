import { TaskProcessor } from "@/utils/task";
import { FormSchema } from ".";
import { getPostMedias, postMediaOptions } from "../../utils/media";
import { visionVideoDetail, VisionVideoDetailResponse } from "../../api/vision-video-detail";

export class Processor extends TaskProcessor<FormSchema> {
    public mediaOptions = postMediaOptions;

    async execute() {
        const { urls } = this.condition;
        this.actions.setTotal(urls.length);
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const postId = url.id;
            await this.next({ args: [{ page: "detail", photoId:postId }], func: visionVideoDetail, key: postId });
            this.actions.setCompleted(prev => prev + 1);
        }
    }

    getDataDownloadOption(): TaskDownloadOption {
        const { urls } = this.condition;
        const dataList: any[][] = [[
            '视频ID',
            '视频链接',

            '达人ID',
            '达人链接',
            '达人昵称',

            '视频描述',
            '点赞数',
            '阅读数',
            '发布时间',
            '视频下载链接'
        ]];
        for (const url of urls) {
            const row = [];
            row.push(url.id);
            row.push(url.href);
            dataList.push(row);
            const webDetail:VisionVideoDetailResponse = this.dataCache.get(url.id);
            if (!webDetail?.visionVideoDetail) continue;
            const post = webDetail.visionVideoDetail;
                row.push(post.author.id);
                row.push(`https://www.kuaishou.com/profile/${post.author.id}`);
                row.push(post.author.name);

                row.push(post.photo?.caption);
                row.push(post.photo?.realLikeCount);
                row.push(post.photo?.viewCount);
                row.push(new Date(post.photo?.timestamp));
                row.push(post.photo?.photoUrl);
                dataList.push(row);
        }
        return generateExcelDownloadOption(dataList, "快手-根据视频链接导出视频数据");
    }

    getMediaDownloadOptions(mediaTypes: string[]) {
        const list: TaskDownloadOption[] = [];
        for (const aweme of this.dataCache.values()) {
            if (!aweme.visionVideoDetail) continue;
            const files = getPostMedias(aweme.visionVideoDetail, mediaTypes);
            list.push(...files);
        }
        return list;
    }
}