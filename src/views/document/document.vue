<template>
    <div class="document">
        <router-view></router-view>
    </div>
</template>

<script setup lang="ts">
import appStore from "@/store";
import { onMounted } from "vue";
import { dropDownConfig } from "./common/config/dropDown.config";
onMounted(() => {
    appStore.navHeaderStore.dropDownConfig = dropDownConfig;
});
</script>

<style lang="scss" scoped>
.document {
    height: 100%;
}
</style>
