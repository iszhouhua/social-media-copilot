import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TaskProcessor } from "@/utils/task";
import { throttle } from "lodash";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { DownloadMedia } from "./download-media";

export enum TaskStatus {
    /**
     * 默认状态
     */
    INITIAL,
    /**
     * 执行中
     */
    EXECUTING,
    /**
     * 运行完成
     */
    COMPLETED,
    /**
     * 运行失败
     */
    FAILED
}

export const TaskProgress = (props: {
    processor: TaskProcessor;
    onClose: () => void;
}) => {
    const { processor, onClose } = props;
    const [total, setTotal] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.INITIAL);
    const [reason, setReason] = useState<string>("");

    useEffect(() => {
        setTotal(0);
        setCompleted(0);
        setStatus(processor ? TaskStatus.EXECUTING : TaskStatus.INITIAL);
    }, [processor]);

    useEffect(() => {
        if (!processor || status !== TaskStatus.EXECUTING) return;
        // 执行任务
        const controller = new AbortController();
        processor.signal = controller.signal;
        processor.actions = { setCompleted, setTotal };
        setCompleted(0);
        processor.execute().then(() => {
            setStatus(TaskStatus.COMPLETED);
        }).catch(err => {
            console.error(err);
            setReason(err?.message);
            setStatus(TaskStatus.FAILED);
        });
        return () => controller.abort();
    }, [status]);

    const handleDownloadData = async () => {
        if (!processor) return;
        const option = await processor.getDataDownloadOption();
        await sendMessage("download", option)
            .then(() => {
                toast.success("下载成功");
            }).catch(() => {
                toast.error("下载失败");
            });
        URL.revokeObjectURL(option.url);
    };

    const percentage = Math.min(Math.floor((completed ?? 0) / (total || 100) * 100), 100);

    return (<div className="w-96 right-4 bottom-4 fixed bg-background p-6 border rounded shadow flex flex-col gap-2">
        <div>
            {status === TaskStatus.EXECUTING && <div className="flex items-center gap-2"><h3 className="text-lg font-bold">正在处理中</h3><Loader2 className="size-4 animate-spin" /></div>}
            {status === TaskStatus.COMPLETED && <h3 className="text-lg font-bold text-primary">处理完成</h3>}
            {status === TaskStatus.FAILED && <h3 className="text-lg font-medium text-destructive">{reason || "处理失败"}</h3>}

            <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        </div>
        <div className="w-full flex items-center gap-2 px-2">
            <Progress value={percentage} /><span>{percentage}%</span>
        </div>
        <div className="text-muted-foreground text-center">已完成 {completed}/{total}</div>
        <div className="flex flex-row justify-end space-x-4">
            {status === TaskStatus.EXECUTING && <Button size='sm' variant='secondary' onClick={() => setStatus(TaskStatus.FAILED)}>中止</Button>}
            {status === TaskStatus.FAILED && <Button size='sm' variant='secondary' onClick={() => setStatus(TaskStatus.EXECUTING)}>重试</Button>}
            <Button size='sm' onClick={throttle(handleDownloadData, 3000)} disabled={status === TaskStatus.EXECUTING}>导出数据</Button>
            {processor?.mediaOptions?.length > 0 && <DownloadMedia processor={processor} >
                <Button size='sm' disabled={status === TaskStatus.EXECUTING}>下载素材</Button>
            </DownloadMedia>}
        </div>
    </div>)
}