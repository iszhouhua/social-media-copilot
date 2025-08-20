import { TaskProcessor } from "@/utils/task";
import { FormSchema } from ".";
import * as http from "../../api";

export class Processor extends TaskProcessor<FormSchema> {
    getMediaDownloadOptions() { return [] }

    async execute() {
        const { urls } = this.condition;
        this.actions.setTotal(urls.length);
        for (const url of urls) {
            await this.next({
                func: http.user.userProfileOther,
                args: [url.id],
                key: url.id
            }).then(res => res.user);
            this.actions.setCompleted(prev => prev + 1);
        }
    }

    getDataDownloadOption(): TaskDownloadOption {
        const dataList: any[][] = [[
            '达人UID',
            '达人链接',
            '抖音号',
            '达人昵称',
            '达人性别',
            '个人简介',
            '粉丝数',
            '获赞',
            '关注',
            '作品总数',
            'IP地址'
        ]];
        for (const url of this.condition.urls) {
            const userProfile: DouyinAPI.UserProfileOther = this.dataCache.get(url.id);
            const row = [];
            row.push(null);
            row.push(url.href);
            dataList.push(row);
            if (!userProfile?.user) continue;
            const info = userProfile.user;
            row[0] = info.uid;
            row.push(info.unique_id || info.short_id);
            row.push(info.nickname);
            row.push(info.gender === 1 ? '男' : info.gender === 2 ? '女' : '未知');
            row.push(info.signature);
            row.push(info.follower_count);
            row.push(info.total_favorited);
            row.push(info.following_count);
            row.push(info.aweme_count);
            row.push(info.ip_location?.replace("IP属地：", ''));
        }
        return generateExcelDownloadOption(dataList, "抖音-批量导出达人信息");
    }
}