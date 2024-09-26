import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  imports: false,
  srcDir: "src",
  manifest: {
    name: "社媒助手 - 小红书、抖音数据采集工具",
    description: "小红书、抖音等社媒平台的运营辅助工具，支持一键导出无水印图片/视频、文案复制、评论采集、作品数据采集、批量导出数据等...",
    minimum_chrome_version: "102",
    permissions: ["activeTab", "downloads", "scripting"],
    host_permissions: [
      "*://*.douyin.com/", "*://*.iesdouyin.com/", "*://*.xingtu.cn/",
      "*://*.xiaohongshu.com/", "*://*.xhslink.com/"
    ]
  }
});
