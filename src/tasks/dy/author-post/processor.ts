import * as http from "@/services/dy";
import { TaskFileInfo, TaskProcessor } from "@/tasks/processor";
import { FormSchema } from ".";
import { getMaterialFiles } from "../post/material-file";

export class Processor extends TaskProcessor<FormSchema> {
    
    public data: Record<string, {
        author: http.user.UserInfo,
        awemes: http.aweme.AwemeDetail[]
    }> = {};

    async execute(signal: AbortSignal) {
        const { urls, limitPerId } = this.condition;
        let total = urls.length * limitPerId;
        let completed = 0;
        this.actions.setTotal(total);
        for (const url of urls) {
            signal.throwIfAborted();
            const userProfile = await http.user.userProfileOther(url.id);
            const posts = await this.getAuthorPosts(url.id, limitPerId, completed);
            total += posts.length - limitPerId;
            completed += posts.length;
            this.actions.setCompleted(completed);
            this.actions.setTotal(total);
            this.data[url.id] = {
                author: userProfile.user,
                awemes: posts
            };
        }
    }

    async getFileInfos(): Promise<Array<TaskFileInfo>> {
        const { urls, materialTypes } = this.condition;
        const dataList: any[][] = [[
            '达人链接',
            '达人UID',
            '抖音号',
            '达人昵称',
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
        for (const url of urls) {
            const dataInfo = this.data[url.id];
            const author = dataInfo.author;
            for (const aweme of dataInfo.awemes) {
                if (!aweme) continue;
                const files = getMaterialFiles(aweme, materialTypes, author?.nickname || url.id);
                medias.push(...files);
                const row = [];
                row.push(url.href);
                row.push(author?.uid);
                row.push(author?.unique_id || author?.short_id);
                row.push(author?.nickname);
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
        const name = urls.length === 1 ? `${this.data[urls[0].id]?.author?.nickname}的视频数据` : "根据达人链接导出视频数据";
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
            const result = await http.aweme.awemePost({
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