import { LinResponse } from "../requests/types";
import CPromise from "p-cancelable";
/**
 * @description 文件状态
 */
export enum FileStatus {
    uploading = 0,
    fail = 1,
    common = 2,
    recycling = 3,
    oss = 4,
}
/**
 * @description 文件类型
 */
export enum FileType {
    folder = 1,
    other = 2,
}
/**
 * @interface 需上传的文件信息
 */
export interface FileInfo {
    filename: string;
    fileExt: string;
    fileRawName: string;
    // fileMD5: string;
    fileSize: number;
    fileType: FileType;
    fileStatus: FileStatus;
}
/**
 * @interface 跟上传操作有关的后台接口
 */
export interface uploadingApis {
    // 获取已上传的切片
    getAlreadyChunks: (
        suffix: string,
        filename: string,
        folderId?: number,
        headers?: Record<string, any>,
        isAlbum?: number,
        options?: Record<string, any>
    ) => Promise<LinResponse>;
    // 上传切片
    uploadChunks: (
        formData: FormData,
        headers?: Record<string, any>,
        folderId?: number,
        rawName?: string,
        isAlbum?: number,
        options?: Record<string, any>
    ) => CPromise<LinResponse>;
    // 合并文件
    uploadMerge: (
        count: number,
        fileInfo: FileInfo,
        folderId?: number,
        headers?: Record<string, any>,
        isAlbum?: number,
        options?: Record<string, any>
    ) => Promise<LinResponse>;
}
