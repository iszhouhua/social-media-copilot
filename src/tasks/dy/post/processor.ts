import * as http from "@/services/dy";
import { TaskFileInfo, TaskProcessor } from "@/tasks/processor";
import { FormSchema } from ".";
import { getMaterialFiles } from "./material-file";

export class Processor extends TaskProcessor<FormSchema> {
    private data: Record<string, http.aweme.AwemeDetail> = {};

    async execute(signal: AbortSignal) {
        const { urls } = this.condition;
        this.actions.setTotal(urls.length);
        for (let i = 0; i < urls.length; i++) {
            signal.throwIfAborted();
            const url = urls[i];
            const postId = url.id;
            const post = await http.aweme.awemeDetail(postId);
            this.data[postId] = post.aweme_detail;
            this.actions.setCompleted(prev => prev + 1);
        }
    }

    async getFileInfos(): Promise<Array<TaskFileInfo>> {
        const { urls, materialTypes } = this.condition;
        const dataList: any[][] = [[
            '视频链接',
            '视频ID',
            '达人UID',
            '抖音号',
            '达人昵称',
            '达人链接',
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
        ]];
        const medias: Array<TaskFileInfo> = [];
        for (const url of urls) {
            const row = [];
            row.push(url.href);
            row.push(url.id);
            dataList.push(row);
            const aweme: http.aweme.AwemeDetail = this.data[url.id];
            if (!aweme) continue;
            row.push(aweme.aweme_id);
            row.push(aweme.author?.uid);
            row.push(aweme.author?.unique_id || aweme.author?.short_id);
            row.push(aweme.author?.nickname);
            row.push(`https://www.douyin.com/user/${aweme.author?.sec_uid}`);
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
            medias.push(...getMaterialFiles(aweme, materialTypes));
        }
        return [this.getExcelFileInfo(dataList, "抖音-视频数据导出"), ...medias];
    }
}