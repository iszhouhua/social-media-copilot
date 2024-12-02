import { sendMessage } from "@/utils/messaging/extension";
import { split } from "lodash";

export type ParseUrlResult = {
    id: string;
    source: string;
    token: string;
    href: string;
}

export async function parseUrl(url: URL): Promise<ParseUrlResult> {
    const urlStr = url.href;
    if (url.hostname.includes("xhslink")) {
        const realUrl = await sendMessage("realUrl", url.href);
        url = new URL(realUrl);
    }
    const id = split(url.pathname, "/").reverse()[0];
    if (!/^[a-zA-Z0-9]{24}$/.test(id)) {
        throw new Error(urlStr + '不是有效的笔记链接');
    }
    const token = url.searchParams.get("xsec_token");
    if (!token) {
        throw new Error(urlStr + '不包含xsec_token参数');
    }
    const source = url.searchParams.get("xsec_source");
    if (!source) {
        throw new Error(urlStr + '不包含xsec_source参数');
    }
    return { id, token, source, href: urlStr };
}