import { compact, split } from "lodash";

export type ParseUrlResult = {
    id: string;
    href: string;
}

export async function parseUrl(url: URL): Promise<ParseUrlResult> {
    const urlStr = url.href;
    if (url.hostname.includes("douyin.com")) {
        const pattern = /^[0-9]+$/;
        const modalId = url.searchParams.get("modal_id");
        if (modalId && pattern.test(modalId)) {
            return { id: modalId, href: urlStr };
        }
        const id = compact(split(url.pathname, "/")).reverse()[0];
        if (pattern.test(id)) {
            return { id, href: urlStr };
        }
    }
    throw new Error(`Invalid URL: ${url}`);
}