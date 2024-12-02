import moment from "moment";
import XLSX from 'xlsx';

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


export type TaskFileInfo = { filename: string, path?: string } & (
    | {
        type: 'blob';
        data: Blob;
    }
    | {
        type: 'url';
        data: string;
    }
    | {
        type: 'zip';
        data: Array<TaskFileInfo>;
    });

export abstract class TaskProcessor<P = any, T = any> {

    constructor(
        protected condition: P,
        protected actions: TaskSetStateActions,
    ) { };

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
     */
    abstract execute(signal: AbortSignal):Promise<void>;

    /**
     * 获取导出的数据
     * @param task
     */
    abstract getFileInfos(): Promise<Array<TaskFileInfo>>;
}