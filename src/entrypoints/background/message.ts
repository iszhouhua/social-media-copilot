import { MessageRequest } from "../../../types/message";
import type { Runtime } from "wxt/browser";

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
      return executionFetch(body);
    case "download":
      if (body.filename) {
        const regexp: RegExp = /[^\w\u4e00-\u9fa5\.\-\_]/g;
        // 替换掉特殊字符
        body.filename = "【社媒助手】" + body.filename.replace(regexp, "");
      }
      return browser.downloads.download(body);
  }
}

async function executeScript(code: string, sender: Runtime.MessageSender) {
  const injectionResults = await browser.scripting.executeScript({
    // @ts-ignore
    world: "MAIN",
    target: { tabId: sender.tab?.id! },
    // @ts-ignore
    func: (code) => new Function(code)(),
    args: [code]
  });
  return injectionResults?.[0]?.result;
}
async function getRealUrl(url: string) {
  const response = await fetch(url);
  return response.url;
}

async function executionFetch(body: Array<any>) {
  return fetch(body[0], body?.[1]).then(res => res.json());
}