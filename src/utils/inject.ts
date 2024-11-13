import {
  ContentScriptAnchoredOptions,
  ContentScriptContext,
  ContentScriptPositioningOptions,
  ContentScriptUiOptions
} from "wxt/client";
import ReactDOM from "react-dom/client";


export interface InjectContentScriptUi {
  anchor: Element;
  shadowHost: HTMLElement;
  uiContainer: HTMLElement;
  shadow: ShadowRoot;
  mounted: ReactDOM.Root;
  remove: () => void;
};

export type InjectContentScriptUiOptions = ContentScriptUiOptions<ReactDOM.Root> &
{
  name?: string;
  isMatch: () => boolean | undefined;
  className?: string | undefined;
  onMount: (ui: InjectContentScriptUi) => void;
  isolateEvents?: boolean | string[];
};

export function defineInjectContentScriptUi(definition: InjectContentScriptUiOptions) {
  return definition;
}

const uiMap = new Map<Element, InjectContentScriptUi>();

/**
 * 触发动态创建UI
 */
export function triggerCreateInjectContentScriptUi() {
  const array = getPlatform().injects || [];
  array.forEach(async (uiDefinition) => {
    if (!uiDefinition.isMatch()) return;
    const anchor = await waitFor(() => getAnchor(uiDefinition));
    if (!anchor) return;
    const ui = await getOrCreateContentScriptUi(uiDefinition, anchor);
    uiDefinition.onMount(ui);
  });
  // 清理所有失效节点
  uiMap.forEach((value, key) => {
    if (document.contains(key)) return;
    uiMap.delete(key);
    value?.remove();
  });
}

// 避免重复创建，对当前函数进行上锁处理
let isLocked = false;
const getOrCreateContentScriptUi = async (options: InjectContentScriptUiOptions, anchor: Element) => {
  if (isLocked) {
    console.log('function is locked, waiting...');
    await waitFor(() => isLocked == false, 100, 10000);
  }
  isLocked = true;
  try {
    let ui = uiMap.get(anchor);
    if (!ui?.mounted) {
      // 没有UI，创建UI
      ui = await createContentScriptUi(window.context, options, anchor);
      uiMap.set(anchor, ui);
    }
    return ui;
  } finally {
    isLocked = false;
  }
};

async function createContentScriptUi(ctx: ContentScriptContext, options: InjectContentScriptUiOptions, anchor: Element): Promise<InjectContentScriptUi> {
  const shadowHost = document.createElement(options.name || "social-media-copilot-injected");
  // Create the shadow and isolated nodes
  const shadow = shadowHost.attachShadow({ mode: "open" });
  // add style
  const style = document.createElement("style");
  style.textContent = await loadCss().then(css => css.replaceAll(":root", ":host"));
  shadow.appendChild(style);

  const uiContainer = document.createElement("div");
  shadow.appendChild(uiContainer);

  // Add shadow root element to DOM
  mountUi(shadowHost, anchor, options.append);
  applyPosition(shadowHost, uiContainer, options);
  // Add logic to prevent event bubbling if isolateEvents is true or a list of events
  if (options.isolateEvents) {
    const eventTypes = Array.isArray(options.isolateEvents)
      ? options.isolateEvents
      : ['keydown', 'keyup', 'keypress'];
    eventTypes.forEach(eventType => {
      uiContainer.addEventListener(eventType, e => e.stopPropagation());
    });
  }
  // Mount UI inside shadow root
  uiContainer.className = options.className ?? "";
  const mounted = ReactDOM.createRoot(uiContainer);

  const remove = () => {
    // Cleanup mounted state
    mounted.unmount();
    // Remove uiContainer
    uiContainer.remove();
    // Detatch shadow root from DOM
    shadowHost.remove();
    // 从UI中移除
    uiMap.delete(anchor);
  };

  ctx.onInvalidated(remove);

  return {
    anchor,
    shadow,
    shadowHost,
    uiContainer,
    mounted,
    remove
  };
}

function applyPosition(
  root: HTMLElement,
  positionedElement: HTMLElement | undefined | null,
  options: ContentScriptPositioningOptions
): void {
  // No positioning for inline UIs
  if (options.position === "inline") return;

  if (options.zIndex != null) root.style.zIndex = String(options.zIndex);

  root.style.overflow = "visible";
  root.style.position = "relative";
  root.style.width = "0";
  root.style.height = "0";
  root.style.display = "block";

  if (positionedElement) {
    if (options.position === "overlay") {
      positionedElement.style.position = "absolute";
      if (options.alignment?.startsWith("bottom-"))
        positionedElement.style.bottom = "0";
      else positionedElement.style.top = "0";

      if (options.alignment?.endsWith("-right"))
        positionedElement.style.right = "0";
      else positionedElement.style.left = "0";
    } else {
      positionedElement.style.position = "fixed";
      positionedElement.style.top = "0";
      positionedElement.style.bottom = "0";
      positionedElement.style.left = "0";
      positionedElement.style.right = "0";
    }
  }
}

export function getAnchor(options: ContentScriptAnchoredOptions): Element | undefined {
  if (options.anchor == null) return document.body;

  let resolved =
    typeof options.anchor === "function" ? options.anchor() : options.anchor;

  if (typeof resolved === "string") {
    // If the string is an XPath expression (starts with '//' or '/')
    if (resolved.startsWith("/")) {
      // Evaluate the XPath and return the first ordered node
      const result = document.evaluate(
        resolved,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return (result.singleNodeValue as Element) ?? undefined;
    } else {
      // If the string is a CSS selector, query the document and return the element
      return document.querySelector<Element>(resolved) ?? undefined;
    }
  }
  return resolved ?? undefined;
}

function mountUi(
  root: HTMLElement,
  anchor: Element,
  append: InjectContentScriptUiOptions["append"]
): void {
  switch (append) {
    case undefined:
    case "last":
      anchor.append(root);
      break;
    case "first":
      anchor.prepend(root);
      break;
    case "replace":
      anchor.replaceWith(root);
      break;
    case "after":
      anchor.parentElement?.insertBefore(root, anchor.nextElementSibling);
      break;
    case "before":
      anchor.parentElement?.insertBefore(root, anchor);
      break;
    default:
      append(anchor, root);
      break;
  }
}

/**
 * Load the CSS for the current entrypoint.
 */
async function loadCss(): Promise<string> {
  // @ts-ignore
  const url = browser.runtime.getURL(`/content-scripts/${import.meta.env.ENTRYPOINT}.css`);
  try {
    const res = await fetch(url);
    return await res.text();
  } catch (err) {
    console.warn(
      `Failed to load styles @ ${url}. Did you forget to import the stylesheet in your entrypoint?`,
      err
    );
    return "";
  }
}
