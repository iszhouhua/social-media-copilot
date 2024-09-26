import { MessageRequest } from "../../../types/message";
import type { Runtime } from "wxt/browser";
import { browser } from "wxt/browser";

export default async function handleMessage(
  message: MessageRequest<any>,
  sender: Runtime.MessageSender
) {
  const { name, body } = message;
  switch (name) {
    case "openPopup":
      return browser.action.openPopup();
    case "executeScript":
      return executeScript(body, sender);
    case "realUrl":
      return getRealUrl(body);
    case "fetch":
      return fetch(body).then(res => res.json());
    case "download":
      if (body.filename) {
        // 替换掉特殊字符
        body.filename = "【社媒助手】" + body.filename.replace(/[^\w\u4e00-\u9fa5\.\-\_]/g, "");
      }
      return browser.downloads.download(body);
  }
}

async function executeScript(code: string, sender: Runtime.MessageSender) {
  const injectionResults = await browser.scripting.executeScript({
    // @ts-ignore
    world: "MAIN",
    target: { tabId: sender.tab?.id! },
    func: (code) => new Function(code)(),
    args: [code]
  });
  return injectionResults?.[0]?.result;
}
async function getRealUrl(url: string) {
  const response = await fetch(url, { method: 'HEAD' });
  return response.url;
}
