import type { MediaOption } from "@/components/common/download-media";
import { VisionVideoDetail } from "../api/vision-video-detail";

export const postMediaOptions: MediaOption[] = [{
    value: "video",
    label: "视频/图集"
}, {
    value: "cover",
    label: "封面"
}];

export function getPostMedias(data: VisionVideoDetail, mediaTypes: string[]): TaskDownloadOption[] {
    if (mediaTypes.length === 0) return [];
    const fileInfos: TaskDownloadOption[] = [];
    const name = `${data.photo.id}/${getSafeFilename(data.photo.caption || '无标题')}`;
    if (mediaTypes.includes('video')) {
        fileInfos.push({
            filename: `${name}.mp4`,
            url: data.photo?.photoUrl,
        });
    }
    if (mediaTypes.includes('cover')) {
        fileInfos.push({
            filename: `${name}.jpg`,
            url: data.photo?.coverUrl,
        });
    }
    return fileInfos;
}