export type ParseUrlResult = {
    id: string;
    href: string;
}

export async function parseUrl(url: URL): Promise<ParseUrlResult> {
    const urlStr = url.href;
    const id = url.pathname.split("/").reverse()[0];
    if (id.startsWith('MS4wLjABAAAA')) {
        return { href: urlStr, id };
    }
    throw new Error(`Invalid URL: ${url}`);
}