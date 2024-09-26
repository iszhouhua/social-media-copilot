import { compact, split } from "lodash";
import { browser } from "wxt/browser";
import { PlatformUtil } from ".";

export class DyPlatformUtil implements PlatformUtil {
    getName(): string {
        return "抖音";
    }
    getPostLabel(): string {
        return "视频";
    }
    getAuthorLabel(): string {
        return "达人";
    }
    async parsePostId(idOrUrl: string): Promise<string> {
        const pattern = /^[0-9]+$/;
        if (pattern.test(idOrUrl)) {
            return idOrUrl;
        }
        let url = new URL(idOrUrl);
        if (url.hostname === "v.douyin.com") {
            const realUrl = await browser.runtime.sendMessage<"realUrl">({
                name: "realUrl",
                body: idOrUrl
            });
            url = new URL(realUrl);
        }
        if (url.hostname.includes("douyin.com")) {
            const modalId = url.searchParams.get("modal_id");
            if (modalId && pattern.test(modalId)) {
                return modalId;
            }
            const id = compact(split(url.pathname, "/")).reverse()[0];
            if (pattern.test(id)) {
                return id;
            }
        }
        throw new Error(`Invalid URL: ${url}`);
    }
    async parseAuthorId(idOrUrl: string): Promise<string> {
        if (idOrUrl.startsWith('MS4wLjABAAAA')) {
            return idOrUrl;
        }
        let url = new URL(idOrUrl);
        if (url.hostname === "v.douyin.com") {
            const realUrl = await browser.runtime.sendMessage<"realUrl">({
                name: "realUrl",
                body: idOrUrl
            });
            url = new URL(realUrl);
        }
        const id = url.pathname.split("/").reverse()[0];
        if (id.startsWith('MS4wLjABAAAA')) {
            return id;
        }
        throw new Error(`Invalid URL: ${url}`);
    }

}

export default new DyPlatformUtil();