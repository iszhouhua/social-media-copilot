import { MediaOption } from "@/components/common/download-media";
import { TaskProcessor } from "@/utils/task";
import { unionBy } from "lodash";
import { FormSchema } from ".";
import { getPostMedias, postMediaOptions } from "../../utils/media";
import { visionProfile, VisionProfileResponse } from "../../api/vision-profile";
import { visionProfilePhotoList, VisionProfilePhotoListResponse } from "../../api/vision-profile-photo-list";
import { VisionVideoDetail } from "../../api/vision-video-detail";

export class Processor extends TaskProcessor<FormSchema> {
    public mediaOptions: MediaOption[] = postMediaOptions;

    async execute() {
        const { urls, limitPerId } = this.condition;
        let total = urls.length * limitPerId;
        let completed = 0;
        this.actions.setTotal(total);
        for (const url of urls) {
            await this.next({
                func: visionProfile,
                args: [{ userId: url.id }],
                key: url.id
            });
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

            '达人ID',
            '达人链接',
            '达人昵称',
            '粉丝数',
            '达人简介',

            '视频描述',
            '点赞数',
            '阅读数',
            '发布时间',
            '视频下载链接'
        ]];
        for (const url of urls) {
            const user: VisionProfileResponse = this.dataCache.get(url.id);
            if (!user?.visionProfile?.userProfile) continue;
            const posts = this.getAuthorCrawledPosts(url.id);
            const author = user.visionProfile.userProfile;
            for (const post of posts) {
                const row = [];
                row.push(post.photo.id);
                row.push(`https://www.kuaishou.com/short-video/${post.photo.id}`);

                row.push(author.profile.user_id);
                row.push(url.href);
                row.push(author.profile.user_name);
                row.push(author.ownerCount.fan);
                row.push(author.profile.user_text);

                row.push(post.photo?.caption);
                row.push(post.photo?.realLikeCount);
                row.push(post.photo?.viewCount);
                row.push(new Date(post.photo?.timestamp));
                row.push(post.photo?.photoUrl);
                dataList.push(row);
            }
        }
        const name = urls.length === 1 ? `${this.dataCache.get(urls[0].id)?.author?.nickname}的视频数据` : "根据达人链接导出视频数据";
        return generateExcelDownloadOption(dataList, "快手-" + name);
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
    ): Promise<VisionVideoDetail[]> {
        let cursor = "";
        const list: VisionVideoDetail[] = [];
        while (true) {
            const result = await this.next({
                func: visionProfilePhotoList,
                key: `${authorId}:${cursor}`,
                args: [{
                    page: "profile",
                    pcursor: cursor,
                    userId: authorId,
                }]
            });
            if (!result.visionProfilePhotoList?.feeds?.length) break;
            list.push(...(result.visionProfilePhotoList?.feeds || []));
            cursor = result?.visionProfilePhotoList?.pcursor;
            this.actions.setCompleted(offset + list.length);
            if (list.length >= limit) {
                // 已经够了
                return list.splice(0, limit);
            }
            if (cursor === 'no_more') {
                break;
            }
        }
        return list;
    }


    getAuthorCrawledPosts = (authorId: string) => {
        const list: VisionVideoDetail[] = [];
        const keys = this.dataCache.keys().filter(key => key.includes(":") && key.startsWith(authorId));
        for (const key of keys) {
            const result: VisionProfilePhotoListResponse = this.dataCache.get(key);
            if (!result?.visionProfilePhotoList?.feeds) continue;
            list.push(...result?.visionProfilePhotoList?.feeds);
        }
        return unionBy(list, o => o.photo.id).splice(0, this.condition.limitPerId);
    }
}