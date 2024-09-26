import dy from "./dy";
import xhs from "./xhs";

export interface PlatformUtil {
    getName(): string;
    getPostLabel(): string;
    getAuthorLabel(): string;
    parsePostId(idOrUrl: string): Promise<string>;
    parseAuthorId(idOrUrl: string): Promise<string>;
}

const utils: Record<typeof window.platform, PlatformUtil> = {
    dy,
    xhs
};

export function getName(platform?: typeof window.platform): string {
    return utils[platform || window.platform].getName();
}

export function getPostLabel(platform?: typeof window.platform): string {
    return utils[platform || window.platform].getPostLabel();
}

export function getAuthorLabel(platform?: typeof window.platform): string {
    return utils[platform || window.platform].getAuthorLabel();
}

const idCache = new Map<string, string>();

export async function parsePostId(idOrUrl: string, platform?: typeof window.platform): Promise<string> {
    let id = idCache.get(idOrUrl);
    if (id) {
        return id;
    }
    id = await utils[platform || window.platform].parsePostId(idOrUrl);
    idCache.set(idOrUrl, id);
    return id;
}

export async function parseAuthorId(idOrUrl: string, platform?: typeof window.platform): Promise<string> {
    let id = idCache.get(idOrUrl);
    if (id) {
        return id;
    }
    id = await utils[platform || window.platform].parseAuthorId(idOrUrl);
    idCache.set(idOrUrl, id);
    return id;
}