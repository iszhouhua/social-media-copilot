import type { Downloads } from "wxt/browser";

export { }

type MessageMap = {
  "webmsxyw": {
    request: {
      path: string;
      body: any;
    };
    response: {
      'X-s': string;
      'X-t': string;
    }
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