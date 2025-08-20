import request from "./request";

export function userProfileOther(sec_user_id: string, source: string = 'channel_pc_web'): Promise<DouyinAPI.UserProfileOther> {
    return request({
        url: '/aweme/v1/web/user/profile/other/',
        params: {
            sec_user_id,
            source,
            publish_video_strategy_type: 2,
            personal_center_strategy: 1,
            profile_other_record_enable: 1,
            land_to: 1,
        },
    })
}