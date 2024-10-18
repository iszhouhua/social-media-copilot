import { compact, split } from "lodash";

export async function parsePostId(idOrUrl: string): Promise<string> {
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