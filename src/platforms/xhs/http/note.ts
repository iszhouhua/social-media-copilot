import request from ".";
import type { WebV1Feed } from "./note.d";
export * from './note.d';

export function webV1Feed(noteId: string, xsec_source: string, xsec_token: string): Promise<WebV1Feed> {
    return request.post('/api/sns/web/v1/feed', {
        source_note_id: noteId,
        image_formats: ['jpg', 'webp', 'avif'],
        extra: { need_body_topic: '1' },
        xsec_source, xsec_token
    })
}