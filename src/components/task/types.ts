import { TaskState } from "./useTask";

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

export interface TaskProcessor<P = any, T = any> {
    /**
     * 执行任务
     * @param task
     */
    execute(task: TaskState<P, T>): Promise<void>;

    /**
     * 获取导出的数据
     * @param task
     */
    getFileInfos(task: TaskState<P, T>): Promise<Array<FileInfo>>;
}