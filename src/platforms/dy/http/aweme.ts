import request from ".";
import type { AwemeV1WebbMix, AwemeV1WebDetail, AwemeV1WebMixParam, AwemeV1WebPost, AwemeV1WebPostParam } from "./aweme.d";
export * from './aweme.d';

export function awemeDetail(awemeId: string): Promise<AwemeV1WebDetail> {
    return request({
        url: '/aweme/v1/web/aweme/detail/',
        params: {
            aweme_id: awemeId,
        },
    })
}

export function awemePost(params: AwemeV1WebPostParam): Promise<AwemeV1WebPost> {
    return request({
        url: '/aweme/v1/web/aweme/post/',
        params,
    })
}

export function mixAweme(params:AwemeV1WebMixParam): Promise<AwemeV1WebbMix> {
    return request({
        url: '/aweme/v1/web/mix/aweme/',
        params,
    })
}