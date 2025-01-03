import XLSX from 'xlsx';
import moment from "moment";

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

export type TaskSetStateActions = {
    setTotal: React.Dispatch<React.SetStateAction<number>>;
    setCompleted: React.Dispatch<React.SetStateAction<number>>;
    setStatus: React.Dispatch<React.SetStateAction<TaskStatus>>;
}

export type TaskFileInfo = { filename: string } & (
    | {
        type: 'blob';
        data: Blob;
    }
    | {
        type: 'url';
        data: string;
    });

const requestCache = new Map<string, any>();
export abstract class TaskProcessor<P = any, T = any> {

    public data: Record<string, T> = {};

    public status: TaskStatus = TaskStatus.INITIAL;

    constructor(
        protected condition: P,
        protected actions: TaskSetStateActions
    ) { };

    protected request = async <F extends (...args: any) => any>(func: F, ...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> => {
        if (this.status !== TaskStatus.EXECUTING) {
            throw new Error("任务中止");
        }
        const key = await hash(func.toString() + "_" + JSON.stringify(args));
        if (requestCache.has(key)) {
            return requestCache.get(key);
        }
        await delay(1000);
        const res = await func(...args);
        if (!res) {
            throw new Error("接口返回内容为空，可能已触发平台风控");
        }
        requestCache.set(key, res);
        return res;
    }

    protected getExcelFileInfo(datas: Array<Array<any>>, name: string): TaskFileInfo {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.sheet_new();
        XLSX.utils.book_append_sheet(workbook, worksheet);
        XLSX.utils.sheet_add_aoa(worksheet, datas);
        const buffer = XLSX.write(workbook, { type: "buffer" });
        return {
            data: new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
            type: 'blob',
            filename: `${name}-${moment().format("YYYYMMDD-HHmmss")}.xlsx`,
        }
    }

    /**
     * 执行任务
     * @param task
     */
    abstract execute(): Promise<void>;

    /**
     * 获取导出的数据
     * @param task
     */
    abstract getFileInfos(): Promise<Array<TaskFileInfo>>;
}