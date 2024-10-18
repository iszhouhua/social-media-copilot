import { TaskFileInfo, TaskProcessor } from "@/components/task";
import { FormSchema } from ".";
import { webV1UserPosted } from "@/platforms/xhs/http/user";
import type { NoteInfo } from "@/platforms/xhs/http//user.d";
import { webV1Feed } from "@/platforms/xhs/http//note";
import type { WebV1Feed } from "@/platforms/xhs/http//note.d";
import { Processor as PostProcessor } from '../post';

export class Processor extends TaskProcessor<FormSchema, WebV1Feed & { xsec_token: string }> {

    async execute() {
        const { authorIds, limitPerId } = this.condition;
        let total = authorIds.length * limitPerId;
        this.actions.setTotal(total);
        for (const authorId of authorIds) {
            const notes = await this.getUserPosted(authorId, limitPerId);
            total += notes.length - limitPerId;
            this.actions.setTotal(total);
            //获取笔记详情
            for (const note of notes) {
                const post:any = await this.request(webV1Feed, note.note_id, 'pc_user', note.xsec_token);
                post.xsec_token = note.xsec_token;
                this.data[note.note_id] = post;
                this.actions.setCompleted(prev => prev + 1);
            }
        }
    }

    async getFileInfos(): Promise<Array<TaskFileInfo>> {
        // 复用笔记导出的逻辑
        const processor = new PostProcessor({ postParams: Object.values(this.data).map(item => ({ id: item.items[0].id, token: item.xsec_token, source: 'pc_user' })), needMedia: this.condition.needMedia }, this.actions);
        processor.data = this.data;
        return processor.getFileInfos();
    }

    /**
     * 获取博主的笔记
     * @param userId 博主ID
     * @param limit 条数限制
     */
    async getUserPosted(
        userId: string,
        limit: number
    ): Promise<NoteInfo[]> {
        let cursor = '';
        const list: NoteInfo[] = [];
        while (true) {
            const result = await this.request(webV1UserPosted, {
                user_id: userId,
                cursor: cursor,
                num: Math.min(limit - list.length, 30),
                image_formats: 'jpg,webp,avif',
            });
            list.push(...result.notes);
            cursor = result.cursor;
            if (list.length >= limit) {
                // 已经够了
                return list;
            }
            if (!result.has_more) {
                // 没有数据了
                break;
            }
        }
        return list;
    }
}