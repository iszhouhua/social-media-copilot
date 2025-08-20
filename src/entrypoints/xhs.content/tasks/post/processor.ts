import { TaskProcessor } from "@/utils/task";
import { unionBy } from "lodash";
import { FormSchema } from ".";
import { webV1Feed } from "../../api/note";
import { getPostMedias } from "../../utils/media";

export class Processor<P extends FormSchema> extends TaskProcessor<P, XhsAPI.WebV1Feed> {
    public mediaOptions = [{
        value: "video",
        label: "视频/图片"
    }, {
        value: "cover",
        label: "视频封面"
    }];

    async execute() {
        const { urls } = this.condition;
        this.actions.setTotal(urls.length);
        for (let i = 0; i < urls.length; i++) {
            const postParam = urls[i];
            await this.next({
                func: webV1Feed,
                args: [postParam.id, postParam.source, postParam.token],
                key: postParam.id
            });
            this.actions.setCompleted(prev => prev + 1);
        }
    }

    getDataDownloadOption(): TaskDownloadOption {
        const dataList: any[][] = [[
            '笔记ID',
            '笔记链接',

            '博主ID',
            '博主链接',
            '博主昵称',

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

            '视频/图片下载链接'
        ]];
        for (const postParam of this.condition.urls) {
            const row = [];
            row.push(postParam.id);
            row.push(postParam.href);
            dataList.push(row);
            const feed = this.dataCache.get(postParam.id);
            const noteCard = feed?.items?.[0]?.note_card;
            if (!noteCard) {
                continue;
            };
            row.push(noteCard.user?.user_id);
            row.push(
                `https://www.xiaohongshu.com/user/profile/${noteCard.user?.user_id}`,
            );
            row.push(noteCard.user?.nickname);

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

            const files = getPostMedias(noteCard, ["video"]);
            row.push(files.map(f => f.url).join('\n'));
        }
        return generateExcelDownloadOption(dataList, "小红书-根据笔记链接导出笔记数据");
    }

    getMediaDownloadOptions(mediaTypes: string[]): Array<TaskDownloadOption> {
        const list: TaskDownloadOption[] = [];
        for (const postParam of unionBy(this.condition.urls, 'id')) {
            const feed = this.dataCache.get(postParam.id);
            const noteCard = feed?.items?.[0]?.note_card;
            if (!noteCard) {
                continue;
            };
            list.push(...getPostMedias(noteCard, mediaTypes));
        }
        return list;
    }
}