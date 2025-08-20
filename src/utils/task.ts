import type { MediaOption } from "@/components/common/download-media";
import type { DialogProps } from "@radix-ui/react-dialog";


export type TaskDialogProps = DialogProps & {
    setProcessor: React.Dispatch<React.SetStateAction<TaskProcessor>>;
}

export type TaskDialogOptions = {
    name: string;
    children: React.FunctionComponent<TaskDialogProps>;
    processor: typeof TaskProcessor<any>;
};

export function defineTaskDialog(options: TaskDialogOptions): TaskDialogOptions {
    return options;
}

export type TaskSetStateActions = {
    setTotal: React.Dispatch<React.SetStateAction<number>>;
    setCompleted: React.Dispatch<React.SetStateAction<number>>;
}

export interface TaskDownloadOption {
    url: string;
    filename: string;
    size?: number;
}


export function defineTaskProcessor(options: TaskDialogOptions): TaskDialogOptions {
    return options;
}

export abstract class TaskProcessor<P = any, T = any> {

    public mediaOptions: MediaOption[] = [];
    public signal?: AbortSignal;
    public dataCache = new Map<string, T>();
    public actions: TaskSetStateActions = { setTotal: () => { }, setCompleted: () => { } };

    constructor(protected condition: (P & { requestInterval?: number })) {};

    protected next = async <F extends (...args: any) => any>(config: {
        func: F;
        args: Parameters<F>;
        key: string;
    }): Promise<Awaited<ReturnType<F>>> => {
        const { func, args } = config;
        if (this.signal?.aborted) {
            throw new Error('任务终止');
        }
        if (this.dataCache.has(config.key)) {
            return this.dataCache.get(config.key) as any;
        }
        await sleep((this.condition.requestInterval ?? 1) * 1000);
        const result = await func(...args);
        if (result) {
            this.dataCache.set(config.key, result);
        }
        return result;
    }

    /**
     * 执行任务
     */
    abstract execute(): Promise<void>;

    /**
     * 获取数据文件下载选项
     */
    abstract getDataDownloadOption(): TaskDownloadOption;

    /**
     * 获取媒体文件下载选项
     * @param mediaTypes 需要下载的媒体类型
     */
    abstract getMediaDownloadOptions(mediaTypes: string[]): TaskDownloadOption[];
}