import { NoteCard, webV1Feed } from "@/services/xhs/note";
import { webV1UserPosted } from "@/services/xhs/user";
import type { NoteInfo } from "@/services/xhs/user.d";
import { TaskFileInfo } from "@/tasks/processor";
import { FormSchema } from ".";
import { Processor as PostProcessor } from '../post';
import { parseUrl, ParseUrlResult } from "../post/parse-url";

export class Processor extends PostProcessor<FormSchema & {
    urls: Array<ParseUrlResult>
}> {

    async execute(signal: AbortSignal) {
        const { urls, limitPerId } = this.condition;
        let total = urls.length * limitPerId;
        this.actions.setTotal(total);
        const postUrls:ParseUrlResult[] = [];
        for (const url of urls) {
            signal.throwIfAborted();
            const notes = await this.getUserPosted(url.id, limitPerId, signal);
            total += notes.length - limitPerId;
            this.actions.setTotal(total);
            //获取笔记详情
            for (const note of notes) {
                signal.throwIfAborted();
                if (!note.note_id) {
                    throw new Error('笔记ID获取失败,请检查小红书账号是否已登录!');
                }
                const post: any = await webV1Feed(note.note_id, 'pc_user', note.xsec_token, ['jpg']);
                const href = `https://www.xiaohongshu.com/explore/${note.note_id}?xsec_token=${note.xsec_token}=&xsec_source=pc_user`;
                postUrls.push(await parseUrl(new URL(href)));
                this.data[note.note_id] = post;
                this.actions.setCompleted(prev => prev + 1);
            }
        }
        this.condition.urls = postUrls;
    }



    getMediaFile(noteCard: NoteCard): TaskFileInfo {
        const fileInfo = super.getMediaFile(noteCard);
        fileInfo.path = noteCard.user?.nickname;
        return fileInfo;
    }

    /**
     * 获取博主的笔记
     * @param userId 博主ID
     * @param limit 条数限制
     */
    async getUserPosted(
        userId: string,
        limit: number,
        signal: AbortSignal
    ): Promise<NoteInfo[]> {
        let cursor = '';
        const list: NoteInfo[] = [];
        while (true) {
            signal.throwIfAborted();
            const result = await webV1UserPosted({
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