import request from "./request";

export function webV1UserPosted(params: XhsAPI.WebV1UserPostedParam): Promise<XhsAPI.WebV1UserPosted> {
    return request({
        url: '/api/sns/web/v1/user_posted',
        params,
    })
}

export function webV1UserOtherinfo(target_user_id: string): Promise<XhsAPI.WebV1UserOtherinfo> {
    return request({
        url: '/api/sns/web/v1/user/otherinfo',
        params:{target_user_id},
    })
}