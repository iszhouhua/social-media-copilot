import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { sendMessage } from "@/utils/messaging/extension";
import { cn } from "@/utils/tw";
import { DialogProps } from "@radix-ui/react-dialog";
import JSZip from "jszip";
import { throttle } from "lodash";
import * as React from "react";
import { UseFormHandleSubmit } from "react-hook-form";
import { toast } from "sonner";
import { TaskFileInfo, TaskProcessor, TaskSetStateActions, TaskStatus } from "./processor";

export type TaskContextValue = {
    total: number;
    completed: number;
    status: TaskStatus;
    reason?: string;
    processor: TaskProcessor;
    setTotal: React.Dispatch<React.SetStateAction<number>>;
    setCompleted: React.Dispatch<React.SetStateAction<number>>;
    setStatus: React.Dispatch<React.SetStateAction<TaskStatus>>;
    onSubmit: () => void;
}

export const TaskContext = React.createContext<TaskContextValue>(
    {} as TaskContextValue
)

export const TaskDialogContent = React.forwardRef<
    React.ElementRef<typeof DialogContent>,
    Omit<React.ComponentPropsWithoutRef<typeof DialogContent>, 'title'> &
    {
        title?: React.ReactNode;
    }
>(({ title, className, children, ...props }, ref) => {
    const { total, completed, processor, status, reason, setStatus, onSubmit } = useContext(TaskContext);

    const percentage = Math.floor((completed ?? 0) / (total || 100) * 100);

    const handleDownload = async () => {
        const files: Array<TaskFileInfo> = await processor.getFileInfos();
        for (const file of files) {
            let url: string;
            if (file.type === "blob") {
                url = URL.createObjectURL(file.data);
            } else if (file.type === "zip") {
                const blob = await getZipBlob(file.data);
                url = URL.createObjectURL(blob);
            } else {
                url = file.data;
            }
            await sendMessage("download", { url, filename: file.filename, path: file.path });
            URL.revokeObjectURL(url);
        }
        toast.success("下载成功");
    };

    const getZipBlob = (files: Array<TaskFileInfo>): Promise<Blob> => {
        const zip = new JSZip();
        for (const file of files) {
            let fileData: Blob | Promise<Blob>;
            if (file.type === "zip") {
                fileData = getZipBlob(file.data);
            } else if (file.type === "blob") {
                fileData = file.data;
            } else {
                const url = new URL(file.data);
                url.protocol = location.protocol
                fileData = fetch(url).then((res) => res.blob());
            }
            zip.file(file.filename, fileData, { binary: true });
        }
        return zip.generateAsync({ type: "blob" });
    };

    return (
        <DialogContent
            ref={ref}
            className={cn(
                status ? "max-w-[425px]" : "max-w-[600px]",
                className
            )}
            onInteractOutside={status ? e => e.preventDefault() : undefined}
            aria-describedby={undefined}
            {...props}
        >
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            {status ? (<div className="flex flex-col items-center justify-center gap-4 py-2">
                {status === TaskStatus.EXECUTING && <h3 className="text-lg font-medium">正在处理中</h3>}
                {status === TaskStatus.COMPLETED &&
                    <h3 className="text-lg font-medium text-primary">处理完成</h3>}
                {status === TaskStatus.FAILED && <div className="text-center text-destructive">
                    <h3 className="text-lg font-medium">处理失败</h3>
                    <p>{reason}</p>
                </div>}
                <div className="w-full flex items-center gap-2">
                    <Progress value={percentage} /><span>{percentage}%</span>
                </div>
                <div className="text-muted-foreground">已完成 {completed}/{total || "?"}</div>
            </div>) : children}
            <DialogFooter>
                {status === TaskStatus.INITIAL && <Button onClick={onSubmit} className="w-full">开始</Button>}
                {status === TaskStatus.FAILED && <Button variant="outline" onClick={() => setStatus(TaskStatus.EXECUTING)}>重试</Button>}
                {(status === TaskStatus.FAILED || status === TaskStatus.COMPLETED) &&
                    <Button onClick={throttle(handleDownload, 5000)}>下载</Button>}
            </DialogFooter>
        </DialogContent>)
})

export type TaskDialogProps = DialogProps & {
    handleSubmit: UseFormHandleSubmit<any>;
    Processor: new (condition: any, actions: TaskSetStateActions) => TaskProcessor;
}

export const TaskDialog = (props: TaskDialogProps) => {
    const { Processor, handleSubmit, ...restProps } = props;

    const [total, setTotal] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.INITIAL);
    const [processor, setProcessor] = useState<TaskProcessor>({} as TaskProcessor);
    const [reason, setReason] = useState<string>();

    const onSubmit = handleSubmit(throttle((values) => {
        const processor: TaskProcessor = new Processor(values, { setCompleted, setTotal, setStatus });
        setProcessor(processor);
        setStatus(TaskStatus.EXECUTING);
    }, 3000));

    useEffect(() => {
        if (status !== TaskStatus.EXECUTING) return;
        const controller = new AbortController();
        processor.execute(controller.signal).then(() => {
            setStatus(TaskStatus.COMPLETED);
        }).catch(err => {
            console.error(err);
            setReason(err?.message);
            setStatus(TaskStatus.FAILED);
        });
        return () => controller.abort();
    }, [status]);

    return (<TaskContext.Provider value={{ total, completed, status, processor, reason, setTotal, setCompleted, setStatus, onSubmit }}>
        <Dialog defaultOpen={true} onOpenChange={(open) => {
            if (!open) {
                setStatus(TaskStatus.INITIAL);
                sendMessage('openTaskDialog', { name: '' });
            }
        }} {...restProps}></Dialog>
    </TaskContext.Provider>)
}