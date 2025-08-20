import request from "./request";

export function awemeDetail(awemeId: string): Promise<DouyinAPI.AwemeV1WebDetail> {
    return request({
        url: '/aweme/v1/web/aweme/detail/',
        params: {
            aweme_id: awemeId
        },
    })
}

export function awemePost(params: DouyinAPI.AwemeV1WebPostParam): Promise<DouyinAPI.AwemeV1WebPost> {
    return request({
        url: '/aweme/v1/web/aweme/post/',
        params,
    })
}

export function mixAweme(params: DouyinAPI.AwemeV1WebMixParam): Promise<DouyinAPI.AwemeV1WebbMix> {
    return request({
        url: '/aweme/v1/web/mix/aweme/',
        params,
    })
}