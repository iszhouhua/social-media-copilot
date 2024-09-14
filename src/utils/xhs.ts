import { split } from "lodash";
import { browser } from "wxt/browser";

export async function parseNoteId(idOrUrl: string): Promise<string> {
    const pattern = /^[a-zA-Z0-9]{24}$/;
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