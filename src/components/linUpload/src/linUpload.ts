import { InferDefaults } from "@/utils";
import { Chunk, UploadCallBacks, UploadFile, UploadFiles } from "../types";
import { NOOP } from "@/global";
import { UploadRawFile } from "../types/index";
// 文件id
let fileId = 1;
// 生成文件id
export const getFileId = () => Date.now() + fileId++;

export interface UploadEvent {
    progress: number;
}
/**
 * @interface 基础props
 */
export interface UploadBaseProps {
    url?: string;
    method?: string;
    multiple?: boolean;
    webkitdirectory?: boolean;
    accept?: string;
    isAlbum?: number;
    limit?: number;
    cut?: boolean;
    headers?: Record<string, any>;
}
/**
 * @description 基础props的默认值
 */
export const UploadBasePropsDefault: InferDefaults<UploadBaseProps> = {
    url: "#",
    method: "post",
    multiple: true,
    webkitdirectory: false,
    accept: "",
    isAlbum: 0,
    limit: 3,
    cut: false,
    headers: () => ({ "Content-Type": "application/x-www-form-urlencoded" }),
};

/**
 * @interface 传入upload组件的props类型接口
 */
export interface UploadProps extends UploadBaseProps {
    onExceed?: UploadCallBacks["onExceed"];
    onStart?: (file: UploadFile, suffix: string, folderId: number) => void;
    onProgress?: (evt: UploadEvent, uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
    onCancel?: (alreadyCount: number, uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
    onSuccess?: (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => unknown;
    onError?: (err: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
}

/**
 * @description 传入upload组件的props的默认值
 */
export const UploadPropsDefault: InferDefaults<UploadProps> = {
    ...UploadBasePropsDefault,
    onStart: () => NOOP,
    onExceed: () => NOOP,
    onProgress: () => NOOP,
    onCancel: () => NOOP,
    onSuccess: () => NOOP,
    onError: () => NOOP,
};
