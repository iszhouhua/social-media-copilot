import { TaskProcessor } from "@/utils/task";
import { FormSchema } from ".";
import { visionProfile, VisionProfileResponse } from "../../api/vision-profile";

export class Processor extends TaskProcessor<FormSchema> {
    getMediaDownloadOptions() { return [] }

    async execute() {
        const { urls } = this.condition;
        this.actions.setTotal(urls.length);
        for (const url of urls) {
            await this.next({
                func: visionProfile,
                args: [{ userId: url.id }],
                key: url.id
            });
            this.actions.setCompleted(prev => prev + 1);
        }
    }

    getDataDownloadOption(): TaskDownloadOption {
        const dataList: any[][] = [[
            '达人ID',
            '达人链接',
            '达人昵称',
            '达人性别',
            '个人简介',
            '粉丝数',
            '关注',
            '作品总数',
        ]];
        for (const url of this.condition.urls) {
            const userProfile: VisionProfileResponse = this.dataCache.get(url.id);
            const row = [];
            row.push(null);
            row.push(url.href);
            dataList.push(row);
            if (!userProfile?.visionProfile?.userProfile) continue;
            const info = userProfile.visionProfile.userProfile;
            row[0] = info.profile.user_id;
            row.push(info.profile.user_name);
            row.push(info.profile.gender == "F" ? '女' : info.profile.gender == "M" ? '男' : null);
            row.push(info.profile.user_text);
            row.push(info.ownerCount.fan);
            row.push(info.ownerCount.follow);
            row.push(info.ownerCount.photo_public);
        }
        return generateExcelDownloadOption(dataList, "快手-批量导出达人信息");
    }
}