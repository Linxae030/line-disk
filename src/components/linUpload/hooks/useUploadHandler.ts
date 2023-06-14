import { useVModel } from "@vueuse/core";
import { Chunk, UploadFile, UploadFiles, UploadRawFile } from "../types";
import { UploadContentProps, UploadContentInstance } from "../src/linUploadContent";
import { getFileId, UploadProps } from "../src/linUpload";
import { ShallowRef, ref } from "vue";
import { useRoute } from "vue-router";
import appStore from "@/store";
export function useUploadHandler(
    props: UploadProps,
    uploadRef: ShallowRef<UploadContentInstance | undefined>
) {
    /**
     * @todo 完善uploadFiles为双向绑定
     */

    // const uploadFiles = useVModel(
    // 	props as Omit<UploadProps, "fileList"> & { fileList: UploadFiles },
    // 	"fileList",
    // 	undefined,
    // 	{ passive: true }
    // );

    const uploadFiles = ref<UploadFiles>([]);
    const uploadStore = appStore.uploadStore;
    const getFile = (rawFile: UploadRawFile) =>
        uploadFiles.value.find((file) => file.uid === rawFile.uid);

    /**
     * @description 文件验证完毕可以上传后传入该函数初始化，并加入uploadFiles
     * @param file 传入的源文件
     */
    const handleStart: UploadContentProps["onStart"] = (
        rawFile,
        suffix: string,
        folderId: number
    ) => {
        const uploadFile: UploadFile = {
            name: rawFile.filename + `.${suffix}`,
            filename: rawFile.filename,
            percentage: 0,
            status: "ready",
            suffix: suffix,
            size: rawFile.size,
            raw: rawFile,
            uid: rawFile.uid,
            completeCount: 0,
            uploadCount: 0,
        };
        uploadFiles.value.push(uploadFile);
        props.onStart!(uploadFile, suffix, folderId);
    };

    /**
     * @description 文件上传过程中的回调函数，会回调自定义传入的onProgress函数
     * @param evt axios上传过程中事件类型
     * @param rawFile 源文件
     * @returns
     */
    const handleProgress: UploadContentProps["onProgress"] = (evt, rawFile) => {
        const file = uploadStore.getFile(rawFile.uid);
        if (!file) return;
        props.onProgress!(evt, file, uploadFiles.value);
    };

    /**
     * @description 文件取消上传的回调函数，会回调自定义传入的onCancel函数
     * @param evt axios上传过程中事件类型
     * @param rawFile 源文件
     * @returns
     */
    const handleCancel: UploadContentProps["onCancel"] = (alreadyCount, rawFile) => {
        const file = uploadStore.getFile(rawFile.uid);
        if (!file) return;
        props.onCancel!(alreadyCount, file, uploadFiles.value);
    };

    /**
     * @description 文件上传成功后的回调函数，会回调自定义传入的onSuccess函数
     * @param response axios成功后的response
     * @param rawFile 源文件
     * @returns
     */
    const handleSuccess: UploadContentProps["onSuccess"] = (response, rawFile) => {
        const file = uploadStore.getFile(rawFile.uid);
        if (!file) return;
        props.onSuccess!(response, file, uploadFiles.value);
        // props.onChange(file, uploadFiles.value);
    };

    /**
     * @description 文件上传失败后的回调函数，会回调自定义传入的onError函数
     * @param err axios失败后的error
     * @param rawFile 源文件
     * @returns
     */
    const handleError: UploadContentProps["onError"] = (err, rawFile) => {
        const file = uploadStore.getFile(rawFile.uid);
        if (!file) return;
        console.error(err);
        file.status = "fail";
        uploadFiles.value.splice(uploadFiles.value.indexOf(file), 1);
        props.onError!(err, file, uploadFiles.value);
        // props.onChange(file, uploadFiles.value);
    };
    return {
        handleStart,
        handleProgress,
        handleCancel,
        handleSuccess,
        handleError,
        uploadFiles,
    };
}
