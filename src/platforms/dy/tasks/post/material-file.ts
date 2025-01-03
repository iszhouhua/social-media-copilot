import type { TaskFileInfo } from "@/components/task";
import type { AwemeDetail } from "../../http/aweme";

export function getMaterialFiles(aweme: AwemeDetail, materialTypes: string[]): TaskFileInfo[] {
    if (!materialTypes?.length) {
        return [];
    }
    const name = `${aweme.desc}-${aweme.aweme_id}`;
    const fileInfos: TaskFileInfo[] = [];
    if (aweme.media_type === 2) {
        const images: TaskFileInfo[] = aweme.images.map((value, index) => {
            return {
                filename: `${name}-图${index + 1}.png`,
                type: 'url',
                data: value.url_list.reverse()[0],
            };
        });
        fileInfos.push(...images);
    } else {
        const url = aweme.video?.play_addr?.url_list?.[0];
        if (url) {
            fileInfos.push({
                filename: name + '.' + (aweme.video?.format || 'mp4'),
                type: 'url',
                data: url,
            });
        }
    }
    if (materialTypes.includes("cover")) {
        // 导出封面
        const url = aweme.video?.cover?.url_list?.reverse()?.[0];
        if (url) {
            fileInfos.push({
                filename: name + '.png',
                type: 'url',
                data: url,
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
            });
        }
    }
    return fileInfos;
}