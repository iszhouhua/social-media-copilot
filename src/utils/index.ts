import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getDomain } from "tldts";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type Platform = {
    code: "dy" | "xhs" | "ks";
    url: string;
    pattern: string;
}

export function getPlatform(urlStr: string): Platform | undefined {
    const domain = getDomain(urlStr);
    switch (domain) {
        case "xiaohongshu.com":
            return {
                code: "xhs",
                url: "https://www.xiaohongshu.com",
                pattern: "*://www.xiaohongshu.com/*"
            };
        case "douyin.com":
            return {
                code: "dy",
                url: "https://www.douyin.com",
                pattern: "*://www.douyin.com/*"
            };
        case "kuaishou.com":
            return {
                code: "ks",
                url: "https://www.kuaishou.com",
                pattern: "*://www.kuaishou.com/*"
            };
    }
}