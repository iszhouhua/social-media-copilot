/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default defineBackground(() => {
    onMessage('openPopup', () => {
        return browser.action.openPopup();
    });

    onMessage('openTaskDialog', ({ data, sender }) => {
        return sendMessage('openTaskDialog', data, sender.tab?.id);
    });

    onMessage('fetch', ({ data, sender }) => {
        return browser.scripting.executeScript({
            target: {
                tabId: sender.tab?.id!
            },
            world: "MAIN",
            // @ts-ignore
            func: (data) => window.fetch(data.url, data).then(res => res.json()).catch(() => null),
            args: [data]

        }).then(res => res?.[0]?.result);
    });

    onMessage('webmsxyw', ({ data, sender }) => {
        return browser.scripting.executeScript({
            target: {
                tabId: sender.tab?.id!
            },
            world: "MAIN",
            func: (path, body) => {
                // @ts-ignore
                return window["_webmsxyw"](path, body ? JSON.parse(body) : undefined);
            },
            args: [data.path, data.body ? JSON.stringify(data.body) : '']

        }).then(res => res?.[0]?.result as any);
    });

    onMessage('mnsv2', ({ data, sender }) => {
        return browser.scripting.executeScript({
            target: {
                tabId: sender.tab?.id!
            },
            world: "MAIN",
            func: (a,b) => {
                // @ts-ignore
                return window["mnsv2"](a,b);
            },
            args: data

        }).then(res => res?.[0]?.result as any);
    });

    onMessage('download', ({ data }) => {
        return browser.downloads.download(data);
    });
});