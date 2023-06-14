import { IToolBarConfig, toolBarItem } from "@/components/toolBar/types";
import { useToolBarClick } from "../hooks/useToolBarClick";
const { handleCancelSelect, handleIntoRecycle, handleDownload } = useToolBarClick();
export const toolBarConfig: IToolBarConfig = {
    toolBarItems: [
        {
            icon: "Download",
            color: "white",
            size: 18,
            tooltipConfig: {
                content: "下载",
                effect: "dark",
                placement: "top",
            },
            clickCallBack: handleDownload,
        },
        {
            icon: "Link",
            color: "white",
            size: 18,
            tooltipConfig: { content: "分享" },
            clickCallBack(item) {
                console.log(item);
            },
        },

        {
            icon: "Delete",
            color: "white",
            size: 18,
            tooltipConfig: { content: "收入回收站" },
            clickCallBack: handleIntoRecycle,
        },
        {
            icon: "Remove",
            color: "white",
            size: 18,
            tooltipConfig: { content: "移除多选" },
            clickCallBack: handleCancelSelect,
        },
    ],
    style: {},
};
