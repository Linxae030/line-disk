import appStore from "@/store";
import LinTable from "@/components/linTable";
import { onMounted, onBeforeUnmount, ref } from "vue";
import { downloadFile, getRecycleFileList } from "@/api";
import { LinFileItem } from "@/api/requests/types";
import { blobType } from "@/utils/blobTypeMap";

export function useTableData() {
    // 取到table实例对象,
    const linTableRef = ref<InstanceType<typeof LinTable>>();
    // 取出documentStore
    const subDocumentStore = appStore.subDocumentStore;
    // table数据来源
    let tableData = ref<LinFileItem[]>([]);

    /**
     * @description 选择数组改变后储存到store中
     * @param files 被选择的文件
     */
    const handleSelectionChange = (files: LinFileItem[]) => {
        subDocumentStore.selectedRecycleList = files;
    };

    // mounted时ref(table实例对象)才有值，才能进行赋值
    onMounted(async () => {
        // 将linTable上的清除选项方法存入store中
        subDocumentStore.clearSelectedFileList = linTableRef.value?.clearSelection as any;
        // 获取现有文件列表
        const data = await getRecycleFileList();
        // 现有文件列表存入store
        subDocumentStore.fileList = (data as any).fileList;

        // 设置大图预览列表
        const imgList = subDocumentStore.fileList
            .filter((item) => ["jpg", "png", "gif"].includes(item.fileExt))
            .map(async (item) => {
                const file = subDocumentStore.recycleFileList.find(
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
                return url;
            });
        async function getImgListValues() {
            const values = await Promise.all(imgList);
            return values;
        }
        subDocumentStore.preImgSrcList = await getImgListValues();
    });

    onBeforeUnmount(() => {
        // 重置已选项
        subDocumentStore.selectedRecycleList = [];
    });

    return { subDocumentStore, linTableRef, handleSelectionChange };
}
