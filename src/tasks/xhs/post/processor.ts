import { webV1Feed } from "@/services/xhs/note";
import type { NoteCard, WebV1Feed } from "@/services/xhs/note.d";
import { TaskFileInfo, TaskProcessor } from "@/tasks/processor";
import { FormSchema } from ".";

export class Processor<P extends FormSchema> extends TaskProcessor<P> {
    public data: Record<string, WebV1Feed> = {};

    async execute(signal: AbortSignal) {
        const { urls } = this.condition;
        this.actions.setTotal(urls.length);
        for (let i = 0; i < urls.length; i++) {
            signal.throwIfAborted();
            const postParam = urls[i];
            const post = await webV1Feed(postParam.id, postParam.source, postParam.token, ['jpg']);
            this.data[postParam.id] = post;
            this.actions.setCompleted(prev => prev + 1);
        }
    }

    async getFileInfos(): Promise<Array<TaskFileInfo>> {
        const dataList: any[][] = [[
            '笔记链接',
            '笔记ID',
            '博主ID',
            '博主昵称',
            '博主链接',
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
        ]];
        const medias: Array<TaskFileInfo> = [];
        for (const postParam of this.condition.urls) {
            const row = [];
            row.push(postParam.href);
            row.push(postParam.id);
            dataList.push(row);
            const feed: WebV1Feed = this.data[postParam.id];
            const noteCard = feed.items?.[0]?.note_card;
            if (!noteCard){
                continue;
            };
            if (this.condition.needMedia) {
                medias.push(this.getMediaFile(noteCard));
            }

            row.push(noteCard.user?.user_id);
            row.push(noteCard.user?.nickname);
            row.push(
                `https://www.xiaohongshu.com/user/profile/${noteCard.user?.user_id}`,
            );

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
        }
        return [this.getExcelFileInfo(dataList, "小红书-笔记数据导出"), ...medias];
    }

    getMediaFile(noteCard: NoteCard): TaskFileInfo {
        const name = `${noteCard.title}-${noteCard.note_id}`;
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
            const images: Array<TaskFileInfo> = noteCard.image_list.flatMap(
                (value, index) => {
                    let list: Array<TaskFileInfo> = [{
                        filename: `图${index + 1}.jpg`,
                        type: 'url',
                        data: value.url_default,
                    }];
                    if (value.live_photo) {
                        for (const key of Object.keys(value.stream)) {
                            const liveUrl = value.stream?.[key]?.[0]?.master_url;
                            if (liveUrl) {
                                list.push({
                                    filename: `图${index + 1}.mp4`,
                                    type: 'url',
                                    data: liveUrl,
                                });
                            }
                        };
                    }
                    return list;
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