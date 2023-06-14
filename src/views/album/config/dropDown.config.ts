import { IDropDownConfig } from "@/components/linDropDown";
import appStore from "@/store";
import { useItemClick } from "@/components/navHeader/src/hooks/useItemClick";
export const dropDownConfig: IDropDownConfig = {
    trigger: "click",
    size: "large",
    placement: "auto-start",
    dropDownItemList: [
        {
            icon: "",
            context: "添加到相册",
            type: 2,
        },
        {
            icon: "Picture",
            context: "上传照片",
            type: 1,
            uploaded: true,
            uploadConfig: {
                limit: 5,
                cut: true,
                url: "/files/uploadSingle",
                accept: ".jpg,.png,.gif",
                isAlbum: 1,
                onExceed() {
                    ElMessage({
                        type: "warning",
                        message: `一次只能上传5张照片哦`,
                    });
                },
                onStart(file, suffix, folderId) {
                    if (!appStore.uploadStore.getFile(file.uid))
                        appStore.uploadStore.addFile({ isPause: false, ...file });
                    const uploadFile = appStore.uploadStore.getFile(file.uid);
                    uploadFile.suffix = suffix;
                    uploadFile.uploadFolder = folderId;
                    ElNotification({
                        type: "success",
                        message: `${uploadFile.name} 已开始上传`,
                        position: "bottom-right",
                        duration: 2000,
                    });
                },
                onProgress: (evt, file) => {
                    const curFile = appStore.uploadStore.getFile(file.uid);
                    curFile.status = "uploading";
                    curFile.percentage = Math.round(evt.progress! * 100);
                },
                onSuccess(response, uploadFile, uploadFiles) {
                    ElNotification({
                        type: "success",
                        message: `${uploadFile.name} 已完成传输`,
                        position: "bottom-right",
                        duration: 2000,
                    });
                    setTimeout(() => {
                        appStore.uploadStore.deleteFile(uploadFile.uid);
                        appStore.indexStore.reloadApp();
                    }, 1500);
                },
            },
        },
    ],
};
