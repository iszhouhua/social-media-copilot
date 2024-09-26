import { split } from "lodash";
import { browser } from "wxt/browser";
import { PlatformUtil } from ".";


export class XhsPlatformUtil implements PlatformUtil {
    getName(): string {
        return "小红书";
    }
    getPostLabel(): string {
        return "笔记";
    }
    getAuthorLabel(): string {
        return "博主";
    }
    private pattern: RegExp = /^[a-zA-Z0-9]{24}$/;
    async parsePostId(idOrUrl: string): Promise<string> {
        if (this.pattern.test(idOrUrl)) {
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
        if (this.pattern.test(id)) {
            return id;
        }
        throw new Error(`Invalid URL: ${url}`);
    }
    async parseAuthorId(idOrUrl: string): Promise<string> {
        if (this.pattern.test(idOrUrl)) {
            return idOrUrl;
        }
        const url = new URL(idOrUrl);
        const id = split(url.pathname, "/").reverse()[0];
        if(this.pattern.test(id)){
            return id;
        }
        throw new Error(`Invalid URL: ${url}`);
    }

}

export default new XhsPlatformUtil();