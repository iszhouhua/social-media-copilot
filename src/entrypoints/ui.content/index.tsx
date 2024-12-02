import ReactDOM from "react-dom/client";
import "~/assets/tailwind.css";
import { App } from "./app";
import { updateReference } from "./reference";

export default defineContentScript({
  matches: [
    "*://www.xiaohongshu.com/*",
    "*://www.douyin.com/*",
  ],
  cssInjectionMode: "ui",
  async main(ctx) {
    const platform = getPlatform();
    const tasks: React.FunctionComponent[] = await import(`@/tasks/${platform}/index.ts`).then((module) => module.default);
    await createShadowRootUi(ctx, {
      name: "social-media-copilot",
      anchor: "html",
      position: "overlay",
      zIndex: 2147483647,
      isolateEvents: true,
      onMount: (uiContainer: HTMLElement, shadow: ShadowRoot) => {
        updateReference(shadow);
        // 修正样式(sonner组件的样式会被注入到head中，将其移动到shadow之中)
        const style = Array.from(document.head.querySelectorAll("style")).filter(o => o.textContent?.includes("data-sonner-toaster"))?.[0];
        shadow.head.appendChild(style);
        const wrapper = document.createElement("div");
        wrapper.id = "social-media-copilot-root";
        uiContainer.append(wrapper);
        const root = ReactDOM.createRoot(wrapper);
        root.render(<App tasks={tasks} />);
        return { root, wrapper };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      }
    }).then(ui => ui.mount());
    // handle dynamic ui
    const uis: SocialMediaCopilotUi[] = await import(`./${platform}/index.ts`).then((module) => module.default);
    const handle = (url: URL) => {
      uis.forEach(async (ui) => {
        for (const match of ui.matches) {
          let isMatch = false;
          if (typeof match === 'function') {
            isMatch = await match(url);
          } else {
            isMatch = new MatchPattern(match).includes(url);
          }
          if (isMatch) {
            ui.mount();
            return;
          }
        }
        ui.remove();
      });
    }
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => handle(newUrl));
    handle(new URL(location.href));
  }
});
