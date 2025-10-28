import { defineExtensionMessaging } from '@webext-core/messaging';

export interface ProtocolMap {
    fetch(data: RequestInit & { url: string }): any;
    webmsxyw(data: { path: string, body: any }): { 'X-s': string; 'X-t': string; };
    mnsv2(args: any): string;
    openPopup(): void;
    openTaskDialog(data: { name: string } & Record<string, any>): void;
    download(options: TaskDownloadOption): number;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();