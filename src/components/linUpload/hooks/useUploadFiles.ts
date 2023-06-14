import LinRequest from "@/api/index";
import { UploadRawFile } from "../types";
import { UploadContentProps } from "../src/linUploadContent";
import SparkMD5 from "spark-md5";
import { AxiosRequestConfig } from "axios";
import { ref, shallowRef } from "vue";
import appStore from "@/store";
import { UploadFile } from "../types/index";
import { throttle, wait } from "@/utils";
import { getAlreadyChunks, uploadChunks, uploadMerge, FileInfo, FileType, FileStatus } from "@/api";

/**
 * @TODO 添加异常处理
 * @FIX 耦合度有点高，之后再说吧
 */

const uploadStore = appStore.uploadStore;

const requests = shallowRef<Record<string, XMLHttpRequest | Promise<unknown>>>({});

// 默认单片大小 1MB
let maxSize = 1 * 1024 * 1024;
// 默认切片份数 100份
let maxCount = 100;

export function useFileUpload(props: UploadContentProps) {
    let { url, method, headers, isAlbum, onSuccess, onError, onProgress } = props;

    // 节流包裹onProgress函数
    const _onProgress = throttle(500, onProgress!, { leading: true, trailing: true });

    /**
     * @description 直接上传文件不进行切片
     * @param rawFile 原始文件
     * @returns void
     */
    async function uploadSingle(rawFile: UploadRawFile) {
        const { uid } = rawFile;
        // 构造formData数据
        const formData = new FormData();
        formData.append("file", rawFile);
        formData.append("filename", rawFile.name);

        // 请求配置
        const option: AxiosRequestConfig = {
            url,
            method,
            headers: headers,
            data: formData,
            onUploadProgress: (evt) => {
                onProgress!({ progress: evt.progress! }, rawFile);
            },
        };

        const onRejected = (err: any) => {
            onError!(err, rawFile);
            delete requests.value[uid];
        };

        const onFulfilled = (value: any) => {
            onSuccess!(value, rawFile);
            delete requests.value[uid];
        };

        try {
            // 获取请求的promise对象，根据文件uid存入requests对象，以备后用
            const request = LinRequest.request(option);
            requests.value[uid] = request;
            if (request instanceof Promise) {
                return request.then(onFulfilled, onRejected);
            }
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * @description 获取文件后缀
     * @param rawFile 原始文件
     * @returns
     */
    function getFileSuffix(rawFile: UploadRawFile) {
        const suffix = rawFile.name.substring(rawFile.name.lastIndexOf(".") + 1);
        const filename = rawFile.name.substring(0, rawFile.name.lastIndexOf("."));
        return [suffix, filename];
    }

    /**
     * @description 获取已上传切片
     * @param HASH 文件HASH
     * @param suffix 文件后缀
     * @returns
     */
    async function getAlready(suffix: string, filename: string, folderId: number, isAlbum: number) {
        const data = await getAlreadyChunks(suffix, filename, folderId, headers, isAlbum);
        return {
            ...(data as any),
        };
    }

    /**
     * @description 切割文件
     * @param HASH 文件HASH
     * @param suffix 文件后缀
     * @param rawFile 原始文件
     * @returns 切片后的chunks数组
     */
    function sliceFile(suffix: string, rawFile: UploadRawFile) {
        // 获取上传文件对象
        const uploadFile = uploadStore.getFile(rawFile.uid);
        // 计算待上传的份数
        uploadFile.uploadCount = Math.ceil(rawFile.size / maxSize);

        let index = 0;
        let chunks = [];
        // 若待上传份数大于
        if (uploadFile.uploadCount > maxCount) {
            maxSize = rawFile.size / maxCount;
            uploadFile.uploadCount = maxCount;
        }
        // 避免文件大小为0不切割文件，最小传一块
        if (uploadFile.uploadCount === 0) uploadFile.uploadCount = 1;
        // 构造chunk并推入chunks数组
        while (index < uploadFile.uploadCount) {
            chunks.push({
                file: rawFile.slice(index * maxSize, (index + 1) * maxSize),
                filename: `${rawFile.filename}_${index + 1}`,
                suffix,
            });
            index++;
        }
        return chunks;
    }
    async function complete(uploadFile: UploadFile, file: UploadRawFile, folderId?: number) {
        // 每完成一个请求，已完成数（completeCount）++
        if (uploadFile.completeCount < uploadFile.uploadCount) uploadFile.completeCount++;
        // 调用onProgress回调进度管控
        _onProgress!({ progress: uploadFile.completeCount / uploadFile.uploadCount }, uploadFile);
        // 未上传完则返回不调用merge
        if (uploadFile.completeCount < uploadFile.uploadCount) return;
        // 上传完则取消上一个onProgress回调的调用
        _onProgress.cancel();
        // 直接更新进度为100
        _onProgress!({ progress: 1 }, uploadFile);
        // 待上传文件信息
        const fileInfo: FileInfo = {
            filename: uploadFile.raw!.filename!,
            fileRawName: uploadFile.name,
            fileExt: uploadFile.suffix!,
            fileSize: uploadFile.size!,
            fileType: FileType["other"],
            fileStatus: FileStatus["common"],
        };
        // 获取文件合并结果
        const data = await uploadMerge(
            uploadFile.completeCount,
            fileInfo,
            folderId!,
            headers,
            isAlbum
        );
        if (data.code === 0) onSuccess!(data.message, file);
        else onError!(new Error(data.message), file);
    }
    async function uploadChunk(
        isComplete: boolean,
        chunks: any[],
        already: any = [],
        rawFile: UploadRawFile,
        folderId?: number
    ) {
        // 若已存在则秒传
        if (isComplete) {
            _onProgress!({ progress: 1 }, rawFile);
            onSuccess!("", rawFile);
        }

        // 把每一个切片都上传到服务器上
        const uploadFile = uploadStore.getFile(rawFile.uid);
        if (already.length) {
            uploadFile.completeCount = already.length;
            _onProgress!(
                { progress: uploadFile.completeCount / uploadFile.uploadCount },
                uploadFile
            );
        }
        if (already.length === uploadFile.uploadCount) {
            // 直接合并
            const fileInfo: FileInfo = {
                filename: uploadFile.raw!.filename!,
                fileRawName: uploadFile.name,
                fileExt: uploadFile.suffix!,
                fileSize: uploadFile.size!,
                fileType: FileType["other"],
                fileStatus: FileStatus["common"],
            };
            // 获取文件合并结果
            const data = await uploadMerge(
                uploadFile.completeCount,
                fileInfo,
                folderId!,
                headers,
                isAlbum
            );
            if (data.code === 0) onSuccess!(data.message, rawFile);
            else onError!(new Error(data.message), rawFile);
        }

        uploadStore.requests[uploadFile.uid] = [];
        const requests = uploadStore.requests;
        // 截取不需要的chunk
        const tempChunks = chunks.slice(already.length);

        let max = 10;
        let count = 0;
        while (tempChunks.length) {
            const chunk = tempChunks.shift();
            count++;
            while (count >= max) {
                await wait(50);
            }
            // 构造formData数据
            let formData = new FormData();
            formData.append("file", chunk.file);
            formData.append("filename", chunk.filename);
            formData.append("suffix", chunk.suffix);
            try {
                // 跟去chunk的filename将上传chunk的请求装入requests对象
                const request = uploadChunks(
                    formData,
                    headers,
                    folderId,
                    rawFile.filename,
                    isAlbum
                );
                requests[rawFile.uid].push(request);
                // 将chunk上传成功的回调设置为complete,失败的回调设置为onError
                if (request instanceof Promise) {
                    request.then(
                        () => {
                            delete requests[chunk.filename];
                            count--;
                            complete(uploadFile, rawFile, folderId);
                        },
                        (err) => {
                            delete requests[chunk.filename];
                            count--;
                            onError!(err, rawFile);
                        }
                    );
                }
                // 全部上传成功后的回调
            } catch (err) {
                onError!(err as any, rawFile);
                return Promise.reject(err);
            }
        }
        return Promise.all(Object.values(requests)).then((res) => {
            appStore.indexStore.reloadApp();
        });
    }
    return { uploadSingle, getFileSuffix, getAlready, sliceFile, uploadChunk };
}
