import { defineExtensionMessaging } from '@webext-core/messaging';
import type { Downloads } from "wxt/browser";

export interface ProtocolMap {
    download(options: Downloads.DownloadOptionsType & { path?: string }): number;
    realUrl(url: string): string;
    fetch(data: RequestInit & { url: string }): any;
    openPopup(): void;
    openTaskDialog(data: { name: string } & Record<string, any>): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();