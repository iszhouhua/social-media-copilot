import { TaskFileInfo, TaskProcessor } from "@/components/task";
import { FormSchema } from ".";
import * as http from "@/platforms/dy/http";


type DataValue = http.user.UserInfo & {
    awemes?: Array<http.aweme.AwemeDetail>
}

export class Processor extends TaskProcessor<FormSchema, DataValue> {

    async execute() {
        const { authorIds, needInteractionInfo } = this.condition;
        this.actions.setTotal(authorIds.length);
        for (const authorId of authorIds) {
            const user: DataValue = await this.request(http.user.userProfileOther, authorId).then(res => res.user);
            if (needInteractionInfo) {
                user.awemes = await this.getLastAwemes(authorId, 10);
            }
            this.data[authorId] = user;
            this.actions.setCompleted(prev => prev + 1);
        }
    }

    async getFileInfos(): Promise<Array<TaskFileInfo>> {
        const extraHeaders = this.condition.needInteractionInfo ? [
            "视频样本数",
            "首篇样本发布时间",
            "最后一篇样本发布时间",
            "点赞中位数",
            "评论中位数",
            "收藏中位数",
            "分享中位数",
            "赞评藏中位数",
            "点赞平均数",
            "评论平均数",
            "收藏平均数",
            "分享平均数",
            "赞评藏平均数",
        ] : [];
        const dataList: any[][] = [[
            '达人UID',
            '抖音号',
            '达人昵称',
            '达人链接',
            '达人性别',
            '个人简介',
            '粉丝数',
            '获赞',
            '关注',
            '作品总数',
            'IP地址',
            ...extraHeaders
        ]];
        for (const authorId of this.condition.authorIds) {
            const info = this.data[authorId];
            if (!info) continue;
            const row = [];
            row.push(info.uid);
            row.push(info.unique_id || info.short_id);
            row.push(info.nickname);
            row.push(`https://www.douyin.com/user/${info.sec_uid}`);
            row.push(info.gender === 1 ? '男' : info.gender === 2 ? '女' : '未知');
            row.push(info.signature);
            row.push(info.follower_count);
            row.push(info.total_favorited);
            row.push(info.following_count);
            row.push(info.aweme_count);
            row.push(info.ip_location?.replace("IP属地：", ''));

            if (this.condition.needInteractionInfo) {
                row.push(info.awemes?.length ?? 0);
                if (!info.awemes) {
                    continue;
                }
                const awemes = info.awemes!;
                const median = (fieldName: keyof http.aweme.Statistics | "interaction_count") => {
                    const sorted = awemes.map(item => {
                        if (fieldName === "interaction_count") {
                            return item.statistics.digg_count + item.statistics.comment_count + item.statistics.collect_count;
                        }
                        return item.statistics[fieldName];
                    }).sort((a, b) => a - b);
                    const mid = Math.floor(sorted.length / 2);
                    return Math.round(sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2);
                }

                const average = (fieldName: keyof http.aweme.Statistics | "interaction_count") => {
                    const sum = awemes.map(item => {
                        if (fieldName === "interaction_count") {
                            return item.statistics.digg_count + item.statistics.comment_count + item.statistics.collect_count;
                        }
                        return item.statistics[fieldName];
                    }).reduce((acc, val) => acc + val, 0);
                    return Math.round(sum / awemes.length);
                }

                row.push(new Date(awemes[awemes.length - 1].create_time * 1000));
                row.push(new Date(awemes[0].create_time * 1000));
                row.push(median('digg_count'));
                row.push(median('comment_count'));
                row.push(median('collect_count'));
                row.push(median('share_count'));
                row.push(median('interaction_count'));
                row.push(average('digg_count'));
                row.push(average('comment_count'));
                row.push(average('collect_count'));
                row.push(average('share_count'));
                row.push(average('interaction_count'));
            }
            dataList.push(row);
        }
        return [this.getExcelFileInfo(dataList, "抖音-达人数据导出")];
    }


    /**
     * 获取达人最新的视频
     * @param userId 达人ID
     * @param limit 条数限制
     */
    async getLastAwemes(
        userId: string,
        limit: number = 10
    ): Promise<http.aweme.AwemeDetail[]> {
        const list: http.aweme.AwemeDetail[] = await this.request(http.aweme.awemePost, {
            sec_user_id: userId,
            count: limit,
            cut_version: 1,
            max_cursor: 0
        }).then(res => res.aweme_list);
        return list.sort((a, b) => b.create_time - a.create_time).slice(0, limit);
    }
}