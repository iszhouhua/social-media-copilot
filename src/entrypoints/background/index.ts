import handleMessage from "./message.ts";

export default defineBackground(() => {
  // 监听消息
  browser.runtime.onMessage.addListener(handleMessage);
});
