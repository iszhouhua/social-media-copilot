import request from ".";
import type { AwemeV1WebDetail } from "./aweme.d";

export function getAwemeDetail(awemeId: string): Promise<AwemeV1WebDetail> {
    return request({
        url: '/aweme/v1/web/aweme/detail/',
        params: {
            aweme_id: awemeId,
        },
    })
}