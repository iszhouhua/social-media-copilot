import ReactDOM from "react-dom/client";
import type { Manifest } from 'wxt/browser';
import {
    ContentScriptAnchoredOptions,
    ContentScriptPositioningOptions,
    ContentScriptUiOptions
} from "wxt/client";

export type SocialMediaCopilotUiRemove = () => void;

export type SocialMediaCopilotUiOptions = ContentScriptUiOptions<ReactDOM.Root> & {
    name: string;
    isolateEvents?: boolean | string[];
    className?: string;
    matches: (Manifest.MatchPattern | ((url: URL) => boolean))[];
    render: (props: {
        root: ReactDOM.Root,
        remove: SocialMediaCopilotUiRemove
    }) => void;
}

export function defineSocialMediaCopilotUi(options: SocialMediaCopilotUiOptions): SocialMediaCopilotUiOptions {
    return options;
}

export async function createSocialMediaCopilotUi(options: SocialMediaCopilotUiOptions): Promise<SocialMediaCopilotUiRemove> {
    const remove = () => {
        // Cleanup mounted state
        mounted?.unmount();
        // Remove uiContainer
        uiContainer?.remove();
        // Detatch shadow root from DOM
        shadow?.host?.remove();
        // removeAttribute
        anchor?.removeAttribute?.(options.name);
    };
    const anchor = await waitFor(() => getAnchor(options));
    if (!anchor) {
        console.warn('Failed to mount content script UI: could not find anchor element');
        return remove;
    };
    if (anchor.hasAttribute(options.name)) {
        return remove;
    }
    anchor.setAttribute(options.name, '');
    const shadowHost = document.createElement(options.name);
    shadowHost.style.zIndex = "100";
    // Create the shadow and isolated nodes
    const shadow = shadowHost.attachShadow({ mode: "open" });
    // add style
    const style = document.createElement("style");
    style.textContent = await loadCss().then(res => res.replaceAll(':root', ':host'));
    shadow.appendChild(style);
    const uiContainer = document.createElement("div");
    shadow.appendChild(uiContainer);
    if (options.className) uiContainer.className = options.className;
    // Add logic to prevent event bubbling if isolateEvents is true or a list of events
    if (options.isolateEvents) {
        const eventTypes = Array.isArray(options.isolateEvents)
            ? options.isolateEvents
            : ['keydown', 'keyup', 'keypress'];
        eventTypes.forEach(eventType => addEventListener(eventType, e => e.stopPropagation()));
    }
    // Add shadow root element to DOM
    mountUi(shadowHost, anchor, options.append);
    applyPosition(shadowHost, uiContainer, options);
    // Mount UI inside shadow root
    const mounted = ReactDOM.createRoot(uiContainer);
    await options.render({ root: mounted, remove });
    return remove;
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

function getAnchor(options: ContentScriptAnchoredOptions): Element | undefined {
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
    append: ContentScriptAnchoredOptions['append'],
): void {
    switch (append) {
        case undefined:
        case 'last':
            anchor.append(root);
            break;
        case 'first':
            anchor.prepend(root);
            break;
        case 'replace':
            anchor.replaceWith(root);
            break;
        case 'after':
            anchor.parentElement?.insertBefore(root, anchor.nextElementSibling);
            break;
        case 'before':
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
    // @ts-expect-error: getURL is defined per-project, but not inside the package
    const url = browser.runtime.getURL(`/content-scripts/${import.meta.env.ENTRYPOINT}.css`);
    try {
        const res = await fetch(url);
        return await res.text();
    } catch (err) {
        console.warn(
            `Failed to load styles @ ${url}. Did you forget to import the stylesheet in your entrypoint?`,
            err,
        );
        return '';
    }
}
