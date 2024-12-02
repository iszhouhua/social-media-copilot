import type { AwemeDetail } from "@/services/dy/aweme";
import type { TaskFileInfo } from "@/tasks/processor";

export function getMaterialFiles(aweme: AwemeDetail, materialTypes: string[], path?: string): TaskFileInfo[] {
    if (!materialTypes?.length) {
        return [];
    }
    const name = `${aweme.desc}-${aweme.aweme_id}`;
    const fileInfos: TaskFileInfo[] = [];
    if (aweme.media_type === 2) {
        const images: TaskFileInfo[] = aweme.images.map((value, index) => {
            return {
                filename: `图${index + 1}.jpeg`,
                type: 'url',
                data: value.url_list.reverse()[0],
            };
        });
        fileInfos.push({
            filename: name + '.zip',
            path,
            type: 'zip',
            data: images,
        });
    } else {
        const uri = aweme.video?.play_addr?.uri;
        let url = aweme.video?.play_addr?.url_list?.[0];
        if (uri) {
            url = `https://aweme.snssdk.com/aweme/v1/play/?video_id=${uri}`;
        }
        if (url) {
            fileInfos.push({
                filename: name + '.' + (aweme.video?.format || 'mp4'),
                type: 'url',
                data: url,
                path,
            });
        }
    }
    if (materialTypes.includes("cover")) {
        // 导出封面
        const url = aweme.video?.cover?.url_list?.reverse()?.[0];
        if (url) {
            fileInfos.push({
                filename: name + '.jpeg',
                type: 'url',
                data: url,
                path,
            });
        }
    }
    if (materialTypes.includes('music')) {
        // 导出音乐
        const url = aweme.music?.play_url?.url_list?.[0];
        if (url) {
            fileInfos.push({
                filename: name + '.mp3',
                type: 'url',
                data: url,
                path,
            });
        }
    }
    return fileInfos;
}