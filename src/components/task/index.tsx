import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Button } from "@/components/ui/button.tsx";
import { throttle } from "lodash";
import { browser } from "wxt/browser";
import JSZip from "jszip";
import { FileInfo, TaskState } from "./useTask";
export * from './useTask';


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

export function TaskDialog(props: TaskState<any, any> & {
    children: React.ReactNode;
    onClose?: () => void;
}) {
    const { total, completed, status, setStatus, processor, onClose, children } = props;

    const handleDownload = async () => {
        const files: Array<FileInfo> = await processor.getFileInfos();
        for (const file of files) {
            let url: string;
            if (file.type === "buffer") {
                const blob = new Blob([file.data], { type: "application/octet-stream" });
                url = URL.createObjectURL(blob);
            } else if (file.type === "zip") {
                const blob = await getZipBlob(file.data);
                url = URL.createObjectURL(blob);
            } else {
                url = file.data;
            }
            await browser.runtime.sendMessage<"download">({ name: "download", body: { url, filename: file.filename } });
            URL.revokeObjectURL(url);
        }
    };

    const getZipBlob = (files: Array<FileInfo>): Promise<Blob> => {
        const zip = new JSZip();
        for (const file of files) {
            let fileData: Blob | Promise<Blob>;
            if (file.type === "zip") {
                fileData = getZipBlob(file.data);
            } else if (file.type === "buffer") {
                fileData = new Blob([file.data], { type: "application/octet-stream" });
            } else {
                const url = new URL(file.data);
                url.protocol = location.protocol
                fileData = fetch(url).then((res) => res.blob());
            }
            zip.file(file.filename, fileData, { binary: true });
        }
        return zip.generateAsync({ type: "blob" });
    };

    const percentage = Math.floor((completed ?? 0) / (total || 100) * 100);

    return (<Dialog open={true} onOpenChange={() => {
        setStatus(TaskStatus.INITIAL);
        if (onClose) {
            onClose();
        } else {
            window.dispatchEvent(new CustomEvent("open-dialog", { detail: '' }))
        }
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
}