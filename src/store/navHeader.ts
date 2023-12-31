import { defineStore } from "pinia";
import { ref } from "vue";
import { subMenuItem } from "@/components/navMenu";
import { menuItem, menuConfig } from "@/components/navMenu";
import { IBreadcrumb } from "@/components/breadcrumb";
import { IDropDownConfig } from "@/components/linDropDown";

export const useNavHeaderStore = defineStore(
    "navHeader",
    () => {
        // 第一个菜单项
        const firstMenu = menuConfig.menuItems[0];
        // 面包屑数组
        const breadcrumbs = ref<IBreadcrumb[]>([{ title: firstMenu.title, path: firstMenu.path }]);
        // 当前路由是否是文件夹数组
        const isFolder = ref(true);
        // 若是文件夹则id为
        const folderId = ref(0);
        // 第一个二级菜单项
        const firstSubMenu = ref(null as subMenuItem | null);
        // 当前激活菜单项(默认第一个)
        const activeSubMenu = ref(null as subMenuItem | null);
        const dropDownConfig = ref<IDropDownConfig>({} as any);
        function pushCrumb(crumb: any) {
            breadcrumbs.value.push(crumb);
        }
        function changeFirstSubMenu(menu: subMenuItem) {
            firstSubMenu.value = menu;
        }
        function changeActiveSubMenu(menu: subMenuItem) {
            activeSubMenu.value = menu;
        }
        return {
            isFolder,
            folderId,
            firstSubMenu,
            activeSubMenu,
            breadcrumbs,
            dropDownConfig,
            changeFirstSubMenu,
            changeActiveSubMenu,
            pushCrumb,
        };
    },
    {
        persist: {
            enabled: true,
            strategies: [
                {
                    // 自定义存储的 key，默认是 store.$id
                    key: "activeSubMenu",
                    paths: ["activeSubMenu", "breadcrumbs"],
                },
            ],
        },
    }
);
