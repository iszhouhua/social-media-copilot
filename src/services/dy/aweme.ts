import request from ".";
import type { AwemeV1WebDetail, AwemeV1WebPost, AwemeV1WebPostParam } from "./aweme.d";
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
        params: params,
    })
}