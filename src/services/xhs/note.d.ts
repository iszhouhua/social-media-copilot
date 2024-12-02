export interface User {
    user_id: string;
    nickname: string;
    avatar: string;
}

export interface ImageInfo {
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

export interface InteractInfo {
    relation: string;
    liked_count: string;
    collected_count: string;
    comment_count: string;
    share_count: string;
}

export interface NoteCard {
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

export interface VideoInfo {
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

export interface WebV1Feed {
    cursor_score: string;
    items: Array<{
        id: string;
        model_type: string;
        note_card: NoteCard;
    }>;
    current_time: number;
}
