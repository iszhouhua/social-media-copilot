export async function parseAuthorId(idOrUrl: string): Promise<string> {
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