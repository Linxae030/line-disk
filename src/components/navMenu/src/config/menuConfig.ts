import { IMenuConfig } from "../types";
export const menuConfig: IMenuConfig = {
    menuItems: [
        {
            id: 1,
            title: "文件",
            icon: "Document",
            path: "/driver/document/common",
            type: 1,
        },
        {
            id: 2,
            title: "相册",
            icon: "Picture",
            path: "/driver/album",
            type: 1,
        },
        {
            id: 3,
            title: "传输中",
            icon: "Upload",
            path: "/driver/uploading",
            type: 1,
        },
        {
            id: 4,
            title: "回收站",
            icon: "Delete",
            path: "/driver/recycleBin",
            type: 1,
            children: [
                {
                    subTitle: "文件",
                    path: "/driver/recycleBin/document",
                    type: 2,
                },
                {
                    subTitle: "相册",
                    path: "/driver/recycleBin/album",
                    type: 2,
                },
            ],
        },
    ],
};
