import { downloadFile, getFileList } from "@/api";
import appStore from "@/store";
import { blobType } from "@/utils/blobTypeMap";
import { dropDownConfig } from "../config/dropDown.config";
import { onBeforeUnmount, onMounted, ref } from "vue";

export const useData = () => {
    // 取出documentStore
    const albumStore = appStore.albumStore;
    const urlList = ref<string[]>([]);
    // mounted时ref(table实例对象)才有值，才能进行赋值
    onMounted(async () => {
        // 将linTable上的清除选项方法存入store中

        // 获取现有文件列表
        const data = await getFileList(1);
        // 现有文件列表存入store
        albumStore.displayedFileList = (data as any).fileList;
        // 设置大图预览列表
        const imgList = albumStore.displayedFileList
            .filter((item) => ["jpg", "png", "gif"].includes(item.fileExt))
            .map(async (item) => {
                const file = albumStore.displayedFileList.find(
                    (file) => file.fileId === item.fileId
                );
                const res = await downloadFile(item.fileId, {
                    responseType: "blob",
                });
                const blob = new Blob([res as any], {
                    type: (blobType as any)[file?.fileExt!],
                });
                const url = URL.createObjectURL(blob);
                file!.fileUrl = url;
                return {
                    fileId: item.fileId,
                    url,
                };
            });
        async function getImgListValues() {
            const values = await Promise.all(imgList);
            return values;
        }
        albumStore.preImgList = await getImgListValues();

        appStore.navHeaderStore.dropDownConfig = dropDownConfig;
    });
    onBeforeUnmount(() => {
        albumStore.displayedFileList = [];
        albumStore.selectedFileList = [];
        albumStore.isSelectedAll = false;
    });
    return { urlList, albumStore };
};
