import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  dev: {
    server: {
      port: 3001
    }
  },
  manifest: {
    name: '社媒助手开源版',
    description: '社媒助手的开源版本。',
    permissions: ["tabs", "scripting"],
    host_permissions: ["<all_urls>"]
  }
});
