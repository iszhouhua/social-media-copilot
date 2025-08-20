import type { MediaOption } from "@/components/common/download-media";

export const postMediaOptions: MediaOption[] = [{
    value: "video",
    label: "视频/图集"
}, {
    value: "cover",
    label: "封面"
}, {
    value: "music",
    label: "音乐"
}];

export function getPostMedias(aweme: DouyinAPI.AwemeDetail, mediaTypes: string[]): TaskDownloadOption[] {
    if (mediaTypes.length === 0) return [];
    const fileInfos: TaskDownloadOption[] = [];
    const name = `${aweme.aweme_id}/${getSafeFilename(aweme.desc || '无标题')}`;
    if (mediaTypes.includes('video')) {
        if (aweme.media_type === 2) {
            aweme.images?.forEach((value, index) => {
                fileInfos.push({
                    filename: `${name}-图${index + 1}.png`,
                    url: value.url_list.reverse()[0]
                });
            });
        } else {
            const addr = aweme.video.play_addr;
            let url = `https://www.douyin.com/aweme/v1/play/?video_id=${addr.uri}`;
            fileInfos.push({
                filename: `${name}.${aweme.video?.format || 'mp4'}`,
                url: url,
                size: addr.data_size
            });
        }
    }
    if (mediaTypes.includes("cover")) {
        // 导出封面
        const url = aweme.video?.cover?.url_list?.reverse()?.[0];
        if (url) {
            fileInfos.push({
                filename: `${name}.png`,
                url: url
            });
        }
    }
    if (mediaTypes.includes('music')) {
        // 导出音乐
        const url = aweme.music?.play_url?.url_list?.[0];
        if (url) {
            fileInfos.push({
                filename: `${name}.mp3`,
                url: url
            });
        }
    }
    return fileInfos;
}

export function getCommentMedias(comment: DouyinAPI.BaseComment): TaskDownloadOption[] {
    const medias: TaskDownloadOption[] = [];
    const name = `${comment.aweme_id}/${comment.cid}/` + getSafeFilename(comment.text || '无内容');
    if (comment.image_list?.length) {
        comment.image_list?.forEach((o, index) => {
            medias.push({
                filename: `${name}-图${index + 1}.png`,
                url: o.origin_url.url_list.reverse()[0],
            });
        });
    } else if (comment.sticker) {
        const static_url = comment.sticker.static_url?.url_list?.reverse()?.[0];
        if (static_url) {
            medias.push({
                filename: `${name}.png`,
                url: static_url,
            });
        }
    }
    return medias;
}
