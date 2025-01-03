import type { Downloads } from "wxt/browser";

export { }

type MessageMap = {
  "executeScript": {
    request: string;
    response: any
  };
  "download": {
    request: Downloads.DownloadOptionsType;
    response: number
  };
  "realUrl": {
    request: string;
    response: string;
  };
  "fetch": {
    request: Parameters<Window['fetch']>;
    response: any;
  };
  "openPopup": {};
};

export type MessageRequest<T extends keyof MessageMap> = {
  name: T;
  body?: MessageMap[T]['request'];
};

declare module 'wxt/browser' {
  interface WxtRuntime {
    sendMessage<K extends keyof MessageMap>(message: MessageRequest<K>): Promise<MessageMap[K]['response']>;
  }
}