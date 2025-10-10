# 社媒助手

日常工作中，经常会有从需要各社媒平台采集数据的场景，在使用量不大的情况下，手动处理，太麻烦；用其他产品，可能很贵或需要自己配置非常复杂的开发环境。

所以，本人开发了社媒助手插件，只需在浏览器上安装此插件，即可实现数据采集的自给自足。无需进行任何额外的操作！

目前开源版支持的平台有小红书、抖音、快手，其他平台敬请期待！

## 版本说明

插件目前共分为三个版本，分别是[商店版](https://chrome.google.com/webstore/detail/dbichmdlbjdeplpkhcejgkakobjbjalc)、[开源版](https://github.com/iszhouhua/social-media-copilot/tree/main)、[server版](https://github.com/iszhouhua/social-media-copilot/tree/server)

其中，`商店版`功能最全面，但是不开源。`开源版`和`server版`均开源。

### 商店版

商店版拥有最完整的功能，开箱即用，优先维护，但是不开源。目前支持的平台有小红书、抖音、快手、TikTok等。

### server版

通过API进行调用，且支持自定义部署，维护于[server](https://github.com/iszhouhua/social-media-copilot/tree/server)分支中，适合需要通过API获取数据的用户。

该分支**服务器端**对外提供`HTTP`服务，通过[socket.io](https://github.com/socketio/socket.io)将请求代理到**插件端**，由插件端发起实际请求并将结果回调给**服务器端**。


### 开源版（当前分支）

基于社媒助手`v0.x`版本的代码进行开源，维护于[main](https://github.com/iszhouhua/social-media-copilot/tree/main)分支中，会做一些基础功能的维护，供大家学习交流使用。

开源版目前支持的主要功能如下：

|   平台   | 无水印视频/图片下载 | 采集指定作品的数据 | 采集指定作品的评论 | 采集指定创作者的数据 | 采集指定创作者的作品 |
| :------: | :-----------------: | :----------------: | :----------------: | :------------------: | :------------------: |
|  小红书  |          ✅          |         ✅          |         ✅          |          ✅           |          ✅          |
|   抖音   |          ✅          |         ✅          |         ✅          |          ✅           |          ✅          |
|   快手   |          ✅          |         ✅          |         ✅          |           ✅          |          ✅          |

## 项目结构

```text
.
├── src/                    # 源代码
│   ├── assets/             # 资源目录
│   ├── components/         # 公共组件
│   ├── entrypoints/        # 插件入口
│   │   ├── background/     # 插件的background
│   │   ├── popup/          # 插件的popup
│   │   ├── xhs.content/    # 小红书平台相关脚本
│   │   └── dy.content/     # 抖音平台相关脚本
│   │   └── ks.content/     # 快手平台相关脚本
│   ├── public/             # 静态文件
│   └── utils/              # 工具函数
├── output/                 # 项目编译输出目录
├── docs/                   # 文档与截图
│   ├── images/             # 项目截图
│   ├── dy.md               # 抖音功能介绍
│   └── xhs.md              # 小红书功能介绍
│   ├── ks.md               # 快手功能介绍
├── package.json            # 项目依赖配置
├── README.md               # 项目说明
└── wxt.config.ts           # WXT配置文件

```

## 功能说明

 - [点击查看抖音功能说明](./docs/dy.md)

 - [点击查看小红书功能说明](./docs/xhs.md)

## 快速开始

项目运行需要`NodeJS`，请自行安装运行环境。

> 推荐使用pnpm，也可使用其他依赖管理工具，如：npm、yarn、cnpm等

```bash
# 安装依赖
pnpm install
# 运行项目
pnpm dev
```

项目运行成功后，打开自己的Chrome浏览器，进入插件管理面板（`chrome://extensions/`）->开启开发者模式->加载未打包的扩展程序->选择`output/chrome-mv3`目录

随后打开插件，并连接服务器端，连接成功后即可通过调用服务器端的 API 获取平台数据了。

项目核心框架为[WXT](https://github.com/wxt-dev/wxt)，具体可见：[WXT文档](https://wxt.dev)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=iszhouhua/social-media-copilot&type=Date)](https://star-history.com/#iszhouhua/social-media-copilot&Date)

## ⚠️ 免责声明

本项目仅供学习和研究目的，不得用于任何商业活动，请在下载后24小时内删除。用户在使用本项目时应遵守所在地区的法律法规，对于违法使用所导致的后果，本项目及作者不承担任何责任。

本项目可能存在未知的缺陷和风险（包括但不限于设备损坏和账号封禁等），使用者应自行承担使用本项目所产生的所有风险及责任。 作者不保证本项目的准确性、完整性、及时性、可靠性，也不承担任何因使用本项目而产生的任何损失或损害责任。

使用本项目即表示您已阅读并同意本免责声明的全部内容。如果您对上述声明有任何疑问或不同意，请不要使用本项目的代码和功能。如果您使用了本项目的代码和功能，则视为您已完全理解并接受上述免责声明，并自愿承担使用本项目的一切风险和后果。

本项目的知识产权归开发者所有。本项目受到著作权法和国际著作权条约以及其他知识产权法律和条约的保护。用户在遵守本声明及相关法律法规的前提下，可以下载和使用本项目。

关于本项目的最终解释权归开发者所有。开发者保留随时更改或更新本免责声明的权利。
