import { TaskProcessor } from "@/utils/task";
import { FormSchema } from ".";
import * as http from "../../api";
import { getPostMedias, postMediaOptions } from "../../utils/media";

export class Processor extends TaskProcessor<FormSchema, DouyinAPI.AwemeV1WebDetail> {
    public mediaOptions = postMediaOptions;

    async execute() {
        const { urls } = this.condition;
        this.actions.setTotal(urls.length);
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const postId = url.id;
            await this.next({ args: [postId], func: http.aweme.awemeDetail, key: postId });
            this.actions.setCompleted(prev => prev + 1);
        }
    }

    getDataDownloadOption(): TaskDownloadOption {
        const { urls } = this.condition;
        const dataList: any[][] = [[
            '视频ID',
            '视频链接',

            '达人UID',
            '达人链接',
            '抖音号',
            '达人昵称',
            '粉丝数',
            '达人简介',

            '媒体类型',
            '视频描述',
            'OCR内容',
            '点赞数',
            '收藏数',
            '评论数',
            '分享数',
            '发布时间',

            '视频下载链接'
        ]];
        for (const url of urls) {
            const row = [];
            row.push(url.id);
            row.push(url.href);
            dataList.push(row);
            const webDetail = this.dataCache.get(url.id);
            if (!webDetail?.aweme_detail) continue;
            const aweme = webDetail.aweme_detail;

            row.push(aweme.author?.uid);
            row.push(`https://www.douyin.com/user/${aweme.author?.sec_uid}`);
            row.push(aweme.author?.unique_id || aweme.author?.short_id);
            row.push(aweme.author?.nickname);
            row.push(aweme.author?.follower_count);
            row.push(aweme.author?.signature);

            row.push(aweme.media_type === 2 ? '图集' : '视频');
            row.push(aweme.desc);
            row.push(aweme.seo_info?.ocr_content);
            row.push(aweme.statistics?.digg_count);
            row.push(aweme.statistics?.collect_count);
            row.push(aweme.statistics?.comment_count);
            row.push(aweme.statistics?.share_count);
            row.push(new Date(aweme.create_time * 1000));

            const files = getPostMedias(aweme, ["video"]);
            row.push(files.map(f => f.url).join('\n'));
        }
        return generateExcelDownloadOption(dataList, "抖音-根据视频链接导出视频数据");
    }

    getMediaDownloadOptions(mediaTypes: string[]) {
        const list: TaskDownloadOption[] = [];
        for (const aweme of this.dataCache.values()) {
            if (!aweme.aweme_detail) continue;
            const files = getPostMedias(aweme.aweme_detail, mediaTypes);
            list.push(...files);
        }
        return list;
    }
}