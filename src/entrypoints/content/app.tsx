/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Toaster } from "@/components/ui/sonner";
import { Platform } from "@/platforms";

export const App = ({ platform }: {
    platform:Platform;
}) => {
    const [taskDialog, setTaskDialog] = useState<{ name: string, props?: Record<string, any> }>();


    useEffect(() => {
        const listener = (event: CustomEvent<{ name: string, props?: Record<string, any> }>) => {
            setTaskDialog(event.detail);
        };
        window.addEventListener("task-dialog", listener);
        return () => window.removeEventListener("task-dialog", listener);
    }, []);

    const TaskDialog = taskDialog?.name && platform.tasks.find(t => t.displayName === taskDialog.name);

    return (<>
        <Toaster position="top-center" theme="light" richColors expand />
        {TaskDialog && <TaskDialog {...taskDialog.props} />}
    </>
    );
};