import { defineCustomEventMessaging } from '@webext-core/messaging/page';
import { AxiosRequestConfig } from 'axios';

export interface ProtocolMap {
    request(config: AxiosRequestConfig): any;
    getWindowValue(paths: string[]): any;
}

export const { sendMessage, onMessage } = defineCustomEventMessaging<ProtocolMap>({ namespace: "social-media-copilot" });