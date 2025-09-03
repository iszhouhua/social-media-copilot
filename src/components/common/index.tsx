/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Toaster } from "@/components/ui/sonner";
import type { TaskProcessor } from "@/utils/task";
import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
import '~/assets/tailwind.css';
import { createSocialMediaCopilotUi, SocialMediaCopilotUiOptions, SocialMediaCopilotUiRemove } from "../../utils/ui";
import { TaskProgress } from "./task-progress";

declare global {
    interface ShadowRoot {
        head: Document['head'];
        body: Document['body'];
    }
    interface Document {
        shadow: ShadowRoot;
    }
}

const App = (props: {
    tasks: TaskDialogOptions[];
}) => {
    const [taskDialogName, setTaskDialogName] = useState<string>();
    const [taskDialogProps, setTaskDialogProps] = useState<any>();
    const [taskProcessor, setTaskProcessor] = useState<TaskProcessor>();

    useEffect(() => onMessage('openTaskDialog', message => {
        const { name, ...restProps } = message.data;
        setTaskDialogName(name);
        setTaskDialogProps(restProps);
    }), []);

    const setProcessor = (processor: TaskProcessor) => {
        setTaskProcessor(processor);
        setTaskDialogName(undefined);
    }

    const TaskDialog = taskDialogName && props.tasks?.find(t => t.name === taskDialogName)?.children;

    return (<>
        <Toaster position="top-center" theme="light" richColors expand />
        {TaskDialog && <TaskDialog modal={true} open={true} onOpenChange={() => setTaskDialogName(undefined)} setProcessor={setProcessor} {...taskDialogProps} />}
        {taskProcessor && <TaskProgress processor={taskProcessor} onClose={() => setTaskProcessor(undefined)} />}
    </>
    );
};

export async function loadCommon(ctx: ContentScriptContext, tasks: TaskDialogOptions[], ui: SocialMediaCopilotUiOptions[]): Promise<void> {
    await createShadowRootUi(ctx, {
        name: "social-media-copilot",
        anchor: "html",
        position: "overlay",
        zIndex: 2147483647,
        isolateEvents: true,
        onMount: (container: HTMLElement, shadow: ShadowRoot) => {
            // update reference
            document.shadow = shadow;
            shadow.head = shadow.querySelector("head") as HTMLHeadElement;
            shadow.body = shadow.querySelector("body") as HTMLBodyElement;
            // update style
            const sonnerStyle = Array.from(document.head.querySelectorAll("style")).filter(o => o.textContent?.includes("data-sonner-toaster"))?.[0];
            shadow.head.appendChild(sonnerStyle);
            // render root
            const wrapper = document.createElement("div");
            container.append(wrapper);
            wrapper.style.fontSize = "16px";
            const root = ReactDOM.createRoot(wrapper);
            root.render(<App tasks={tasks} />);
            return { root, wrapper };
        },
        onRemove: (elements) => {
            elements?.root?.unmount();
            elements?.wrapper?.remove();
        }
    }).then(ui => ui.mount());
    // handle dynamic ui
    const uiCache: Record<string, SocialMediaCopilotUiRemove[]> = ui.reduce((acc: Record<string, SocialMediaCopilotUiRemove[]>, item) => { acc[item.name] = []; return acc; }, {});
    const handle = (url: URL) => {
        ui.forEach((item) => {
            for (const match of item.matches) {
                let isMatch: boolean;
                if (typeof match === 'function') {
                    isMatch = match(url);
                } else {
                    isMatch = new MatchPattern(match).includes(url);
                }
                if (isMatch) {
                    createSocialMediaCopilotUi(item);
                    return;
                }
            }
            uiCache[item.name].forEach((remove) => remove());
            uiCache[item.name] = [];
        });
    }
    await waitFor(() => document.readyState === 'complete').then(() => handle(new URL(location.href)));
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => handle(newUrl));
};
