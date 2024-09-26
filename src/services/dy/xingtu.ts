import type { EntranceAuthorInfo } from "./xingtu.d";
import { browser } from "wxt/browser";
export * from './xingtu.d';

export function entranceAuthorInfo(core_user_id: string): Promise<EntranceAuthorInfo> {
    return browser.runtime.sendMessage<"fetch">({
        name: "fetch",
        body: [`https://www.xingtu.cn/gw/api/author/entrance/author/info?core_user_id=${core_user_id}`]
    });
}