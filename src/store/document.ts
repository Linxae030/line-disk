import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { LinFileItem } from "@/api/requests/types";

export const useDocumentStore = defineStore("document", () => {
    /**
     * @description 当前展示的文件列表
     * @TODO (做无限加载)                                                                                                                                  )
     */
    const fileList = ref<LinFileItem[]>([]);
    const displayedFileList = computed(() => {
        return fileList.value.sort((a, b) => {
            // type升序(文件夹在前面)
            if (a.fileType != b.fileType) {
                return a.fileType < b.fileType ? -1 : 1;
            } else if (a.createTime != b.createTime) {
                return a.createTime > b.createTime ? -1 : 1;
            } else {
                return a.fileSize > b.fileSize ? -1 : 1;
            }
        });
    });

    // 预览图片的链接
    const preImgSrcList = ref<string[]>([]);

    /**
     * @description 选中的文件数组
     */
    const selectedFileList = ref<LinFileItem[]>([]);

    /**
     * @description 保存elForm上的clearSelection方法
     */
    const clearSelectedFileList = () => {};

    return {
        fileList,
        displayedFileList,
        selectedFileList,
        preImgSrcList,
        clearSelectedFileList,
    };
});
