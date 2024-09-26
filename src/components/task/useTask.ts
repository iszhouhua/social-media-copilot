import React, { Dispatch, SetStateAction } from "react";
import { TaskStatus } from ".";
import { toast } from "sonner";
import { delay, hash, platform } from "@/utils";
import XLSX from 'xlsx';
import moment from "moment";

type RequestFunc = <F extends (...args: any) => any>(func: F, ...args: Parameters<F>) => Promise<Awaited<ReturnType<F>>>;

export type FileInfo = { filename: string } & (
    | {
        type: 'buffer';
        data: ArrayBuffer;
    }
    | {
        type: 'url';
        data: string;
    }
    | {
        type: 'zip';
        data: Array<FileInfo>;
    });


export abstract class TaskProcessor<P = any, T = any> {

    public data: Record<string, T> = {};

    constructor(
        protected condition: P,
        protected request: RequestFunc,
        protected actions: TaskSetStateActions
    ) {
    };

    /**
     * 执行任务
     * @param task
     */
    abstract execute(): Promise<void>;

    /**
     * 获取导出的数据
     * @param task
     */
    abstract getFileInfos(): Promise<Array<FileInfo>>;
}


type TaskSetStateActions = {
    setTotal: Dispatch<SetStateAction<number>>;
    setCompleted: Dispatch<SetStateAction<number>>;
    setStatus: Dispatch<SetStateAction<TaskStatus>>;
}

export type TaskState<P, T> = TaskSetStateActions & {
    total: number;
    completed: number;
    status: TaskStatus;
    start: (condition: P) => void;
    processor: TaskProcessor<P, T>;
}

const requestCache = new Map<string, any>();

export function useTask<P = any, T = any>(ProcessorClass: { new(condition: P, request: RequestFunc, actions: TaskSetStateActions): TaskProcessor<P, T>; }): TaskState<P, T> {
    const [total, setTotal] = React.useState(0);
    const [completed, setCompleted] = React.useState(0);
    const [status, setStatus] = React.useState<TaskStatus>(TaskStatus.INITIAL);
    const [processor, setProcessor] = React.useState<TaskProcessor<P, T>>({} as any);
    const totalRef = React.useRef(total);
    const completedRef = React.useRef(completed);
    const statusRef = React.useRef(status);

    React.useEffect(() => {
        totalRef.current = total;
    }, [total]);

    React.useEffect(() => {
        completedRef.current = completed;
    }, [completed]);

    React.useEffect(() => {
        statusRef.current = status;
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
            statusRef.current = TaskStatus.INITIAL;
        }
    }, [status]);
    const start = (condition: P) => {
        setProcessor(new ProcessorClass(condition, request, { setTotal, setCompleted, setStatus }));
        setCompleted(0);
        setStatus(TaskStatus.EXECUTING);
    }

    const request: RequestFunc = async (func, ...args) => {
        if (statusRef.current !== TaskStatus.EXECUTING) {
            throw new Error("任务中止");
        }
        const key = await hash(func.toString() + "_" + JSON.stringify(args));
        if (requestCache.has(key)) {
            return requestCache.get(key);
        }
        await delay(500);
        const res = await func(...args);
        requestCache.set(key, res);
        return res;
    }

    return {
        total, setTotal,
        completed, setCompleted,
        status, setStatus,
        processor, start
    };
}

export function getExcelFileInfo(datas: Array<Array<any>>, name: string): FileInfo {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.sheet_new();
    XLSX.utils.book_append_sheet(workbook, worksheet);
    XLSX.utils.sheet_add_aoa(worksheet, datas);
    return {
        data: XLSX.writeXLSX(workbook, { type: "buffer" }),
        type: 'buffer',
        filename: `${platform.getName()}-${name}-${moment().format(moment.HTML5_FMT.DATETIME_LOCAL)}.xlsx`,
    }
}