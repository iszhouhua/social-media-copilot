import * as http from "@/services/dy";
import { TaskFileInfo, TaskProcessor } from "@/tasks/processor";
import { FormSchema } from ".";
import { getMaterialFiles } from "../post/material-file";

export class Processor extends TaskProcessor<FormSchema> {

    public data: Record<string, http.aweme.AwemeDetail> = {};
    async execute(signal: AbortSignal) {
        const { mixId, total } = this.condition;
        let completed = 0;
        this.actions.setTotal(total);
        let cursor = 0;
        while (true) {
            signal.throwIfAborted();
            const result = await http.aweme.mixAweme({
                mix_id: mixId,
                cursor, count: 10
            });
            const posts = result.aweme_list;
            completed += posts.length;
            cursor = result.cursor;
            this.actions.setCompleted(completed);
            posts.forEach(post => {
                this.data[post.aweme_id] = post;
            });
            if (!result.has_more) {
                break;
            }
        };
        this.actions.setTotal(completed);
    }

    async getFileInfos(): Promise<Array<TaskFileInfo>> {
        const { mixName, materialTypes } = this.condition;
        const dataList: any[][] = [[
            '视频链接',
            '视频ID',
            '媒体类型',
            '视频描述',
            '点赞数',
            '收藏数',
            '评论数',
            '分享数',
            '发布时间',
            '达人UID',
            '抖音号',
            '达人昵称',
            '达人链接',
            '粉丝数',
            '达人简介',
        ]];
        const medias: Array<TaskFileInfo> = [];
        const posts = Object.values(this.data);
        for (const index in posts) {
            const aweme = posts[index];
            const author = aweme.author;
            const files = getMaterialFiles(aweme, materialTypes, mixName);
            if (files.length) {
                files.forEach(item => {
                    let num = Number(index) + 1;
                    item.filename = `第${num}集-${item.filename}`
                });
                medias.push(...files);
            }
            const row = [];
            row.push(aweme.share_url);
            row.push(aweme.aweme_id);
            row.push(aweme.media_type === 2 ? '图集' : '视频');
            row.push(aweme.desc);
            row.push(aweme.statistics?.digg_count);
            row.push(aweme.statistics?.collect_count);
            row.push(aweme.statistics?.comment_count);
            row.push(aweme.statistics?.share_count);
            row.push(new Date(aweme.create_time * 1000));
            
            row.push(author?.uid);
            row.push(author?.unique_id || author?.short_id);
            row.push(author?.nickname);
            row.push(`https://www.douyin.com/user/${author?.sec_uid}`);
            row.push(author?.follower_count);
            row.push(author?.signature);
            dataList.push(row);
        }
        return [this.getExcelFileInfo(dataList, `抖音-合集${mixName}的视频数据`), ...medias];
    }


    getMediaFile(aweme: http.aweme.AwemeDetail): TaskFileInfo[] {
        const { mixName, materialTypes } = this.condition;
        if (!materialTypes?.length) {
            return [];
        }
        const name = `${aweme.desc?.split('\n')?.[0]?.substring(0, 20)}-${aweme.aweme_id}`;
        const fileInfos: TaskFileInfo[] = [];
        if (aweme.media_type === 2) {
            const images: TaskFileInfo[] = aweme.images.map((value, index) => {
                return {
                    filename: `图${index + 1}.jpeg`,
                    type: 'url',
                    data: value.url_list.reverse()[0],
                };
            });
            fileInfos.push({
                filename: name + '.zip',
                path: mixName,
                type: 'zip',
                data: images,
            });
        } else {
            const url = aweme.video?.play_addr?.url_list?.[0];
            if (url) {
                fileInfos.push({
                    filename: name + '.' + (aweme.video?.format || 'mp4'),
                    type: 'url',
                    data: url,
                    path: mixName,
                });
            }
        }
        if (materialTypes.includes("cover")) {
            // 导出封面
            const url = aweme.video?.cover?.url_list?.reverse()?.[0];
            if (url) {
                fileInfos.push({
                    filename: name + '.jpeg',
                    type: 'url',
                    data: url,
                    path: mixName,
                });
            }
        }
        if (materialTypes.includes('music')) {
            // 导出音乐
            const url = aweme.music?.play_url?.url_list?.[0];
            if (url) {
                fileInfos.push({
                    filename: name + '.mp3',
                    type: 'url',
                    data: url,
                    path: mixName,
                });
            }
        }
        return fileInfos;
    }
}