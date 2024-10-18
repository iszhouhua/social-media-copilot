import { compact, split } from "lodash";

export async function parsePostId(idOrUrl: string): Promise<string> {
    const pattern: RegExp = /^[a-zA-Z0-9]{24}$/;
    if (pattern.test(idOrUrl)) {
        return idOrUrl;
    }
    let url = new URL(idOrUrl);
    if (url.hostname.includes("xhslink")) {
        const realUrl = await browser.runtime.sendMessage<"realUrl">({
            name: "realUrl",
            body: idOrUrl
        });
        url = new URL(realUrl);
        const originalUrl = url.searchParams.get("originalUrl");
        if (originalUrl) {
            url = new URL(originalUrl);
        }
    }
    const id = split(url.pathname, "/").reverse()[0];
    if (pattern.test(id)) {
        return id;
    }
    throw new Error(`Invalid URL: ${url}`);
}



export async function parsePostParam(urlStr: string): Promise<{
    id: string;
    source: string;
    token: string;
}> {
    let url = new URL(urlStr);
    if (url.hostname.includes("xhslink")) {
        const realUrl = await browser.runtime.sendMessage<"realUrl">({
            name: "realUrl",
            body: urlStr
        });
        url = new URL(realUrl);
    }
    const id = split(url.pathname, "/").reverse()[0];
    if (!/^[a-zA-Z0-9]{24}$/.test(id)) {
        throw new Error('笔记ID提取失败，请检测');
    }
    const token = url.searchParams.get("xsec_token");
    if(!token){
        throw new Error('链接不完整,未能检测到xsec_token参数');
    }
    const source = url.searchParams.get("xsec_source");
    if(!source){
        throw new Error('链接不完整,未能检测到xsec_source参数');
    }
    return { id, token, source };
}