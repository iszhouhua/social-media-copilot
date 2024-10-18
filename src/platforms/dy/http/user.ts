import request from ".";
import type { UserProfileOther } from "./user.d";
export * from './user.d';

export function userProfileOther(sec_user_id: string, source: string = 'channel_pc_web'): Promise<UserProfileOther> {
    return request({
        url: '/aweme/v1/web/user/profile/other/',
        params: {
            sec_user_id,
            source
        },
    })
}