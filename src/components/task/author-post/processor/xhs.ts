import { FileInfo, TaskProcessor } from "@/components/task";
import { FormSchema } from "../batch-export-dialog";
import { webV1UserPosted } from "@/services/xhs/user";
import type { NoteInfo } from "@/services/xhs/user.d";
import { webV1Feed } from "@/services/xhs/note";
import type { WebV1Feed } from "@/services/xhs/note.d";
import PostProcessor from '@/components/task/post/processor/xhs';

export default class XhsProcessor extends TaskProcessor<FormSchema, WebV1Feed> {

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
                const post = await this.request(webV1Feed, note.note_id);
                this.actions.setCompleted(prev => prev + 1);
                this.data[note.note_id] = post;
            }
        }
    }

    async getFileInfos(): Promise<Array<FileInfo>> {
        // 复用笔记导出的逻辑
        const processor = new PostProcessor({ postIds: Object.keys(this.data), needMedia: this.condition.needMedia }, this.request, this.actions);
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