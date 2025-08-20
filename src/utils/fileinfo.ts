import moment from "moment";
import XLSX from 'xlsx';

export function getSafeFilename(name: string): string {
    const regexp: RegExp = /[^\w\.\-\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0370-\u03ff\u0600-\u06ff\u00c0-\u00ff]/g;
    return name.replace(regexp, "").substring(0, 20);
}

export function getFilePath(filename: string): string {
    if (filename.endsWith('/') || !filename.includes('/')) return filename;
    return filename.substring(0, filename.lastIndexOf('/') + 1);
}


export function generateExcelDownloadOption(datas: Array<Array<any>>, name: string): TaskDownloadOption {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.sheet_new();
    XLSX.utils.book_append_sheet(workbook, worksheet);
    XLSX.utils.sheet_add_aoa(worksheet, datas);
    const buffer = XLSX.write(workbook, { type: "buffer" });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return {
        filename: `【社媒助手】${getSafeFilename(name)}-${moment().format("YYYYMMDD-HHmmss")}.xlsx`,
        url: URL.createObjectURL(blob)
    }
}