import { TaskProcessor } from "@/utils/task";
import { FormSchema } from ".";
import * as http from "../../api";
import { getPostMedias, postMediaOptions } from "../../utils/media";

export class Processor extends TaskProcessor<FormSchema, DouyinAPI.AwemeV1WebbMix> {
    public mediaOptions = postMediaOptions;

    async execute() {
        const { mixId, total } = this.condition;
        let completed = 0;
        this.actions.setTotal(total);
        let cursor = 0;
        while (true) {
            const result = await this.next({
                key: `${mixId}:${cursor}`,
                func: http.aweme.mixAweme,
                args: [{
                    mix_id: mixId,
                    cursor,
                    count: 10
                }]
            });
            if (!result.aweme_list?.length) {
                break;
            }
            const posts = result.aweme_list;
            completed += posts.length;
            cursor = result.cursor;
            this.actions.setCompleted(completed);
            if (!result.has_more) {
                break;
            }
        };
        this.actions.setTotal(completed);
    }

    getDataDownloadOption(): TaskDownloadOption {
        const { mixName } = this.condition;
        const dataList: any[][] = [[
            '视频ID',
            '视频链接',

            '达人UID',
            '达人链接',
            '抖音号',
            '达人昵称',
            '粉丝数',
            '达人简介',

            '媒体类型',
            '视频描述',
            '点赞数',
            '收藏数',
            '评论数',
            '分享数',
            '发布时间',

            '视频下载链接'
        ]];
        const awemes = this.getCrawlerdPosts();
        for (const aweme of awemes) {
            const author = aweme.author;
            const row = [];
            row.push(aweme.aweme_id);
            row.push(aweme.share_url);

            row.push(author?.uid);
            row.push(`https://www.douyin.com/user/${author?.sec_uid}`);
            row.push(author?.unique_id || author?.short_id);
            row.push(author?.nickname);
            row.push(author?.follower_count);
            row.push(author?.signature);

            row.push(aweme.media_type === 2 ? '图集' : '视频');
            row.push(aweme.desc);
            row.push(aweme.statistics?.digg_count);
            row.push(aweme.statistics?.collect_count);
            row.push(aweme.statistics?.comment_count);
            row.push(aweme.statistics?.share_count);
            row.push(new Date(aweme.create_time * 1000));

            const files = getPostMedias(aweme, ["video"]);
            row.push(files.map(f => f.url).join('\n'));
            dataList.push(row);
        }
        return generateExcelDownloadOption(dataList, `抖音-合集${mixName}的视频数据`);
    }

    getMediaDownloadOptions(mediaTypes: string[]) {
        const awemes = this.getCrawlerdPosts();
        const list: TaskDownloadOption[] = [];
        for (const aweme of awemes) {
            list.push(...getPostMedias(aweme, mediaTypes));
        }
        return list;
    }

    getCrawlerdPosts() {
        return this.dataCache.values().flatMap(result => {
            return result?.aweme_list ?? []
        })
    }
}