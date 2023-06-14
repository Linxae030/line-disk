import { createFolder, isExistFolder } from "@/api";
import { h } from "vue";
import appStore from "@/store";
const indexStore = appStore.indexStore;
const chooseFileHandle = async (folderName: string) => {
    return new Promise(async (resolve, reject) => {
        ElMessageBox.prompt(
            h(
                "div",
                {
                    style: {
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignItems: "center",
                    },
                },
                [
                    h(
                        "p",
                        {
                            style: {
                                paddingTop: "10px",
                                paddingBottom: "20px",
                                alignSelf: "flex-start",
                                fontSize: "14px",
                            },
                        },
                        `文件夹 ${folderName} 已存在，是否要继续 `
                    ),
                ]
            ),
            "检测到同名文件夹",
            {
                showConfirmButton: true,
                cancelButtonText: "取消",
                showCancelButton: true,
                confirmButtonText: "保留",
                showInput: false,
                customStyle: {
                    borderRadius: "10px",
                },
                closeOnClickModal: false,
            }
        )
            .then(() => {
                resolve("save");
            })
            .catch(() => {
                resolve("cancel");
            });
    });
};
export function useItemClick() {
    const handleCreateNewFolder = () => {
        ElMessageBox.prompt(
            h(
                "div",
                {
                    style: {
                        display: "flex",
                        flexDirection: "colum",
                        justifyContent: "center",
                        alignItems: "center",
                    },
                },
                [
                    h("img", {
                        src: "/src/assets/img/fileIcons/folder.png",
                        style: {
                            width: "150px",
                            padding: "20px",
                        },
                    }),
                ]
            ),
            "新建文件夹",
            {
                confirmButtonText: "确定",
                inputValue: "新建文件夹",
                customStyle: {
                    width: "340px",
                    borderRadius: "15px",
                },
                confirmButtonClass: "confirmButton",
                showCancelButton: false,
            }
        )
            .then(async ({ value }) => {
                const navHeaderStore = appStore.navHeaderStore;
                const { isExist, count } = (await isExistFolder(
                    value,
                    navHeaderStore.folderId
                )) as any;
                if (isExist) {
                    const handle = await chooseFileHandle(value);
                    if (handle === "save") {
                        if (count === 1) value += " - 副本";
                        else value += ` - 副本 (${count})`;
                    } else {
                        // 不保存则取消创建
                        return;
                    }
                }
                const data = await createFolder(value, navHeaderStore.folderId);
                ElMessage({
                    type: "success",
                    message: "新建文件夹成功",
                });
                setTimeout(() => {
                    indexStore.reloadApp();
                }, 300);
            })
            .catch(() => {
                ElMessage({
                    type: "info",
                    message: "创建取消",
                });
            });
    };
    return { handleCreateNewFolder };
}
