import { split } from "lodash";

export type ParseUrlResult = {
    id: string;
    href: string;
}

export async function parseUrl(url: URL): Promise<ParseUrlResult> {
    const pattern: RegExp = /^[a-zA-Z0-9]{24}$/;
    const id = split(url.pathname, "/").reverse()[0];
    if (pattern.test(id)) {
        return { id, href: url.href };
    }
    throw new Error(`Invalid URL: ${url}`);
}