import "~/assets/tailwind.css";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import { navigateListener } from "./listener";
import { updateReference } from "./reference";

export default defineContentScript({
  matches: ["*://www.xiaohongshu.com/*", "*://www.douyin.com/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    // 绑定当前上下文
    window.context = ctx;
    // 通用内容
    const ui = await createShadowRootUi(ctx, {
      name: "social-media-copilot",
      anchor: "html",
      position: "overlay",
      zIndex: 2147483647,
      isolateEvents: true,
      onMount: (uiContainer: HTMLElement, shadow: ShadowRoot) => {
        // 更新window引用
        updateReference(shadow);
        // 修正样式(sonner组件的样式会被注入到head中，将其移动到shadow之中)
        const style = Array.from(document.head.querySelectorAll("style")).filter(o => o.textContent?.includes("data-sonner-toaster"))?.[0];
        shadow.head.appendChild(style);
        // 挂载
        const common = document.createElement("div");
        common.id = "root";
        uiContainer.append(common);
        const root = ReactDOM.createRoot(common);
        root.render(<App />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      }
    });
    ui.mount();
    // 监听url变化
    navigateListener();
  }
});