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
    music: any;
    images: ImageInfo[];
    statistics: Statistics;
    author: AuthorInfo;
    mix_info?: MixInfo;
}

export interface MixInfo {
    mix_id: string;
    mix_name: string;
    statis: {
        collect_vv: number;
        current_episode: number;
        play_vv: number;
        updated_to_episode: number;
    }
}

export interface VideoInfo {
    duration: number;
    format: string;
    origin_cover: {
        uri: string;
        height: number;
        width: number;
    };
    cover: {
        uri: string;
        url_key: string;
        height: number;
        width: number;
        data_size: number;
        url_list: string[];
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


// /aweme/v1/web/aweme/post/
export interface AwemeV1WebPost {
    aweme_list: AwemeDetail[];
    has_more: number;
    max_cursor: number;
    min_cursor: number;
    post_serial: number;
    replace_series_cover: number;
    request_item_cursor: number;
    status_code: number;
}

export interface AwemeV1WebPostParam {
    sec_user_id: string;
    max_cursor: number;
    count: number;
    cut_version: number;
}

export interface AwemeV1WebMixParam {
    mix_id: string;
    cursor: number;
    count: number;
}

// /aweme/v1/web/mix/aweme/
export interface AwemeV1WebbMix {
    aweme_list: AwemeDetail[];
    has_more: number;
    cursor: number;
    status_code: number;
}
