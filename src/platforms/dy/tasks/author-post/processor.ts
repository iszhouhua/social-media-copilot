import { TaskFileInfo, TaskProcessor } from "@/components/task";
import { FormSchema } from ".";
import { Processor as PostProcessor } from '../post';
import * as http from "@/platforms/dy/http";

export class Processor extends TaskProcessor<FormSchema, http.aweme.AwemeDetail> {

    async execute() {
        const { authorIds, limitPerId } = this.condition;
        let total = authorIds.length * limitPerId;
        let completed = 0;
        this.actions.setTotal(total);
        for (const authorId of authorIds) {
            const posts = await this.getAuthorPosts(authorId, limitPerId, completed);
            total += posts.length - limitPerId;
            completed += posts.length;
            this.actions.setCompleted(completed);
            this.actions.setTotal(total);
            // 抖音补充一下达人基本信息就行了，不用获取每一个视频的详情
            const userProfile = await http.user.userProfileOther(authorId);
            posts.forEach(post => {
                post.author = userProfile.user;
                this.data[post.aweme_id] = post;
            })
        }
    }

    async getFileInfos(): Promise<Array<TaskFileInfo>> {
        // 复用笔记导出的逻辑
        const processor = new PostProcessor({ postIds: Object.keys(this.data), needMedia: this.condition.needMedia }, this.actions);
        processor.data = this.data;
        return processor.getFileInfos();
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
                count: limit - list.length < 10 ? 10 : 20,
                cut_version: 1
            });
            list.push(...result.aweme_list);
            cursor = result.max_cursor;
            this.actions.setCompleted(offset + list.length);
            if (list.length >= limit) {
                // 已经够了
                break;
            }
            if (!result.has_more) {
                // 没有数据了
                break;
            }
        }
        return list;
    }
}