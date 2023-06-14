<template>
    <div class="linUpload">
        <LinUploadContent v-bind="uploadContentProps">
            <slot></slot>
        </LinUploadContent>
    </div>
</template>

<script setup lang="ts">
import { computed, shallowRef } from "vue";
import LinUploadContent from "./linUploadContent.vue";
import { UploadEvent, UploadPropsDefault } from "./linUpload";
import { UploadContentProps, UploadContentInstance } from "./linUploadContent";
import { useUploadHandler } from "../hooks/useUploadHandler";
import { Chunk, UploadCallBacks, UploadFile, UploadFiles } from "../types";
import { UploadRawFile } from "../types/index";

const props = withDefaults(
    defineProps<{
        url?: string;
        method?: string;
        multiple?: boolean;
        webkitdirectory?: boolean;
        accept?: string;
        limit?: number;
        cut?: boolean;
        isAlbum?: number;
        headers?: Record<string, any>;
        onExceed?: UploadCallBacks["onExceed"];
        onStart?: (file: UploadFile, suffix: string, folderId: number) => void;
        onProgress?: (evt: UploadEvent, uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
        onCancel?: (alreadyCount: number, uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
        onSuccess?: (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => unknown;
        onError?: (err: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
    }>(),
    {
        ...UploadPropsDefault,
    }
);

const uploadRef = shallowRef<UploadContentInstance>();
const { uploadFiles, handleStart, handleError, handleSuccess, handleProgress, handleCancel } =
    useUploadHandler(props, uploadRef);

const uploadContentProps = computed<UploadContentProps>(() => ({
    ...props,
    fileList: uploadFiles,
    onStart: handleStart,
    onProgress: handleProgress,
    onCancel: handleCancel,
    onSuccess: handleSuccess,
    onError: handleError,
}));
</script>

<style lang="scss" scoped></style>
