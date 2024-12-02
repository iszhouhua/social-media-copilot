import { InteractInfo, webV1Feed, type NoteCard } from "@/services/xhs/note";
import { webV1UserOtherinfo, webV1UserPosted, type WebV1UserOtherinfo } from "@/services/xhs/user";
import { TaskFileInfo, TaskProcessor } from "@/tasks/processor";
import { toNumber } from "lodash";
import { FormSchema } from ".";

type DataValue = WebV1UserOtherinfo & {
    notes?: Array<NoteCard>
}

export class Processor extends TaskProcessor<FormSchema> {
    public data: Record<string, DataValue> = {}

    async execute(signal: AbortSignal) {
        const { urls, needInteractionInfo } = this.condition;
        this.actions.setTotal(urls.length);
        for (const url of urls) {
            signal.throwIfAborted();
            const user: DataValue = await webV1UserOtherinfo(url.id);
            if (needInteractionInfo) {
                user.notes = await this.getLastNotes(url.id, 10);
            }
            this.data[url.id] = user;
            this.actions.setCompleted(prev => prev + 1);
        }
    }

    async getFileInfos(): Promise<Array<TaskFileInfo>> {
        const extraHeaders = this.condition.needInteractionInfo ? [
            "笔记样本数",
            "首篇样本发布时间",
            "最后一篇样本发布时间",
            "点赞中位数",
            "评论中位数",
            "收藏中位数",
            "赞评藏中位数",
            "点赞平均数",
            "评论平均数",
            "收藏平均数",
            "赞评藏平均数",
        ] : [];
        const dataList: any[][] = [[
            '博主链接',
            '博主ID',
            '博主昵称',
            '博主性别',
            '小红书号',
            '个人简介',
            '粉丝数',
            '获赞与收藏',
            '关注',
            'IP地址',
            ...extraHeaders
        ]];
        for (const url of this.condition.urls) {
            const row = [];
            row.push(url.href);
            row.push(url.id);
            dataList.push(row);
            const info = this.data[url.id];
            if (!info) continue;
            row.push(info.basic_info?.nickname);
            row.push(info.basic_info?.gender === 0
                ? '男'
                : info.basic_info?.gender === 1
                    ? '女'
                    : '未知');
            row.push(info.basic_info?.red_id);
            row.push(info.basic_info.desc);
            row.push(info.interactions?.find(item => item.type === 'fans')?.count);
            row.push(info.interactions?.find(item => item.type === 'interaction')?.count);
            row.push(info.interactions?.find(item => item.type === 'follows')?.count);
            row.push(info.basic_info?.ip_location);

            if (this.condition.needInteractionInfo) {
                row.push(info.notes?.length ?? 0);
                if (!info.notes) {
                    continue;
                }
                const notes = info.notes!;

                const valueToNumber = (value: string) => {
                    if (!value) return 0;
                    return toNumber(value.replace("万", "0000"));
                }

                const median = (fieldName: keyof InteractInfo | "interaction_count") => {
                    const sorted = notes.map(o => {
                        if (fieldName === "interaction_count") {
                            return valueToNumber(o.interact_info.liked_count) + valueToNumber(o.interact_info.comment_count) + valueToNumber(o.interact_info.collected_count);
                        }
                        return valueToNumber(o.interact_info[fieldName]);
                    }).sort((a, b) => a - b);
                    const mid = Math.floor(sorted.length / 2);
                    return Math.round(sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2);
                }

                const average = (fieldName: keyof InteractInfo | "interaction_count") => {
                    const sum = notes.map(o => {
                        if (fieldName === "interaction_count") {
                            return valueToNumber(o.interact_info.liked_count) + valueToNumber(o.interact_info.comment_count) + valueToNumber(o.interact_info.collected_count);
                        }
                        return valueToNumber(o.interact_info[fieldName]);
                    }).reduce((acc, val) => acc + val, 0);
                    return Math.round(sum / notes.length);
                }

                row.push(new Date(notes[notes.length - 1].time));
                row.push(new Date(notes[0].time));
                row.push(median('liked_count'));
                row.push(median('comment_count'));
                row.push(median('collected_count'));
                row.push(median('interaction_count'));
                row.push(average('liked_count'));
                row.push(average('comment_count'));
                row.push(average('collected_count'));
                row.push(average('interaction_count'));
            }
        }
        return [this.getExcelFileInfo(dataList, "小红书-博主数据导出")];
    }

    /**
     * 获取博主最新的笔记
     * @param userId 博主ID
     * @param limit 条数限制
     */
    async getLastNotes(
        userId: string,
        limit: number = 10
    ): Promise<NoteCard[]> {
        const list: NoteCard[] = [];
        const result = await webV1UserPosted({
            user_id: userId,
            cursor: '',
            num: limit,
            image_formats: 'jpg,webp,avif',
        });
        for (const note of result.notes) {
            const feedData = await webV1Feed(note.note_id, 'pc_user', note.xsec_token);
            list.push(feedData.items?.[0]?.note_card);
        }
        return list.sort((a, b) => b.time - a.time).slice(0, limit);
    }
}