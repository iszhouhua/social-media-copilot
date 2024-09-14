import { FileInfo, TaskProcessor } from "@/components/task/types";
import type { NoteCard, WebV1Feed } from "@/services/xhs/note.d";
import { z } from "zod";
import { formSchema } from "../batch-export-dialog";
import moment from "moment";
import { TaskState } from "@/components/task/useTask";
import { webV1Feed } from "@/services/xhs/note";
import XLSX from 'xlsx';

export class XhsProcessor implements TaskProcessor<z.infer<typeof formSchema>, WebV1Feed> {

    async execute(task: TaskState<z.infer<typeof formSchema>, WebV1Feed>) {
        const { postIds } = task.condition!;
        task.setTotal(postIds.length);
        for (let i = 0; i < postIds.length; i++) {
            const postId = postIds[i];
            const post = await task.request(webV1Feed, postId);
            task.setData(prev => {
                prev[postId] = post;
                return prev;
            });
            task.setCompleted(prev => prev + 1);
        }
    }

    async getFileInfos(task: TaskState<z.infer<typeof formSchema>, WebV1Feed>): Promise<Array<FileInfo>> {
        const { condition, data } = task;
        const dataList: any[][] = [[
            '笔记ID',
            '笔记链接',
            '笔记类型',
            '笔记标题',
            '笔记详情',
            '点赞数',
            '收藏数',
            '评论数',
            '分享数',
            '发布时间',
            '更新时间',
            'IP地址',
            '博主ID',
            '博主昵称',
            '博主链接',
        ]];
        const medias: Array<FileInfo> = [];
        for (const noteId of condition.postIds) {
            const feed: WebV1Feed = data[noteId];
            const noteCard = feed.items?.[0]?.note_card;
            if (!noteCard) continue;
            if (condition.needMedia) {
                medias.push(this.getMediaFile(noteCard));
            }
            const row = [];
            row.push(noteId);
            row.push(`https://www.xiaohongshu.com/explore/${noteId}`);
            row.push(noteCard.type === 'video' ? '视频' : '图文');
            row.push(noteCard.title);
            row.push(noteCard.desc);

            row.push(noteCard.interact_info?.liked_count);
            row.push(noteCard.interact_info?.collected_count);
            row.push(noteCard.interact_info?.comment_count);
            row.push(noteCard.interact_info?.share_count);

            row.push(new Date(noteCard.time));
            row.push(new Date(noteCard.last_update_time));

            row.push(noteCard.ip_location);

            row.push(noteCard.user?.user_id);
            row.push(noteCard.user?.nickname);
            row.push(
                `https://www.xiaohongshu.com/user/profile/${noteCard.user?.user_id}`,
            );
            dataList.push(row);
        }
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.sheet_new();
        XLSX.utils.book_append_sheet(workbook, worksheet);
        XLSX.utils.sheet_add_aoa(worksheet, dataList);
        return [
            {
                data: XLSX.writeXLSX(workbook, { type: "buffer" }),
                type: 'buffer',
                filename: `小红书-笔记数据导出-${moment().format(moment.HTML5_FMT.DATETIME_LOCAL)}.xlsx`,
            },
            ...medias,
        ];
    }

    getMediaFile(noteCard: NoteCard): FileInfo {
        const name = `${noteCard.title || noteCard.desc?.split('\n')?.[0]?.substring(0, 20)}-${noteCard.note_id}`;
        if (noteCard.type === 'video') {
            const hosts = [
                'https://sns-video-bd.xhscdn.com/',
                'https://sns-video-hw.xhscdn.com/',
            ];
            const randomIndex = Math.floor(Math.random() * hosts.length);
            const videoKey = noteCard.video.consumer.origin_video_key;
            return {
                filename: name + '.mp4',
                type: 'url',
                data: hosts[randomIndex] + videoKey,
            };
        } else {
            const images: Array<FileInfo> = noteCard.image_list.map(
                (value, index) => {
                    return {
                        filename: `图${index + 1}.png`,
                        type: 'url',
                        data: value.url_default,
                    };
                },
            );
            return {
                filename: name + '.zip',
                type: 'zip',
                data: images,
            };
        }
    }
}