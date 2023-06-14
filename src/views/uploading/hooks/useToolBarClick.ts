import appStore from "@/store";
import { clickCb } from "@/components/toolBar/types";
export function useToolBarClick() {
    const uploadStore = appStore.uploadStore;
    /**
     * @description 传输继续
     */
    const handleVideoPlay: clickCb = (scope) => {
        const file = uploadStore.getFile(scope.row.uid);
        file.isPause = false;
        /**
         * @TODO 启动断点续传
         */
        ElMessage({
            type: "warning",
            message: "真的不会断点续传，谁来教我",
        });
        // const files = [file];
        // uploadStore.uploadFiles(files as unknown as File[], true);
    };
    /**
     * @description 传输暂停
     */
    const handleVideoPause: clickCb = (scope) => {
        const file = uploadStore.getFile(scope.row.uid);
        file.isPause = true;
        ElMessage({
            type: "warning",
            message: "真的不会断点续传，谁来教我",
        });
        /**
         * @TODO 取消传输请求
         */
        // uploadStore.requests[file.uid].forEach((request) => {
        //     request.cancel();
        // });
    };

    return { handleVideoPlay, handleVideoPause };
}
