import { FormSchema } from ".";
import { webV1Feed } from "../../api/note";
import { webV1UserPosted } from "../../api/user";
import { parsePostUrl, ParsePostUrlResult } from "../../utils/parse-url";
import { Processor as PostProcessor } from '../post/processor';

export class Processor extends PostProcessor<FormSchema & {
    urls: ParsePostUrlResult[]
}> {

    async execute() {
        const { authorUrls, limitPerId } = this.condition;
        let total = authorUrls.length * limitPerId;
        this.actions.setTotal(total);
        const postUrls: ParsePostUrlResult[] = [];
        for (const url of authorUrls) {
            const notes = await this.getUserPosted(url.id, limitPerId);
            total += notes.length - limitPerId;
            this.actions.setTotal(total);
            //获取笔记详情
            for (const note of notes) {
                if (!note.note_id) {
                    throw new Error('笔记ID获取失败,请检查是否已登录小红书账号!');
                }
                await this.next({
                    func: webV1Feed,
                    args: [note.note_id, 'pc_user', note.xsec_token],
                    key: note.note_id
                });
                const href = `https://www.xiaohongshu.com/explore/${note.note_id}?xsec_token=${note.xsec_token}&xsec_source=pc_user`;
                postUrls.push(await parsePostUrl(new URL(href)));
                this.actions.setCompleted(prev => prev + 1);
                this.condition.urls = postUrls;
            }
        }
    }

    /**
     * 获取博主的笔记
     * @param userId 博主ID
     * @param limit 条数限制
     */
    async getUserPosted(
        userId: string,
        limit: number
    ): Promise<XhsAPI.NoteInfo[]> {
        let cursor = '';
        const list: XhsAPI.NoteInfo[] = [];
        while (true) {
            const result = await this.next({
                func: webV1UserPosted,
                args: [{
                    user_id: userId,
                    cursor: cursor,
                    num: 20,
                    image_formats: 'jpg,webp,avif',
                }],
                key: `${userId}:${cursor}`
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