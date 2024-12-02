import { sendMessage } from "@/utils/messaging/extension";

export type ParseUrlResult = {
    id: string;
    href: string;
}

export async function parseUrl(url: URL): Promise<ParseUrlResult> {
    const urlStr = url.href;
    if (url.hostname === "v.douyin.com") {
        const realUrl = await sendMessage("realUrl", url.href);
        url = new URL(realUrl);
    }
    const id = url.pathname.split("/").reverse()[0];
    if (id.startsWith('MS4wLjABAAAA')) {
        return { href: urlStr, id };
    }
    throw new Error(`Invalid URL: ${url}`);
}