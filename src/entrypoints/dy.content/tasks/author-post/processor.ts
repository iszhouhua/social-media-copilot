import { MediaOption } from "@/components/common/download-media";
import { TaskProcessor } from "@/utils/task";
import { unionBy } from "lodash";
import { FormSchema } from ".";
import * as http from "../../api";
import { getPostMedias, postMediaOptions } from "../../utils/media";

export class Processor extends TaskProcessor<FormSchema> {
    public mediaOptions: MediaOption[] = postMediaOptions;

    async execute() {
        const { urls, limitPerId } = this.condition;
        let total = urls.length * limitPerId;
        let completed = 0;
        this.actions.setTotal(total);
        for (const url of urls) {
            await this.next({ key: url.id, func: http.user.userProfileOther, args: [url.id] });
            const posts = await this.crawlerAuthorPosts(url.id, limitPerId, completed);
            total += posts.length - limitPerId;
            completed += posts.length;
            this.actions.setCompleted(completed);
            this.actions.setTotal(total);
        }
    }

    getDataDownloadOption(): TaskDownloadOption {
        const { urls } = this.condition;
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
        for (const url of urls) {
            const dataInfo: DouyinAPI.UserProfileOther = this.dataCache.get(url.id);
            if (!dataInfo || !dataInfo.user) continue;
            const awemes = this.getAuthorCrawledPosts(url.id);
            const author = dataInfo.user;
            for (const aweme of awemes) {
                const row = [];
                row.push(aweme.aweme_id);
                row.push(aweme.share_url);

                row.push(author?.uid);
                row.push(url.href);
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
        }
        const name = urls.length === 1 ? `${this.dataCache.get(urls[0].id)?.author?.nickname}的视频数据` : "根据达人链接导出视频数据";
        return generateExcelDownloadOption(dataList, "抖音-" + name);
    }


    getMediaDownloadOptions(mediaTypes: string[]) {
        const list: TaskDownloadOption[] = [];
        for (const url of unionBy(this.condition.urls, 'id')) {
            const awemes = this.getAuthorCrawledPosts(url.id);
            for (const aweme of awemes) {
                const files = getPostMedias(aweme, mediaTypes);
                list.push(...files);
            }
        }
        return list;
    }

    /**
     * 抓取达人的视频
     * @param authorId 达人ID
     * @param limit 条数限制
     */
    async crawlerAuthorPosts(
        authorId: string,
        limit: number,
        offset: number = 0
    ): Promise<DouyinAPI.AwemeDetail[]> {
        let cursor = 0;
        const list: DouyinAPI.AwemeDetail[] = [];
        while (true) {
            const result = await this.next({
                func: http.aweme.awemePost,
                key: `${authorId}:${cursor}`,
                args: [{
                    sec_user_id: authorId,
                    max_cursor: cursor,
                    count: 20,
                    cut_version: 1
                }]
            });
            if (!result.aweme_list?.length) break;
            list.push(...result.aweme_list);
            cursor = result.max_cursor;
            this.actions.setCompleted(offset + list.length);
            if (list.length >= limit) {
                // 已经够了
                return list.splice(0, limit);
            }
            if (!result.has_more) {
                break;
            }
        }
        return list;
    }


    getAuthorCrawledPosts = (authorId: string) => {
        const list: DouyinAPI.AwemeDetail[] = [];
        const keys = this.dataCache.keys().filter(key => key.includes(":") && key.startsWith(authorId));
        for (const key of keys) {
            const result: DouyinAPI.AwemeV1WebPost = this.dataCache.get(key);
            if (!result.aweme_list) continue;
            list.push(...result.aweme_list);
        }
        return unionBy(list, 'aweme_id').splice(0, this.condition.limitPerId);
    }
}