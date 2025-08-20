import { TaskProcessor } from "@/utils/task";
import { FormSchema } from ".";
import { webV1UserOtherinfo } from "../../api/user";

export class Processor extends TaskProcessor<FormSchema> {
    getMediaDownloadOptions() { return []; }

    async execute() {
        const { urls } = this.condition;
        this.actions.setTotal(urls.length);
        for (const url of urls) {
            await this.next({
                func: webV1UserOtherinfo,
                args: [url.id],
                key: url.id
            });
            this.actions.setCompleted(prev => prev + 1);
        }
    }

    getDataDownloadOption(): TaskDownloadOption {
        const dataList: any[][] = [[
            '博主ID',
            '博主链接',
            '博主昵称',
            '博主性别',
            '小红书号',
            '个人简介',
            '粉丝数',
            '获赞与收藏',
            '关注',
            'IP地址'
        ]];
        for (const url of this.condition.urls) {
            const row = [];
            row.push(url.id);
            row.push(url.href);
            dataList.push(row);
            const info: XhsAPI.WebV1UserOtherinfo = this.dataCache.get(url.id);
            if (!info) continue;
            row.push(info.basic_info?.nickname);
            row.push(info.basic_info?.gender === 0
                ? '男'
                : info.basic_info?.gender === 1
                    ? '女'
                    : '未知');
            row.push(info.basic_info?.red_id);
            row.push(info.basic_info.desc);
            row.push(info.interactions?.find(item => item.type === 'fans')?.count);
            row.push(info.interactions?.find(item => item.type === 'interaction')?.count);
            row.push(info.interactions?.find(item => item.type === 'follows')?.count);
            row.push(info.basic_info?.ip_location);
        }
        return generateExcelDownloadOption(dataList, "小红书-批量导出博主信息");
    }
}