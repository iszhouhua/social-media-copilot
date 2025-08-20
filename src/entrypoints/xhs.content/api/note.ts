import request from "./request";

export function webV1Feed(noteId: string, xsec_source: string, xsec_token: string, image_formats: string[] = ['jpg', 'webp', 'avif']): Promise<XhsAPI.WebV1Feed> {
    return request({
        url: '/api/sns/web/v1/feed',
        method: 'POST',
        data: {
            source_note_id: noteId,
            image_formats,
            extra: { need_body_topic: '1' },
            xsec_source, xsec_token
        }
    })
}