import { ContentScriptContext, IntegratedContentScriptUiOptions } from "wxt/client";

export { }

declare global {
    interface WindowEventMap {
        "task-dialog": CustomEvent<{ name: string; props?: Record<string, any>; }>;
    }

    type SmcContentScriptUiOptions = IntegratedContentScriptUiOptions<ReactDOM.Root> & {
        isMatch: (newUrl: URL) => boolean
    };
}