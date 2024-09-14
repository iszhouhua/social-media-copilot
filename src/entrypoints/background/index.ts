import handleMessage from "./message.ts";
import { defineBackground } from "wxt/sandbox";
import { browser } from "wxt/browser";

export default defineBackground(() => {
  // 监听消息
  browser.runtime.onMessage.addListener(handleMessage);
});
