import { AxiosProgressEvent } from "axios";
import { UploadEvent } from "../src/linUpload";
export type UploadStatus = "ready" | "uploading" | "success" | "fail";
export type UploadFiles = UploadFile[];
/**
 * @interface 源文件接口，继承自File，新增uid作为唯一标识
 */
export interface UploadRawFile extends File {
    uid: number;
    filename: string;
}

/**
 * @interface chunk
 */
export interface Chunk {
    file: Blob;
    filename: string;
    suffix: string;
}

/**
 * @interface 自定义上传文件类型接口
 */
export interface UploadFile {
    name: string;
    filename?: string;
    chunks?: Chunk[];
    percentage?: number;
    status: UploadStatus;
    size?: number;
    response?: unknown;
    uid: number;
    url?: string;
    HASH?: string;
    suffix?: string;
    uploadFolder?: number;
    completeCount: number;
    uploadCount: number;
    raw?: UploadRawFile;
}
/**
 * @interface 传入uploadContent的回调函数类型接口
 */
export interface UploadCallBacks {
    onExceed: (files: File[]) => void;
    onBeforeHash: (uploadFile: UploadRawFile) => void;
    onStart: (uploadFile: UploadRawFile, suffix: string, folderId: number) => void;
    onProgress?: (evt: UploadEvent, uploadFile: UploadRawFile) => void;
    onCancel: (alreadyCounts: number, uploadFile: UploadRawFile) => void;
    onSuccess: (response: any, uploadFile: UploadRawFile) => void;
    onError: (error: Error, uploadFile: UploadRawFile) => void;
}
