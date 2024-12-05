// /aweme/v1/web/comment/list/
export interface AwemeV1WebComment {
    comments: Comment[];
    cursor: number;
    has_more: number;
    total: number;
}

// /aweme/v1/web/comment/list/reply/
export interface AwemeV1WebCommentReply {
    comments: ReplyComment[];
    cursor: number;
    has_more: number;
    total: number;
}

export interface CommentListParam {
    aweme_id: string;
    cursor: number;
    count: number;
    item_type: number;
}

export interface CommentReplyListParam extends Omit<CommentListParam, "aweme_id"> {
    comment_id: commentId;
    item_id: awemeId;
}

interface BaseComment {
    aweme_id: string;
    cid: string;
    text: string;
    ip_label: string;
    create_time: number;
    digg_count: number;
    user: UserInfo;
    image_list?: Array<{
        origin_url: {
            uri: string;
            url_list: Array<string>;
            height: number;
            width: number;
        };
    }>;
    sticker:any;
    reply_id: string;
    reply_to_reply_id: string;
}

export interface Comment extends BaseComment {
    reply_comment: ReplyComment[];
    reply_comment_total: number;
}

export interface ReplyComment extends BaseComment {
    reply_to_userid: string;
    reply_to_username: string;
}

interface UserInfo {
    uid: string;
    unique_id: string;
    sec_uid: string;
    short_id: string;
    nickname: string;
    signature: string;
}
