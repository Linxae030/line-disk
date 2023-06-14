<template>
    <div class="linUploadContent" @click="handleClick">
        <slot></slot>
        <input
            ref="inputRef"
            class="inputEl"
            :multiple="multiple"
            :webkitdirectory="webkitdirectory"
            type="file"
            :accept="accept"
            @change="handleChange"
            @click.stop
        />
    </div>
</template>

<script setup lang="ts">
import { h, ref } from "vue";
import { UploadCallBacks, UploadFile, UploadRawFile } from "../types/index";
import { getFileId } from "./linUpload";
import { useFileUpload } from "../hooks/useUploadFiles";
import { UploadContentPropsDefault } from "./linUploadContent";
import { convertArrayToObject, FolderFile } from "@/utils/convertArrayToObject";
import { createFolder } from "@/api";
import appStore from "@/store";

const props = withDefaults(
    defineProps<{
        url?: string;
        method?: string;
        multiple?: boolean;
        webkitdirectory?: boolean;
        accept?: string;
        limit?: number;
        isAlbum?: number;
        cut?: boolean;
        headers?: Record<string, any>;
        onExceed?: UploadCallBacks["onExceed"];
        onBeforeHash?: UploadCallBacks["onBeforeHash"];
        onStart?: UploadCallBacks["onStart"];
        onProgress?: UploadCallBacks["onProgress"];
        onSuccess?: UploadCallBacks["onSuccess"];
        onError?: UploadCallBacks["onError"];
    }>(),
    {
        ...UploadContentPropsDefault,
    }
);

const inputRef = ref<HTMLInputElement>();

const { uploadSingle, getFileSuffix, getAlready, sliceFile, uploadChunk } = useFileUpload(props);

const indexStore = appStore.indexStore;

const handleClick = () => {
    // 重置选择内容并调用点击
    inputRef.value!.value = "";
    inputRef.value!.click();
};

const chooseFileHandle = async (rawFile: UploadRawFile) => {
    return new Promise(async (resolve, reject) => {
        const navHeaderStore = appStore.navHeaderStore;
        // 获取当前所在的文件夹id,若本身传入则直接使用
        const curFolderId = navHeaderStore.folderId;
        // 获取后缀
        const [suffix, filename] = getFileSuffix(rawFile);
        // 获取已经上传成功的chunks
        const { isComplete, count } = await getAlready(
            suffix,
            rawFile.filename,
            curFolderId,
            props.isAlbum!
        );

        if (isComplete) {
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
                            `文件名 ${rawFile.name} 已存在，是否要继续 `
                        ),
                    ]
                ),
                "检测到同名文件",
                {
                    showConfirmButton: true,
                    cancelButtonText: "覆盖",
                    showCancelButton: true,
                    confirmButtonText: "保留",
                    showInput: false,
                    customStyle: {
                        borderRadius: "10px",
                    },
                    closeOnClickModal: false,
                    distinguishCancelAndClose: true,
                    beforeClose(action, instance, done) {
                        resolve({
                            handler: action,
                            count,
                        });
                        done();
                    },
                }
            );
        }
    });
};

const handleChange = (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    // narrow
    if (!files) return;
    // 调用文件上传文件夹函数
    if (props.webkitdirectory) {
        return uploadFolder(convertArrayToObject(files));
    }
    // 调用文件上传函数
    uploadFiles(Array.from(files));
};

const uploadFolder = async (fileArr: FolderFile[]) => {
    const { cut, limit, onExceed, onStart } = props;

    const navHeaderStore = appStore.navHeaderStore;
    // 获取当前所在的文件夹id,若本身传入则直接使用
    const curFolderId = navHeaderStore.folderId;

    function getLen(fileArr: FolderFile[]) {
        let total = 0;
        fileArr.forEach((item) => {
            if (/(.+).(.+)/.test(item.name)) total++;
            if (item.children.length != 0) {
                total += getLen(item.children);
            }
        });
        return total;
    }
    const filesLength = getLen(fileArr);
    if (limit && filesLength > limit) {
        onExceed!(fileArr);
        return;
    }
    ElNotification({
        type: "success",
        message: `${filesLength}个文件已开始上传`,
        position: "bottom-right",
        duration: 2000,
    });
    async function uploadFileIntoFolder(fileArr: FolderFile[], destFolderId: number) {
        for (const file of fileArr) {
            // 若该文件children的长度不为0则代表该当前项目为文件夹
            if (file.children.length != 0) {
                // 创建当前文件夹在目前document所处的文件夹下
                let { folderId } = (await createFolder(file.title, destFolderId)) as any;
                uploadFileIntoFolder(file.children, folderId);
            } else {
                const rawFile = file.rawFile as UploadRawFile;
                rawFile.uid = getFileId();
                if (cut) {
                    // 获取文件HASH和后缀
                    const [suffix, filename] = getFileSuffix(rawFile);
                    // 开始上传文件
                    upload(rawFile, suffix ?? "", filename, destFolderId);
                } else {
                    rawFile.uid = getFileId();

                    upload(rawFile);
                }
            }
        }
    }
    await uploadFileIntoFolder(fileArr, curFolderId);

    setTimeout(() => {
        indexStore.reloadApp();
    }, 300);
};

const uploadFiles = async (files: File[], isContinue: Boolean = false) => {
    if (files.length === 0) return;
    // 限制上传个数
    const { cut, limit, multiple, isAlbum, onExceed, onStart } = props;
    if (limit && files.length > limit) {
        onExceed!(files);
        return;
    }

    if (!multiple) {
        files = files.slice(0, 1);
    }

    for (const file of files) {
        if (isContinue) {
            const curFile = file as unknown as UploadFile;
            const { suffix, filename, uploadFolder, raw } = curFile;
            // 切片好的chunks
            const chunks = sliceFile(curFile.suffix!, curFile.raw!);
            const { isComplete, fileList } = await getAlready(
                suffix!,
                raw!.filename,
                uploadFolder!,
                isAlbum!
            );
            const alreadyList = Array.from(fileList);
            console.log(alreadyList);

            // 上传chunks
            return uploadChunk(false, chunks, alreadyList, raw!, uploadFolder);
            // 开始上传文件
        }
        const rawFile = file as UploadRawFile;
        const navHeaderStore = appStore.navHeaderStore;
        // 获取当前所在的文件夹id,若本身传入则直接使用
        const curFolderId = navHeaderStore.folderId;

        // 为每个文件赋uid
        rawFile.uid = getFileId();
        rawFile.filename = rawFile.name;
        if (cut) {
            // 获取后缀
            const [suffix, filename] = getFileSuffix(rawFile);
            // 开始上传文件
            upload(rawFile, suffix, filename);
        } else {
            rawFile.uid = getFileId();
            onStart!(rawFile, "", 0);
            upload(rawFile);
        }
    }
    setTimeout(() => {
        indexStore.reloadApp();
    }, 300);
};

const upload = async (
    rawFile: UploadRawFile,
    suffix?: string,
    filename?: string,
    folderId?: number
) => {
    const { cut, isAlbum, onStart } = props;
    // 是否需要切片
    if (!cut) {
        await uploadSingle(rawFile);
    } else {
        const navHeaderStore = appStore.navHeaderStore;
        // 获取当前所在的文件夹id,若本身传入则直接使用
        const curFolderId = folderId || navHeaderStore.folderId;
        rawFile.filename = filename!;
        // 获取已经上传成功的chunks
        const { isComplete, fileList } = await getAlready(
            suffix!,
            rawFile.filename,
            curFolderId,
            isAlbum!
        );
        let alreadyList = fileList;
        // 若已存在则秒传
        if (isComplete) {
            const { handler, count } = (await chooseFileHandle(rawFile)) as any;
            console.log(handler);

            if (handler === "confirm") {
                if (count === 1) rawFile.filename = filename + " - 副本";
                else rawFile.filename = filename + ` - 副本 (${count})`;
                alreadyList = [];
            } else if (handler === "close") {
                return;
            }
        }

        // 调用onStart将HASH赋给文件
        onStart!(rawFile, suffix!, curFolderId);
        // 已经上传成功的chunks数组
        // 切片好的chunks
        const chunks = sliceFile(suffix!, rawFile);
        // 上传chunks
        await uploadChunk(false, chunks, alreadyList, rawFile, curFolderId);
    }
};
const uploadStore = appStore.uploadStore;
uploadStore.uploadFiles = uploadFiles;
</script>
<style lang="scss" scoped>
.inputEl {
    display: none;
}
</style>
