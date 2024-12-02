import { onMessage } from "@/utils/messaging/website";

export default defineContentScript({
    matches: [
        "*://www.xiaohongshu.com/*",
        "*://www.douyin.com/*",
    ],
    world: "MAIN",
    runAt: "document_end",
    async main() {
        const platform = getPlatform();
        const request = await import(`./request/${platform}.ts`).then((module) => module.default);
        onMessage('request', async ({ data }) => {
            const response = await request(data).catch((error: any) => {
                console.error('request error.', error);
                throw new Error(error.message);
            });
            return response;
        });
        onMessage('getWindowValue', async ({ data }) => {
            let result = window;
            for (const key of data) {
                // @ts-ignore
                result = result[key];
                if (!result) return;
            }
            return result;
        });
    }
});