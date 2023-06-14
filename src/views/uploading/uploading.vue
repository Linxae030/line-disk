<template>
    <div class="uploading">
        <el-empty description="暂时没有传输任务哦~" v-if="tableData.length === 0" class="empty" />
        <LinTable v-else :tableData="tableData" :columnConfig="columnConfig" :showSelection="false">
            <template #fileName="scope">
                <div class="nameContainer">
                    <span class="icon">
                        <img :src="getAssetsFile(fileNameToIconUrl(scope.row.name))" alt="" />
                    </span>
                    <span class="name">{{ scope.row.name }}</span>
                </div>
            </template>
            <template #progress="scope">
                <div class="progressContainer">
                    <el-progress
                        :percentage="scope.row.percentage"
                        :status="scope.row.percentage === 100 ? 'success' : ''"
                        :duration="3"
                        color="rgba(99, 125, 255, 0.75)"
                    />
                </div>
            </template>
            <template #sizeProgress="scope">
                <div>{{ format(scope.row) }}</div>
            </template>
            <template #toolBar="scope">
                <div class="toolBarContainer">
                    <toolBar :toolBarConfig="toolBarConfig" :scope="scope" class="toolBar">
                        <!-- TODO:感觉不够优雅，能不能不复写一次直接控制是否显示 -->
                        <template #VideoPlay="{ item }">
                            <div
                                class="toolBarItem"
                                @click="changePause(scope, item.clickCallBack)"
                                v-show="scope.row.isPause"
                            >
                                <el-icon color="black" :size="18">
                                    <component :is="item.icon"></component>
                                </el-icon>
                            </div>
                        </template>
                        <template #VideoPause="{ item }">
                            <div
                                class="toolBarItem"
                                @click="changePause(scope, item.clickCallBack)"
                                v-show="!scope.row.isPause"
                            >
                                <el-icon color="black" :size="18">
                                    <component :is="item.icon"></component>
                                </el-icon>
                            </div>
                        </template>
                    </toolBar>
                </div>
            </template>
        </LinTable>
    </div>
</template>

<script setup lang="ts">
import LinTable from "@/components/linTable";
import toolBar from "@/components/toolBar";

import { computed, onMounted, ref } from "vue";

import { columnConfig } from "./config/columnItems.config";
import { toolBarConfig } from "./config/toolBar.config";

import appStore from "@/store";

import { fileNameToIconUrl, fileSizeTransfer, getAssetsFile } from "@/utils";
import LinUploadContent from "@/components/linUpload/src/linUploadContent.vue";

const linUploadRef = ref<InstanceType<typeof LinUploadContent>>();
// 取出uploadStore
const uploadStore = appStore.uploadStore;
// 表格数据来源
const tableData = computed(() => {
    return uploadStore.arrFileList;
});
// 文件大小展示格式
const format = (row: any) => {
    return `${fileSizeTransfer((row.size * row.percentage) / 100)}/${fileSizeTransfer(row.size)}`;
};

const changePause = (scope: any, callback: any) => {
    let isPause = scope.row.isPause;
    isPause = !isPause;
    scope.row.isPause = isPause;
    callback(scope);
};

onMounted(() => {
    appStore.navHeaderStore.dropDownConfig = null as any;
});
</script>

<style lang="scss" scoped>
// TODO:优化scss结构
.uploading {
    height: 100%;
}
.nameContainer {
    @include flexCenter(row);
    justify-content: flex-start;
    .icon {
        img {
            @include square($listImgSize);
        }
    }
    .name {
        height: 35px;
        line-height: 35px;
        margin-left: 20px;
    }
}
.toolBarContainer {
    .toolBar {
        box-sizing: content-box !important;
        background-color: white;
        border: 0px;
    }
}
.toolBarItem {
    @include flexCenter(row);
    @include square(30px);
    border-radius: 5px;
    background: transparent;
    transition: all 0.2s;
    cursor: pointer;
    &:hover {
        background: $basic_white_quarternary;
    }
}
.empty {
    background-color: white;
    height: 100%;
}
</style>
