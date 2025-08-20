import { getImageUrl, getVideoUrl } from "./parse-url";

export function getPostMedias(noteCard: XhsAPI.NoteCard, mediaTypes: string[] = []): TaskDownloadOption[] {
    if (!mediaTypes.length) return [];
    const list: TaskDownloadOption[] = [];
    const name = `${noteCard.note_id}/` + getSafeFilename(noteCard.title || noteCard.desc || '无内容');
    if (noteCard.type === 'video') {
        if (mediaTypes.includes('video')) {
            list.push({
                filename: `${name}.mp4`,
                url: getVideoUrl(noteCard.video),
            });
        }
        if (mediaTypes.includes('cover')) {
            const value = noteCard.image_list?.[0];
            if (value) {
                list.push({
                    filename: `${name}.png`,
                    url: getImageUrl(value),
                });
            }
        }
    } else if (mediaTypes.includes('video')) {
        noteCard.image_list?.forEach(
            (value, index) => {
                list.push({
                    filename: `${name}-图${index + 1}.png`,
                    url: getImageUrl(value),
                });
                if (value.live_photo) {
                    for (const key of Object.keys(value.stream)) {
                        const liveUrl = value.stream?.[key]?.[0]?.master_url;
                        if (liveUrl) {
                            list.push({
                                filename: `${name}-图${index + 1}.mp4`,
                                url: liveUrl,
                            });
                        }
                    };
                }
            },
        );
    }
    return list;
}



export function getCommentMedias(comment: XhsAPI.BaseComment): TaskDownloadOption[] {
    const medias: TaskDownloadOption[] = [];
    const name = `${comment.note_id}/${comment.id}/${getSafeFilename(comment.content || '无内容')}`;
    comment.pictures?.forEach((o, index) => {
        medias.push({
            filename: `${name}-图${index + 1}.png`,
            url: getImageUrl(o),
        });
    });
    return medias;
}
