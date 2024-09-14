import React, { Dispatch, SetStateAction } from "react";
import { FileInfo, TaskStatus, TaskProcessor } from "./types";
import { toast } from "sonner";
import { hash } from "@/utils";

export type TaskState<P, T> = {
    total: number;
    setTotal: Dispatch<SetStateAction<number>>;
    completed: number;
    setCompleted: Dispatch<SetStateAction<number>>;
    status: TaskStatus;
    setStatus: Dispatch<SetStateAction<TaskStatus>>;
    data: Record<string, T>;
    setData: Dispatch<SetStateAction<Record<string, T>>>;
    start: (condition: P) => void;
    condition: P;
    request: RequestFunc;
    getFileInfos: () => Promise<Array<FileInfo>>;
}

type RequestFunc = <F extends (...args: any) => any>(func: F, ...args: Parameters<F>) => Promise<ReturnType<F>>;

const requestCache = new Map<string, any>();

export function useTask<P = any, T = any>(props: TaskProcessor): TaskState<P, T> {
    const [total, setTotal] = React.useState(0);
    const [completed, setCompleted] = React.useState(0);
    const [status, setStatus] = React.useState<TaskStatus>(TaskStatus.INITIAL);
    const [condition, setCondition] = React.useState<P>({} as any);
    const [data, setData] = React.useState<Record<string, T>>({});
    const statusRef = React.useRef(status);

    React.useEffect(() => {
        statusRef.current = status;
        if (status === TaskStatus.EXECUTING) {
            props.execute(state)
                .then(() => setStatus(TaskStatus.COMPLETED))
                .catch((err) => {
                    toast.error(err?.message || '未知异常');
                    setStatus(TaskStatus.FAILED);
                });
        }
        return () => {
            statusRef.current = TaskStatus.INITIAL;
        }
    }, [status]);

    const start = (condition: P) => {
        setCondition(condition);
        setData({});
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
        const res = await func(...args);
        requestCache.set(key, res);
        return res;
    }

    const state: TaskState<P, T> = {
        total, setTotal,
        completed, setCompleted,
        status, setStatus,
        data, setData,
        start, condition, request,
        getFileInfos: () => props.getFileInfos(state),
    }
    return state;
}