import { parseAwemeId } from "./dy";
import { parseNoteId } from "./xhs";

export function getPostLabel(platform?: typeof window.platform): string {
    switch (platform || window.platform) {
        case "dy":
            return "视频";
        case "xhs":
            return "笔记";
    }
}

export function getAuthorLabel(platform?: typeof window.platform): string {
    switch (platform || window.platform) {
        case "dy":
            return "达人";
        case "xhs":
            return "博主";
    }
}

const idCache = new Map<string, string>();

export async function parsePostId(idOrUrl: string, platform?: typeof window.platform): Promise<string> {
    let id = idCache.get(idOrUrl);
    if (id) {
        return id;
    }
    switch (platform || window.platform) {
        case "dy":
            id = await parseAwemeId(idOrUrl);
            break;
        case "xhs":
            id = await parseNoteId(idOrUrl);
            break;
        default:
            throw new Error(`Invalid Platform: ${platform}`);
    }
    idCache.set(idOrUrl, id);
    return id;
}