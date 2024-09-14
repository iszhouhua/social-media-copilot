import xhsIcon from "@/assets/icons/xhs.png";
import dyIcon from "@/assets/icons/dy.png";

export type PlatformInfo = {
  code: typeof window.platform;
  name: string;
  url: string;
  icon: string;
};

export const platformInfoList: Array<PlatformInfo> = [
  {
    code: "xhs",
    name: "小红书",
    url: "https://www.xiaohongshu.com",
    icon: xhsIcon
  },
  {
    code: "dy",
    name: "抖音",
    url: "https://www.douyin.com",
    icon: dyIcon
  }
];