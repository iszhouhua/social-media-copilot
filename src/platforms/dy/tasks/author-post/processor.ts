import { TaskFileInfo, TaskProcessor } from "@/components/task";
import { FormSchema } from ".";
import * as http from "@/platforms/dy/http";

export class Processor extends TaskProcessor<FormSchema, {
    author: http.user.UserInfo,
    awemes: http.aweme.AwemeDetail[]
}> {

    async execute() {
        const { authorIds, limitPerId } = this.condition;
        let total = authorIds.length * limitPerId;
        let completed = 0;
        this.actions.setTotal(total);
        for (const authorId of authorIds) {
            const userProfile = await http.user.userProfileOther(authorId);
            const posts = await this.getAuthorPosts(authorId, limitPerId, completed);
            total += posts.length - limitPerId;
            completed += posts.length;
            this.actions.setCompleted(completed);
            this.actions.setTotal(total);
            this.data[authorId] = {
                author: userProfile.user,
                awemes: posts
            };
        }
    }

    async getFileInfos(): Promise<Array<TaskFileInfo>> {
        const { authorIds } = this.condition;
        const dataList: any[][] = [[
            '达人ID',
            '抖音号',
            '达人昵称',
            '达人链接',
            '粉丝数',
            '达人简介',
            '视频ID',
            '视频链接',
            '媒体类型',
            '视频描述',
            '点赞数',
            '收藏数',
            '评论数',
            '分享数',
            '发布时间',
        ]];
        const medias: Array<TaskFileInfo> = [];
        for (const authorId of authorIds) {
            const dataInfo = this.data[authorId];
            const author = dataInfo.author;
            for (const aweme of dataInfo.awemes) {
                if (!aweme) continue;
                const files = this.getMediaFile(aweme);
                files.forEach(file => file.path = author?.nickname || authorId);
                medias.push(...files);
                const row = [];
                row.push(authorId);
                row.push(author?.unique_id || author?.short_id);
                row.push(author?.nickname);
                row.push(`https://www.douyin.com/user/${author?.sec_uid}`);
                row.push(author?.follower_count);
                row.push(author?.signature);

                row.push(aweme.aweme_id);
                row.push(aweme.share_url);

                row.push(aweme.media_type === 2 ? '图集' : '视频');
                row.push(aweme.desc);

                row.push(aweme.statistics?.digg_count);
                row.push(aweme.statistics?.collect_count);
                row.push(aweme.statistics?.comment_count);
                row.push(aweme.statistics?.share_count);

                row.push(new Date(aweme.create_time * 1000));
                dataList.push(row);
            }
        }
        const name = authorIds.length === 1 ? `${this.data[authorIds[0]]?.author?.nickname}的视频数据` : "根据达人ID导出视频数据";
        return [this.getExcelFileInfo(dataList, "抖音-" + name), ...medias];
    }


    getMediaFile(aweme: http.aweme.AwemeDetail): TaskFileInfo[] {
        const { materialTypes } = this.condition;
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
                });
            }
        }
        return fileInfos;
    }

    /**
     * 获取达人的视频
     * @param authorId 达人ID
     * @param limit 条数限制
     */
    async getAuthorPosts(
        authorId: string,
        limit: number,
        offset: number = 0
    ): Promise<http.aweme.AwemeDetail[]> {
        let cursor = 0;
        const list: http.aweme.AwemeDetail[] = [];
        while (true) {
            const result = await this.request(http.aweme.awemePost, {
                sec_user_id: authorId,
                max_cursor: cursor,
                count: limit - list.length < 10 ? 10 : 20,
                cut_version: 1
            });
            list.push(...result.aweme_list);
            cursor = result.max_cursor;
            this.actions.setCompleted(offset + list.length);
            if (list.length >= limit) {
                // 已经够了
                break;
            }
            if (!result.has_more) {
                // 没有数据了
                break;
            }
        }
        return list;
    }
}