import request from ".";
import type { CommentPageParam, CommentSubPageParam, WebV2CommentPage, WebV2CommentSubPage } from "./comment.d";
export * from './comment.d';

export function getCommentPage(params: CommentPageParam): Promise<WebV2CommentPage> {
    return request({
        url: '/api/sns/web/v2/comment/page',
        params,
    })
}

export function getCommentSubPage(params: CommentSubPageParam): Promise<WebV2CommentSubPage> {
    return request({
        url: '/api/sns/web/v2/comment/sub/page',
        params,
    })
}