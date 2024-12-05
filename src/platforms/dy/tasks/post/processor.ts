import { FormSchema } from ".";
import * as http from "@/platforms/dy/http";
import { TaskFileInfo, TaskProcessor } from "@/components/task";
import { getMaterialFiles } from "./material-file";

export class Processor extends TaskProcessor<FormSchema, http.aweme.AwemeDetail> {

    async execute() {
        const { postIds } = this.condition;
        this.actions.setTotal(postIds.length);
        for (let i = 0; i < postIds.length; i++) {
            const postId = postIds[i];
            const post = await this.request(http.aweme.awemeDetail, postId);
            this.data[postId] = post.aweme_detail;
            this.actions.setCompleted(prev => prev + 1);
        }
    }

    async getFileInfos(): Promise<Array<TaskFileInfo>> {
        const { postIds, materialTypes } = this.condition;
        const dataList: any[][] = [[
            '视频ID',
            '视频链接',
            '达人UID',
            '抖音号',
            '达人昵称',
            '达人链接',
            '粉丝数',
            '达人简介',
            '媒体类型',
            '视频描述',
            '点赞数',
            '收藏数',
            '评论数',
            '分享数',
            '发布时间',
        ]];
        const medias: Array<TaskFileInfo> = [];
        for (const awemeId of postIds) {
            const aweme: http.aweme.AwemeDetail = this.data[awemeId];
            if (!aweme) continue;
            medias.push(...getMaterialFiles(aweme,materialTypes));
            const row = [];
            row.push(awemeId);
            row.push(aweme.share_url);
            row.push(aweme.author?.uid);
            row.push(aweme.author?.unique_id || aweme.author?.short_id);
            row.push(aweme.author?.nickname);
            row.push(`https://www.douyin.com/user/${aweme.author?.sec_uid}`);
            row.push(aweme.author?.follower_count);
            row.push(aweme.author?.signature);

            row.push(aweme.media_type === 2 ? '图集' : '视频');
            row.push(aweme.desc);

            row.push(aweme.statistics?.digg_count);
            row.push(aweme.statistics?.collect_count);
            row.push(aweme.statistics?.comment_count);
            row.push(aweme.statistics?.share_count);

            row.push(new Date(aweme.create_time * 1000));
            dataList.push(row);
        }
        return [this.getExcelFileInfo(dataList, "抖音-视频数据导出"), ...medias];
    }
}