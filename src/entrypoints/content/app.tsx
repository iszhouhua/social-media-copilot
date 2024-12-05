import { Toaster } from "@/components/ui/sonner";

export const App = () => {
    const [taskDialog, setTaskDialog] = useState<{ name: string, props?: Record<string, any> }>();


    useEffect(() => {
        const listener = (event: CustomEvent<{ name: string, props?: Record<string, any> }>) => {
            setTaskDialog(event.detail);
        };
        window.addEventListener("task-dialog", listener);
        return () => window.removeEventListener("task-dialog", listener);
    }, []);

    const TaskDialog = taskDialog?.name && getPlatform().tasks.find(t => t.displayName === taskDialog.name);

    return (<>
        <Toaster position="top-center" theme="light" richColors expand />
        {TaskDialog && <TaskDialog {...taskDialog.props} />}
    </>
    );
};