// /aweme/v1/web/aweme/detail/
export interface AwemeV1WebDetail {
    aweme_detail: AwemeDetail;
}

export interface AwemeDetail {
    aweme_id: string;
    caption: string;
    desc: string;
    create_time: number;
    share_url: string;
    // 2:图文 4:视频
    media_type: number;
    video: VideoInfo;
    images: ImageInfo[];
    statistics: Statistics;
    author: AuthorInfo;
}

export interface VideoInfo {
    duration: number;
    origin_cover: {
        uri: string;
        height: number;
        width: number;
    };
    play_addr: {
        uri: string;
        url_key: string;
        height: number;
        width: number;
        data_size: number;
        url_list: string[];
    };
}

export interface ImageInfo {
    download_url_list: string[];
    height: number;
    width: number;
    uri: string;
    url_list: string[];
}

export interface Statistics {
    admire_count: number;
    aweme_id: string;
    collect_count: number;
    comment_count: number;
    digg_count: number;
    play_count: number;
    share_count: number;
}

export interface AuthorInfo {
    uid: string;
    unique_id: string;
    sec_uid: string;
    short_id: string;
    nickname: string;
    signature: string;
    follower_count: number;
}
