import { fileIntoRecycle, downloadFile } from "@/api";
import appStore from "@/store";
import { blobType } from "@/utils/blobTypeMap";

const indexStore = appStore.indexStore;
export function useToolBarClick() {
    const documentStore = appStore.documentStore;
    const indexStore = appStore.indexStore;
    /**
     * @description 清除多选
     */
    const handleCancelSelect = () => {
        documentStore.clearSelectedFileList();
    };

    const handleIntoRecycle = async () => {
        ElMessageBox.confirm("删除的文件可在10天内找回", "删除文件", {
            confirmButtonText: "删除文件",
            confirmButtonClass: "BtnDelete",
            cancelButtonText: "取消",
            type: "warning",
        }).then(async () => {
            const idList: number[] = [];
            documentStore.selectedFileList.forEach((item) => {
                idList.push(item.fileId);
            });
            const res = await fileIntoRecycle(idList);
            if (res.code === 0) {
                documentStore.clearSelectedFileList();
                ElMessage({
                    type: "success",
                    message: res.message,
                });
            } else {
                documentStore.clearSelectedFileList();
                ElMessage({
                    type: "error",
                    message: res.message,
                });
            }
            setTimeout(() => {
                indexStore.reloadApp();
            }, 300);
        });
    };

    const handleDownload = async () => {
        const selectList = documentStore.selectedFileList;
        const idList: number[] = [];
        for (const file of documentStore.selectedFileList) {
            console.log(file.fileType);

            if (file.fileType === 1) {
                return ElMessage({
                    type: "warning",
                    message: `暂不支持下载文件夹，请取消文件夹后下载所需文件`,
                });
            }
            idList.push(file.fileId);
        }
        ElMessageBox.confirm(`您将要下载 ${selectList.length} 个文件`, "下载文件", {
            confirmButtonText: "确认下载",
            cancelButtonText: "取消",
            type: "success",
        }).then(async () => {
            // 依次请求
            for (const id of idList) {
                const file = documentStore.displayedFileList.find((item) => item.fileId === id);
                const res = await downloadFile(id, {
                    responseType: "blob",
                });
                const blob = new Blob([res as any], {
                    type: (blobType as any)[file?.fileExt!],
                });
                // console.log(res);

                // 构造a标签模拟点击
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = file?.fileName!;
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                ElMessage({
                    type: "success",
                    message: `${file?.fileName}.${file?.fileExt} 开始下载`,
                });
                setTimeout(() => {
                    indexStore.reloadApp();
                }, 300);
            }
        });
    };
    // const handleShare = async () => {
    // 	const selectList = documentStore.selectedFileList;
    // 	const idList: number[] = [];
    // 	for (const file of documentStore.selectedFileList) {
    // 		console.log(file.fileType);

    // 		if (file.fileType === 1) {
    // 			return ElMessage({
    // 				type: "warning",
    // 				message: `暂不支持下载文件夹，请取消文件夹后下载所需文件`,
    // 			});
    // 		}
    // 		idList.push(file.fileId);
    // 	}
    // 	ElMessageBox.confirm(`您将要分享 ${selectList.length} 个文件`, "下载文件", {
    // 		confirmButtonText: "确认下载",
    // 		cancelButtonText: "取消",
    // 		type: "success",
    // 	}).then(async () => {
    // 		// 依次请求
    // 		for (const id of idList) {
    // 			const file = documentStore.displayedFileList.find((item) => item.fileId === id);
    // 			const res = await downloadFile(id, {
    // 				responseType: "blob",
    // 			});
    // 			const blob = new Blob([res as any], {
    // 				type: (blobType as any)[file?.fileExt!],
    // 			});
    // 			// 构造a标签模拟点击
    // 			const url = URL.createObjectURL(blob);
    // 			const link = document.createElement("a");
    // 			link.href = url;
    // 			link.download = file?.fileName!;
    // 			link.style.display = "none";
    // 			document.body.appendChild(link);
    // 			link.click();
    // 			document.body.removeChild(link);
    // 			URL.revokeObjectURL(url);
    // 			ElMessage({
    // 				type: "success",
    // 				message: `${file?.fileName}.${file?.fileExt} 开始下载`,
    // 			});
    // 			setTimeout(() => {
    // 				indexStore.reloadApp();
    // 			}, 300);
    // 		}
    // 	});
    // };
    return { handleCancelSelect, handleIntoRecycle, handleDownload };
}
