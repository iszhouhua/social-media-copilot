import { Toaster } from "@/components/ui/sonner";
import { onMessage } from "@/utils/messaging/extension";

export const App = (props: {
    tasks: React.FunctionComponent[];
}) => {
    const [taskDialogName, setTaskDialogName] = useState<string>();
    const [taskDialogProps, setTaskDialogProps] = useState<any>();

    useEffect(() => onMessage('openTaskDialog', message => {
        const { name, ...restProps } = message.data;
        setTaskDialogName(name);
        setTaskDialogProps(restProps);
    }), []);

    const TaskDialog= taskDialogName && props.tasks.find(t => t.displayName === taskDialogName);

    return (<>
        <Toaster position="top-center" theme="light" richColors expand />
        {TaskDialog && <TaskDialog {...taskDialogProps} />}
    </>
    );
};