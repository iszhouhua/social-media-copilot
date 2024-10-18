import { split } from "lodash";

export async function parseAuthorId(idOrUrl: string): Promise<string> {
    const pattern: RegExp = /^[a-zA-Z0-9]{24}$/;
    if (pattern.test(idOrUrl)) {
        return idOrUrl;
    }
    const url = new URL(idOrUrl);
    const id = split(url.pathname, "/").reverse()[0];
    if (pattern.test(id)) {
        return id;
    }
    throw new Error(`Invalid URL: ${url}`);
}