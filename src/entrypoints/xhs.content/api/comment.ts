import request from "./request";

export function getCommentPage(params: XhsAPI.CommentPageParam): Promise<XhsAPI.WebV2CommentPage> {
    return request({
        url: '/api/sns/web/v2/comment/page',
        params,
    })
}

export function getCommentSubPage(params: XhsAPI.CommentSubPageParam): Promise<XhsAPI.WebV2CommentSubPage> {
    return request({
        url: '/api/sns/web/v2/comment/sub/page',
        params,
    })
}