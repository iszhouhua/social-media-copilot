export interface UserInfo {
    nickname: string;
    image: string;
    user_id: string;
}

interface BaseComment {
    content: string;
    create_time: number;
    id: string;
    ip_location: string;
    like_count: string;
    liked: boolean;
    note_id: string;
    pictures: Array<{
        height: number;
        width: number;
        url_pre: string;
        url_default: string;
    }>;
    status: number;
    user_info: UserInfo;
}

export interface SubComment extends BaseComment {
    target_comment: {
        id: string;
        user_info: UserInfo;
    };
}

export interface Comment extends BaseComment {
    sub_comment_count: string;
    sub_comment_cursor: string;
    sub_comment_has_more: boolean;
    sub_comments: SubComment[];
    user_info: UserInfo;
}

// 一级评论数据
export interface WebV2CommentPage {
    user_id: string;
    comments: Comment[];
    cursor: string;
    has_more: boolean;
    time: number;
}

// 子评论数据
export interface WebV2CommentSubPage {
    user_id: string;
    comments: SubComment[];
    cursor: string;
    has_more: boolean;
    time: number;
}



export interface CommentPageParam {
    note_id: string;
    cursor: string;
    xsec_token:string;
    top_comment_id: string;
    image_formats: string;
}

export interface CommentSubPageParam extends CommentPageParam {
    root_comment_id: string;
    num: number;
}