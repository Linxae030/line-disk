import { downloadFile, getFileList } from "@/api";
import appStore from "@/store";
import { blobType } from "@/utils/blobTypeMap";
import { onMounted, ref } from "vue";

export const useHandle = () => {
    // 取出documentStore
    const albumStore = appStore.albumStore;

    const handleCheck = (imgObj: any) => {
        const target = albumStore.displayedFileList.find((item) => item.fileId == imgObj.fileId)!;
        // 防止重复添加
        if (!albumStore.selectedFileList.find((item) => item.fileId == target.fileId))
            albumStore.selectedFileList.push(target);
        else {
            const idx = albumStore.selectedFileList.findIndex(
                (item) => item.fileId == target.fileId
            );
            albumStore.selectedFileList.splice(idx, 1);
        }
        console.log(imgObj);
    };

    const handleCheckAll = () => {
        if (!albumStore.isSelectedAll) {
            albumStore.isSelectedAll = true;
            albumStore.preImgList.forEach((imgObj) => {
                const target = albumStore.displayedFileList.find(
                    (item) => imgObj.fileId == item.fileId
                );
                albumStore.selectedFileList.push(target!);
            });
        } else {
            albumStore.isSelectedAll = false;
            albumStore.selectedFileList = [];
        }
    };

    return { handleCheck, handleCheckAll };
};
