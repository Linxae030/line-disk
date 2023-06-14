<template>
    <div class="album">
        <!-- <el-empty description="暂时没有图片哦~" class="empty"> </el-empty> -->
        <div class="selectAll">
            <span
                class="checkAll"
                :style="albumStore.isSelectedAll ? 'background-color:rgb(99, 125, 255)' : ''"
                @click="handleCheckAll"
                ><el-icon color="white" size="11" style="left: -2px"><Select /></el-icon
            ></span>
            <span>共{{ albumStore.displayedFileList.length }}项</span>
        </div>
        <div class="imgContainer">
            <div
                v-for="imgObj in albumData.preImgList"
                :class="
                    albumStore.selectedFileList.find((item) => item.fileId == imgObj.fileId)
                        ? 'imgWarper selected'
                        : 'imgWarper'
                "
            >
                <div
                    @click="handleCheck(imgObj)"
                    :class="
                        albumStore.selectedFileList.find((item) => item.fileId == imgObj.fileId)
                            ? 'checkbox checkboxSelected'
                            : 'checkbox'
                    "
                    :style="
                        albumStore.selectedFileList.find((item) => item.fileId == imgObj.fileId)
                            ? 'background-color:rgb(99, 125, 255)'
                            : ''
                    "
                >
                    <el-icon color="white" size="10"><Select /></el-icon>
                </div>
                <el-image
                    :key="imgObj.url"
                    :src="imgObj.url"
                    lazy
                    fit="cover"
                    :preview-src-list="albumStore.preImgList.map((item) => item.url)"
                    :zoom-rate="1.5"
                    :initial-index="
                    albumStore.preImgList.findIndex(
                        (item:any) => item.url === imgObj.url
                    )
                "
                />
            </div>
        </div>
        <transition
            name="animate__animated animate__bounce animate__delay"
            enter-active-class="animate__fadeInUp"
            leave-active-class="animate__fadeOutDown"
        >
            <!-- 有选中的文件时才显示 -->
            <ToolBar
                :toolBarConfig="toolBarConfig"
                v-show="albumStore.selectedFileList.length"
                class="toolBar"
            ></ToolBar>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { useData } from "./hooks/useData";
import { useHandle } from "./hooks/useHandle";
import appStore from "@/store";
import { toolBarConfig } from "./config/toolBar.config";

const albumData = appStore.albumStore;
const { urlList, albumStore } = useData();
const { handleCheck, handleCheckAll } = useHandle();
</script>

<style lang="scss" scoped>
.empty {
    height: 100%;
}
.album {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0 40px;
}
.imgContainer {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-column-gap: 5px;
    grid-row-gap: 5px;
    .imgWarper {
        display: flex;
        position: relative;
        align-items: center;
        justify-content: center;
        height: 170px;
        width: 163px;
        box-shadow: none;
        border: 2px solid transparent;
        transition: all 0.2s linear;
        justify-self: flex-start;
        margin-bottom: 8px;
        &:hover {
            box-shadow: var(--el-box-shadow);
        }
        &:hover .checkbox {
            opacity: 1;
            border: 2px solid rgb(99, 125, 255);
        }
        .checkboxSelected {
            opacity: 1 !important;
            border: 2px solid rgb(99, 125, 255) !important;
        }
        .checkbox {
            position: absolute;
            left: 15px;
            top: 15px;
            z-index: 100;
            width: 15px;
            height: 15px;
            line-height: 12px;
            background-color: white;
            border-radius: 7.5px;
            border: 2px solid transparent;
            transition: all 0.1s linear;
            opacity: 0;
        }
    }

    .el-image {
        width: 100%;
        height: 100%;
        transition: all 0.2s linear;
    }
}

.selectAll {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    cursor: pointer;

    .checkAll {
        display: inline-block;
        width: 18px;
        height: 18px;
        border-radius: 9px;
        border: 1px solid rgb(99, 125, 255) !important;
        line-height: 20px;
        transition: all 0.1s linear;
    }
    span {
        padding: 0 5px;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.7);
    }
}

.selected {
    border: 4px solid rgb(99, 125, 255) !important;
    .el-image {
        height: 90% !important;
        width: 90% !important;
    }
}
.toolBar {
    position: absolute;
    z-index: 2;
    bottom: 50px;
    left: calc(50% - 110px);
}
.animate__animated.animate__bounce {
    --animate-duration: 0.3s;
}
</style>
