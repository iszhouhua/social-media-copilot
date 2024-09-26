import "~/assets/tailwind.css";
import ReactDOM from "react-dom/client";
import Common from "./common.tsx";
import { defineContentScript } from "wxt/sandbox";
import { createShadowRootUi } from "wxt/client";
import { triggerCreateContentScriptUI } from "./ui";

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
        root.render(<Common />);
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

/**
 * 修改window上的全局引用
 * @param shadow 当前shadow
 */
function updateReference(shadow: ShadowRoot) {
  // 修改document
  shadow.head = shadow.querySelector("head") as HTMLHeadElement;
  shadow.body = shadow.querySelector("body") as HTMLBodyElement;
  document.shadow = shadow;
  // 修改getElementById函数，优先从shadow dom中查找
  const nativeGetElementById = document.getElementById;
  Document.prototype.getElementById = function (elementId: string) {
    const element = shadow.getElementById(elementId);
    return element ? element : nativeGetElementById.call(this, elementId);
  };
  // 设置平台并导入动态模块
  if (location.hostname === "www.xiaohongshu.com") {
    window.platform = "xhs";
    import("./xhs");
  } else if (location.hostname === "www.douyin.com") {
    window.platform = "dy";
    import("./dy");
  }
}

/**
 * 监听导航栏变化
 */
function navigateListener() {
  // 监听时立即触发一次
  triggerCreateContentScriptUI();
  let timerId: number | undefined;
  const listener = () => {
    timerId && clearTimeout(timerId);
    // 延迟500毫秒再触发创建，不然获取到的location会是原来的
    timerId = window.setTimeout(() => {
      timerId = undefined;
      triggerCreateContentScriptUI();
    }, 500);
  };
  window.navigation.addEventListener("navigate", listener);
  window.context.onInvalidated(() => window.navigation.removeEventListener("navigate", listener));
}