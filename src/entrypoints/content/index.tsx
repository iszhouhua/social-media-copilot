/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "~/assets/tailwind.css";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import platforms, { type Platform } from "@/platforms";

export default defineContentScript({
  matches: ["*://www.xiaohongshu.com/*", "*://www.douyin.com/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const platformCode = getPlatformCode();
    if (!platformCode) return;
    const platform: Platform = platforms[platformCode];
    // 插入样式
    // @ts-ignore
    const url = browser.runtime.getURL(`/content-scripts/${import.meta.env.ENTRYPOINT}.css`);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
    // 通用内容
    createIntegratedUi(ctx, {
      anchor: "html",
      position: "overlay",
      zIndex: 1000,
      onMount: (container) => {
        const root = ReactDOM.createRoot(container);
        root.render(<App platform={platform} />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      }
    }).mount();
    const uiArray = platform.injects.map(options => {
      return {
        isMatch: options.isMatch,
        ui: createIntegratedUi(ctx, options)
      };
    });
    // 监听url变化
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
      uiArray.filter(ui => ui.isMatch(newUrl)).forEach(ui => ui.ui.mount());
    });
    waitFor(() => document.readyState === 'complete').then(() => uiArray.filter(ui => ui.isMatch(new URL(location.href))).forEach(ui => ui.ui.mount()));
  }
});