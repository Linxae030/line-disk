import appStore from "@/store";
import { onUnmounted } from "vue";
import LinRequest from "@/api";
export function useToolBarClick() {
    const uploadStore = appStore.uploadStore;
    // 组件卸载时将未上传完的文件存入数据库
}
