import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Button } from "@/components/ui/button.tsx";
import { throttle } from "lodash";
import { TaskFileInfo, TaskProcessor, TaskSetStateActions, TaskStatus } from ".";
import { toast } from "sonner";
import React from "react";

type StartFunc = <P> (processorClass: { new(condition: P, actions: TaskSetStateActions): TaskProcessor<P>; }, condition: P) => void

export const TaskDialog = React.forwardRef<{ start: StartFunc; }, { children: React.ReactNode; }>(({ children }, ref) => {
    const [total, setTotal] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.INITIAL);
    const [processor, setProcessor] = useState<TaskProcessor>();

    React.useImperativeHandle(ref, () => ({
        start: (processorClass, condition) => {
            setProcessor(new processorClass(condition, {
                setTotal,
                setCompleted,
                setStatus
            }));
            setCompleted(0);
            setStatus(TaskStatus.EXECUTING);
        }
    }));

    useEffect(() => {
        if (!processor) return;
        processor.status = status;
        if (status === TaskStatus.EXECUTING) {
            processor?.execute()
                .then(() => setStatus(TaskStatus.COMPLETED))
                .catch((err: any) => {
                    console.error(err);
                    toast.error(err?.message || '未知异常');
                    setStatus(TaskStatus.FAILED);
                });
        }
        return () => {
            processor.status = TaskStatus.INITIAL;
        }
    }, [status]);

    const handleDownload = async () => {
        const files: Array<TaskFileInfo> = await processor!.getFileInfos();
        for (const file of files) {
            let url: string;
            if (file.type === "blob") {
                url = URL.createObjectURL(file.data);
            } else {
                url = file.data;
            }
            await browser.runtime.sendMessage<"download">({ name: "download", body: { url, filename: file.filename } });
            URL.revokeObjectURL(url);
        }
    };

    const percentage = Math.floor((completed ?? 0) / (total || 100) * 100);

    return (<Dialog open={true} onOpenChange={() => {
        setStatus(TaskStatus.INITIAL);
        window.dispatchEvent(new CustomEvent("task-dialog"));
    }}>
        {status ? (
            <DialogContent className="max-w-[425px]" onInteractOutside={e => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>处理任务</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center gap-4 py-2">
                    {status === TaskStatus.EXECUTING && <h3 className="text-lg font-medium">正在处理中</h3>}
                    {status === TaskStatus.COMPLETED &&
                        <h3 className="text-lg font-medium text-primary">处理完成</h3>}
                    {status === TaskStatus.FAILED &&
                        <h3 className="text-lg font-medium text-destructive">处理失败</h3>}
                    <div className="w-full flex items-center gap-2">
                        <Progress value={percentage} /><span>{percentage}%</span>
                    </div>
                    <div className="text-muted-foreground">已完成 {completed}/{total || "?"}</div>
                </div>

                <DialogFooter>
                    {status === TaskStatus.FAILED &&
                        <Button variant="outline"
                            onClick={throttle(() => setStatus(TaskStatus.EXECUTING), 3000)}>重试</Button>}
                    {(status === TaskStatus.FAILED || status === TaskStatus.COMPLETED) &&
                        <Button onClick={throttle(handleDownload, 5000)}>下载</Button>}
                </DialogFooter>
            </DialogContent>) : children}
    </Dialog>);
})