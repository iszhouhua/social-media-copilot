import request from "./request";

export function getCommentList(params: DouyinAPI.CommentListParam): Promise<DouyinAPI.AwemeV1WebComment> {
    return request({
        url: '/aweme/v1/web/comment/list/',
        params,
    })
}

export function getCommentReplyList(params: DouyinAPI.CommentReplyListParam): Promise<DouyinAPI.AwemeV1WebCommentReply> {
    return request({
        url: '/aweme/v1/web/comment/list/reply/',
        params,
    })
}