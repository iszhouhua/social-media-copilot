import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'zh_CN',
    permissions: ["activeTab", "downloads", "scripting"],
    host_permissions: [
      "*://*.douyin.com/", "*://*.iesdouyin.com/",
      "*://*.xiaohongshu.com/", "*://*.xhslink.com/"
    ]
  }
});
