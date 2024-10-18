export interface WebV1UserPostedParam {
    user_id: string
    num: number
    cursor?: string
    image_formats: string
}

export interface WebV1UserPosted {
    cursor: string
    notes: Array<NoteInfo>
    has_more: boolean
}


export interface WebV1UserOtherinfo {
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

export interface NoteInfo {
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