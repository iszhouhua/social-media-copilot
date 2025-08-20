declare namespace XhsAPI {
    interface UserInfo {
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
        pictures: Array<ImageInfo>;
        status: number;
        user_info: UserInfo;
    }

    interface SubComment extends BaseComment {
        target_comment: {
            id: string;
            user_info: UserInfo;
        };
    }

    interface Comment extends BaseComment {
        sub_comment_count: string;
        sub_comment_cursor: string;
        sub_comment_has_more: boolean;
        sub_comments: SubComment[];
        user_info: UserInfo;
    }

    // 一级评论数据
    interface WebV2CommentPage {
        user_id: string;
        comments: Comment[];
        cursor: string;
        has_more: boolean;
        time: number;
    }

    // 子评论数据
    interface WebV2CommentSubPage {
        user_id: string;
        comments: SubComment[];
        cursor: string;
        has_more: boolean;
        time: number;
    }



    interface CommentPageParam {
        note_id: string;
        cursor: string;
        xsec_token: string;
        top_comment_id: string;
        image_formats: string;
    }

    interface CommentSubPageParam extends CommentPageParam {
        root_comment_id: string;
        num: number;
    }
    interface User {
        user_id: string;
        nickname: string;
        avatar: string;
    }

    interface ImageInfo {
        height: number;
        width: number;
        trace_id: string;
        live_photo: boolean;
        file_id: string;
        url_pre: string;
        url_default: string;
        url: string;
        stream: any;
    }

    interface InteractInfo {
        relation: string;
        liked_count: string;
        collected_count: string;
        comment_count: string;
        share_count: string;
    }

    interface NoteCard {
        desc: string;
        image_list: ImageInfo[];
        interact_info: InteractInfo;
        ip_location: string;
        last_update_time: number;
        note_id: string;
        time: number;
        title: string;
        // video or normal
        type: string;
        user: User;
        video: VideoInfo;
    }

    interface VideoInfo {
        media: {
            stream: any;
            video_id: number;
            video: any;
        };
        image: {
            first_frame_fileid: string;
            thumbnail_fileid: string;
        };
        capa: {
            duration: number;
        };
        consumer: {
            origin_video_key: string;
        };
    }

    interface WebV1Feed {
        cursor_score: string;
        items: Array<{
            id: string;
            model_type: string;
            note_card: NoteCard;
        }>;
        current_time: number;
    }

    interface WebV1UserPostedParam {
        user_id: string
        num: number
        cursor?: string
        image_formats: string
    }

    interface WebV1UserPosted {
        cursor: string
        notes: Array<NoteInfo>
        has_more: boolean
    }


    interface WebV1UserOtherinfo {
        result: {
            success: boolean
            code: number
            message: string
        }
        basic_info: {
            images: string
            red_id: string
            gender: number
            ip_location: string
            desc: string
            imageb: string
            nickname: string
        }
        interactions: {
            type: string
            name: string
            count: string
        }[]
        tags: {
            icon: string
            tagType: string
        }[]
        extra_info: {
            fstatus: string
            blockType: string
        }
    }

    interface NoteInfo {
        type: string
        display_title: string
        user: {
            nick_name: string
            avatar: string
            user_id: string
            nickname: string
        }

        interact_info: {
            liked: boolean
            liked_count: string
            sticky: boolean
        }
        cover: {
            url: string
            trace_id: string
            info_list: Array<{
                url: string
                image_scene: string
            }>
            url_pre: string
            url_default: string
            file_id: string
            height: number
            width: number
        }
        note_id: string
        xsec_token: string
    }
}