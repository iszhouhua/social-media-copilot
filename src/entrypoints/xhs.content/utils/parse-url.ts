import { split } from "lodash";

export type ParsePostUrlResult = {
    id: string;
    source: string;
    token: string;
    href: string;
}

export type ParseAuthorUrlResult = {
    id: string;
    href: string;
}

export async function parseAuthorUrl(url: URL): Promise<ParseAuthorUrlResult> {
    const pattern: RegExp = /^[a-zA-Z0-9]{24}$/;
    const id = split(url.pathname, "/").reverse()[0];
    if (pattern.test(id)) {
        return { id, href: url.href };
    }
    throw new Error(`Invalid URL: ${url}`);
}

export async function parsePostUrl(url: URL): Promise<ParsePostUrlResult> {
    const urlStr = url.href;
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

const imageCdns: string[] = [
    "https://sns-img-qc.xhscdn.com",
    "https://sns-img-hw.xhscdn.com",
    "https://sns-img-bd.xhscdn.com",
    "https://sns-img-qn.xhscdn.com",
];

export function getImageUrl(imageInfo: XhsAPI.ImageInfo, format: string = "png") {
    const url = new URL(imageInfo.url_default);
    const parts = url.pathname.split('/').reverse();
    const traceId = parts[0].split("!")[0];
    const randomIndex = Math.floor(Math.random() * imageCdns.length);
    if (url.pathname.includes("/notes_pre_post/")) {
        return `${imageCdns[randomIndex]}/notes_pre_post/${traceId}?imageView2/format/${format}`;
    } else if (url.pathname.includes("/comment/")) {
        return `${imageCdns[randomIndex]}/comment/${traceId}?imageView2/format/${format}`;
    }
    return `${imageCdns[randomIndex]}/${traceId}?imageView2/format/${format}`;
}

const videoCdns: string[] = [
    "https://sns-video-qc.xhscdn.com",
    "https://sns-video-hw.xhscdn.com",
    "https://sns-video-bd.xhscdn.com",
    "https://sns-video-qn.xhscdn.com",
];

export function getVideoUrl(videoInfo: XhsAPI.VideoInfo) {
    const randomIndex = Math.floor(Math.random() * videoCdns.length);
    const videoKey = videoInfo.consumer.origin_video_key;
    return `${videoCdns[randomIndex]}/${videoKey}`;
}