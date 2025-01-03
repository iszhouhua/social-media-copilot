import { TaskFileInfo, TaskProcessor } from "@/components/task";
import { FormSchema } from ".";
import * as http from "@/platforms/dy/http";
import { getMaterialFiles } from "../post/material-file";

export class Processor extends TaskProcessor<FormSchema, {
    author: http.user.UserInfo,
    awemes: http.aweme.AwemeDetail[]
}> {

    async execute() {
        const { authorIds, limitPerId } = this.condition;
        let total = authorIds.length * limitPerId;
        let completed = 0;
        this.actions.setTotal(total);
        for (const authorId of authorIds) {
            const userProfile = await this.request(http.user.userProfileOther, authorId);
            const posts = await this.getAuthorPosts(authorId, limitPerId, completed);
            total += posts.length - limitPerId;
            completed += posts.length;
            this.actions.setCompleted(completed);
            this.actions.setTotal(total);
            this.data[authorId] = {
                author: userProfile.user,
                awemes: posts
            };
        }
    }

    async getFileInfos(): Promise<Array<TaskFileInfo>> {
        const { authorIds, materialTypes } = this.condition;
        const dataList: any[][] = [[
            '达人UID',
            '抖音号',
            '达人昵称',
            '达人链接',
            '粉丝数',
            '达人简介',
            '视频ID',
            '视频链接',
            '媒体类型',
            '视频描述',
            '点赞数',
            '收藏数',
            '评论数',
            '分享数',
            '发布时间',
        ]];
        const medias: Array<TaskFileInfo> = [];
        for (const authorId of authorIds) {
            const dataInfo = this.data[authorId];
            const author = dataInfo.author;
            for (const aweme of dataInfo.awemes) {
                if (!aweme) continue;
                const files = getMaterialFiles(aweme, materialTypes);
                medias.push(...files);
                const row = [];
                row.push(author?.uid);
                row.push(author?.unique_id || author?.short_id);
                row.push(author?.nickname);
                row.push(`https://www.douyin.com/user/${author?.sec_uid}`);
                row.push(author?.follower_count);
                row.push(author?.signature);

                row.push(aweme.aweme_id);
                row.push(aweme.share_url);

                row.push(aweme.media_type === 2 ? '图集' : '视频');
                row.push(aweme.desc);

                row.push(aweme.statistics?.digg_count);
                row.push(aweme.statistics?.collect_count);
                row.push(aweme.statistics?.comment_count);
                row.push(aweme.statistics?.share_count);

                row.push(new Date(aweme.create_time * 1000));
                dataList.push(row);
            }
        }
        const name = authorIds.length === 1 ? `${this.data[authorIds[0]]?.author?.nickname}的视频数据` : "根据达人链接导出视频数据";
        return [this.getExcelFileInfo(dataList, "抖音-" + name), ...medias];
    }

    /**
     * 获取达人的视频
     * @param authorId 达人ID
     * @param limit 条数限制
     */
    async getAuthorPosts(
        authorId: string,
        limit: number,
        offset: number = 0
    ): Promise<http.aweme.AwemeDetail[]> {
        let cursor = 0;
        const list: http.aweme.AwemeDetail[] = [];
        while (true) {
            const result = await this.request(http.aweme.awemePost, {
                sec_user_id: authorId,
                max_cursor: cursor,
                count: 20,
                cut_version: 1
            });
            list.push(...result.aweme_list);
            cursor = result.max_cursor;
            this.actions.setCompleted(offset + list.length);
            if (list.length >= limit) {
                // 已经够了
                return list.splice(0, limit);
            }
            if (!result.has_more) {
                // 没有数据了
                return list;
            }
        }
    }
}