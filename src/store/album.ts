import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { LinFileItem } from "@/api/requests/types";

export const useAlbumStore = defineStore("album", () => {
    /**
     * @description 当前展示的文件列表
     * @TODO (做无限加载)                                                                                                                                  )
     */
    const displayedFileList = ref<LinFileItem[]>([]);

    const isSelectedAll = ref(false);
    // 预览图片的链接
    const preImgList = ref<any[]>([]);

    /**
     * @description 选中的文件数组
     */
    const selectedFileList = ref<LinFileItem[]>([]);

    /**
     * @description 保存elForm上的clearSelection方法
     */
    const clearSelectedFileList = () => {
        selectedFileList.value = [];
    };

    return {
        displayedFileList,
        selectedFileList,
        preImgList,
        isSelectedAll,
        clearSelectedFileList,
    };
});
