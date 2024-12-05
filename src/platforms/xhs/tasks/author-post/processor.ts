import { FormSchema } from ".";
import { webV1UserPosted } from "@/platforms/xhs/http/user";
import type { NoteInfo } from "@/platforms/xhs/http/user.d";
import { NoteCard, webV1Feed } from "@/platforms/xhs/http/note";
import { Processor as PostProcessor } from '../post';
import { TaskFileInfo } from "@/components/task";

export class Processor extends PostProcessor<FormSchema & {
    postParams: Array<{
        id: string;
        source: string;
        token: string;
    }>
}> {

    async execute() {
        const { authorIds, limitPerId } = this.condition;
        let total = authorIds.length * limitPerId;
        this.actions.setTotal(total);
        const postParams: { id: string; source: string; token: string; }[] = [];
        for (const authorId of authorIds) {
            const notes = await this.getUserPosted(authorId, limitPerId);
            total += notes.length - limitPerId;
            this.actions.setTotal(total);
            //获取笔记详情
            for (const note of notes) {
                if (!note.note_id) {
                    throw new Error('笔记ID获取失败，请检查小红书账号是否已登录！');
                }
                const post: any = await this.request(webV1Feed, note.note_id, 'pc_user', note.xsec_token);
                postParams.push({ id: note.note_id, token: note.xsec_token, source: 'pc_user' });
                this.data[note.note_id] = post;
                this.actions.setCompleted(prev => prev + 1);
            }
        }
        this.condition.postParams = postParams;
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
                num: 20,
                image_formats: 'jpg,webp,avif',
            });
            list.push(...result.notes);
            cursor = result.cursor;
            if (list.length >= limit) {
                // 已经够了
                return list.splice(0, limit);
            }
            if (!result.has_more) {
                // 没有数据了
                break;
            }
        }
        return list;
    }
}