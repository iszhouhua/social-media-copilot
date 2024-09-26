import request from ".";
import type { CommentListParam, CommentReplyListParam, AwemeV1WebComment, AwemeV1WebCommentReply } from "./comment.d";
export * from './comment.d';

export function getCommentList(params: CommentListParam): Promise<AwemeV1WebComment> {
    return request({
        url: '/aweme/v1/web/comment/list/',
        params,
    })
}

export function getCommentReplyList(params: CommentReplyListParam): Promise<AwemeV1WebCommentReply> {
    return request({
        url: '/aweme/v1/web/comment/list/reply/',
        params,
    })
}