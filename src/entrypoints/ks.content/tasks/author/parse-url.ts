import { split } from "lodash";

export type ParseUrlResult = {
    id: string;
    href: string;
}

export async function parseUrl(url: URL): Promise<ParseUrlResult> {
    if (url.pathname.includes("/profile/")) {
        return {
            id: split(url.pathname, "/")
                .filter((o) => !!o)
                .reverse()[0],
            href: url.href
        };
    }
    throw new Error(`Invalid URL: ${url}`);
}