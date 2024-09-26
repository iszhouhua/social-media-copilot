import { FileInfo, TaskProcessor } from "@/components/task";
import type { AwemeDetail } from "@/services/dy/aweme.d";
import { z } from "zod";
import { formSchema } from "../batch-export-dialog";
import moment from "moment";
import { awemeDetail } from "@/services/dy/aweme";
import XLSX from 'xlsx';

export default class DyProcessor extends TaskProcessor<z.infer<typeof formSchema>, AwemeDetail> {

    async execute() {
        const { postIds } = this.condition;
        this.actions.setTotal(postIds.length);
        for (let i = 0; i < postIds.length; i++) {
            const postId = postIds[i];
            const post = await this.request(awemeDetail, postId);
            this.data[postId] = post.aweme_detail;
            this.actions.setCompleted(prev => prev + 1);
        }
    }

    async getFileInfos(): Promise<Array<FileInfo>> {
        const { postIds, needMedia } = this.condition;
        const dataList: any[][] = [[
            '视频ID',
            '视频链接',
            '达人ID',
            '抖音号',
            '达人昵称',
            '达人链接',
            '粉丝数',
            '达人简介',
            '视频类型',
            '视频描述',
            '点赞数',
            '收藏数',
            '评论数',
            '分享数',
            '发布时间',
        ]];
        const medias: Array<FileInfo> = [];
        for (const awemeId of postIds) {
            const aweme: AwemeDetail = this.data[awemeId];
            if (!aweme) continue;
            if (needMedia) {
                medias.push(this.getMediaFile(aweme));
            }
            const row = [];
            row.push(awemeId);
            row.push(aweme.share_url);

            row.push(aweme.author?.sec_uid);
            row.push(aweme.author?.unique_id || aweme.author?.short_id);
            row.push(aweme.author?.nickname);
            row.push(`https://www.douyin.com/user/${aweme.author?.sec_uid}`);
            row.push(aweme.author?.follower_count);
            row.push(aweme.author?.signature);

            row.push(aweme.media_type === 2 ? '图集' : '视频');
            row.push(aweme.desc);

            row.push(aweme.statistics?.digg_count);
            row.push(aweme.statistics?.collect_count);
            row.push(aweme.statistics?.comment_count);
            row.push(aweme.statistics?.share_count);

            row.push(new Date(aweme.create_time * 1000));
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
                filename: `抖音-视频数据导出-${moment().format(moment.HTML5_FMT.DATETIME_LOCAL)}.xlsx`,
            },
            ...medias,
        ];
    }


    getMediaFile(aweme: AwemeDetail): FileInfo {
        const name = `${aweme.desc?.split('\n')?.[0]?.substring(0, 20)}-${aweme.aweme_id}`;
        if (aweme.media_type === 2) {
            const images: FileInfo[] = aweme.images.map((value, index) => {
                return {
                    filename: `图${index + 1}.png`,
                    type: 'url',
                    data: value.url_list.reverse()[0],
                };
            });
            return {
                filename: name + '.zip',
                type: 'zip',
                data: images,
            };
        } else {
            const vid = aweme?.video?.play_addr?.uri;
            return {
                filename: name + '.mp4',
                type: 'url',
                data: `https://aweme.snssdk.com/aweme/v1/play/?video_id=${vid}`,
            };
        }
    }
}