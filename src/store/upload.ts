import { LinResponse } from "@/api/requests/types";
import { Chunk, UploadFile } from "@/components/linUpload";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import CPromise from "p-cancelable";
interface UploadingFile extends UploadFile {
    isPause: boolean;
}
export const useUploadStore = defineStore(
    "upload",
    () => {
        const fileList = ref<Record<string, UploadingFile>>({});
        const requests = ref<Record<number, CPromise<LinResponse>[]>>({});
        const uploadFiles: (files: File[], continueOption?: any) => void = () => {};

        const arrFileList = computed(() => {
            return Object.values(fileList.value);
        });
        const deleteFile = (uid: number) => {
            delete fileList.value[uid];
            delete requests.value[uid];
        };
        const getFile = (uid: number) => {
            return fileList.value[uid];
        };
        const clearFile = () => {
            fileList.value = {};
        };
        const addFile = (file: UploadingFile) => {
            fileList.value[file.uid] = file;
        };

        return {
            fileList,
            arrFileList,
            requests,
            addFile,
            deleteFile,
            getFile,
            clearFile,
            uploadFiles,
        };
    }
    // {
    //     persist: {
    //         enabled: true,
    //         strategies: [
    //             {
    //                 // 自定义存储的 key，默认是 store.$id
    //                 key: "uploadStore",
    //                 paths: ["chunksStore", "fileList"],
    //             },
    //         ],
    //     },
    // }
);
