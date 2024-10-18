import request from ".";
import type { WebV1UserPostedParam, WebV1UserPosted, WebV1UserOtherinfo } from "./user.d";
export * from './user.d';

export function webV1UserPosted(params: WebV1UserPostedParam): Promise<WebV1UserPosted> {
    return request({
        url: '/api/sns/web/v1/user_posted',
        params,
    })
}

export function webV1UserOtherinfo(target_user_id: string): Promise<WebV1UserOtherinfo> {
    return request({
        url: '/api/sns/web/v1/user/otherinfo',
        params:{target_user_id},
    })
}