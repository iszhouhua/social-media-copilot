import { ContentScriptContext } from "wxt/client";

export { }

declare global {
    interface ShadowRoot {
        head: Document['head'];
        body: Document['body'];
    }
    interface Document {
        shadow: ShadowRoot;
    }
    interface Window {
        platform: 'xhs' | "dy";
        context: ContentScriptContext;
    }


    interface WindowEventMap {
        "open-dialog": CustomEvent<string>;
    }
}