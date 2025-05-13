
# 社媒助手

日常工作中，经常会有从需要各社媒平台采集数据的场景，在使用量不大的情况下，手动处理，太麻烦；用其他产品，可能很贵或需要自己配置非常复杂的开发环境。

所以，本人开发了社媒助手插件，只需在浏览器上安装此插件，即可实现数据采集的自给自足。无需进行任何额外的操作！

目前支持的平台有小红书、抖音、快手，其他平台敬请期待！

## 商店版

推荐优先使用商店版，商店版为开箱即用版本。开源版则是为开发者准备的简易版本，可集成在自己的系统之中。

- **Chrome**：<https://chrome.google.com/webstore/detail/dbichmdlbjdeplpkhcejgkakobjbjalc>
- **Edge**：<https://microsoftedge.microsoft.com/addons/detail/gneijakmdhgakglgogbpldbjhbeddibj>
- **其他浏览器**：下载最新版的[社媒助手](https://smc.iszhouhua.com/changelog)文件，手动加载到浏览器中

[点击查看详细教程](https://smc.iszhouhua.com/guide/)

> [!NOTE]
> 在`0.0.7`版本之前，并无开源版与商店版之分，代码是完整开源的。但后面发现，有不少人直接将开源内容用于盈利，更有甚者，移除了所有**社媒助手**相关标识，未做任何更改直接接入支付功能。
> 于是定将插件拆分为开源版和商店版，商店版维护适合大众使用的功能，开源版仅提供API供开发者集成到自己的系统之中，不含具体的功能实现！
> 我们一直支持开源，并希望技术能够在良性循环中推动进步。但前提是尊重作者的劳动成果和开源协议。如果未来社区环境改善，或有合适的合作方式，不排除重新开放的可能。
> 感谢一直以来支持本项目的开发者和用户。

## 开源版

开源版分为两部分，一个是插件端，一个是服务器端。

项目运行需要`NodeJS`，请自行安装运行环境。

> 推荐使用pnpm，也可使用其他依赖管理工具，如：npm、yarn、cnpm等

### 服务器端

服务器端负责提供api服务，开发者可直接通过调用服务端的api获取平台数据

```bash
# 进入server目录
cd server
# 安装依赖
pnpm install
# 运行项目
pnpm dev
```

运行后访问`http://localhost:3000`，显示`Hello World!`，即表示运行成功！

### 插件端

插件负责向平台发起实际请求，获取到数据后回调给服务器端。

```bash
# 安装依赖
pnpm install
# 运行项目
pnpm dev
```

项目运行后默认会自动打开本机的Chrome浏览器，并自动加载插件代码。

随后打开插件，并点击连接，连接成功后即可通过调用服务器端的API获取平台数据了。

插件端开发文档可参阅[WXT文档](https://wxt.dev)

## API

### /request

用于向目标平台发起请求

- 请求链接：`http://localhost:3000/request`
- 请求方法：`POST`
- 请求体：与[AxiosRequestConfig](https://github.com/axios/axios?tab=readme-ov-file#request-config)相同

下面列举了各个平台获取作品详情的请求，其他数据获取请自行通过浏览器`开发者工具`中的`Network`复制相关参数进行请求

- 抖音

```json
{
    "url": "https://www.douyin.com/aweme/v1/web/aweme/detail/",
    "method": "GET",
    "params":{
        "aweme_id":"7483481060458663168"
    }
}
```

- 小红书

```json
{
    "url": "https://edith.xiaohongshu.com/api/sns/web/v1/feed",
    "method": "POST",
    "data": {
        "source_note_id": "68100548000000002002af1d",
        "image_formats": [
            "jpg",
            "webp",
            "avif"
        ],
        "extra": {
            "need_body_topic": "1"
        },
        "xsec_source": "pc_feed",
        "xsec_token": "AB1bvXKE_cQOoR9MhxeKvX0y4rdHioM-akEz8ypkUmk8U="
    }
}
```

- 快手

```json
{
    "url": "https://www.kuaishou.com/graphql",
    "method": "POST",
    "data": {
        "operationName": "visionVideoDetail",
        "query": "query visionVideoDetail(  $photoId: String  $type: String  $page: String  $webPageArea: String) {  visionVideoDetail(    photoId: $photoId    type: $type    page: $page    webPageArea: $webPageArea  ) {    status    type    author {      id      name      following      headerUrl      livingInfo    }    photo {      id      duration      caption      likeCount      realLikeCount      coverUrl      photoUrl      liked      timestamp      expTag      llsid      viewCount      videoRatio      stereoType      musicBlocked      riskTagContent      riskTagUrl      manifest {        mediaType        businessType        version        adaptationSet {          id          duration          representation {            id            defaultSelect            backupUrl            codecs            url            height            width            avgBitrate            maxBitrate            m3u8Slice            qualityType            qualityLabel            frameRate            featureP2sp            hidden            disableAdaptive          }        }      }      manifestH265      photoH265Url      coronaCropManifest      coronaCropManifestH265      croppedPhotoH265Url      croppedPhotoUrl      videoResource    }    tags {      type      name    }    commentLimit {      canAddComment    }    llsid    danmakuSwitch  }}",
        "variables": {
            "page": "detail",
            "photoId": "3xjzryn333n2ttg",
            "webPageArea": "brilliantxxunknown"
        }
    }
}
```

## 项目部署

> 敬请期待

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=iszhouhua/social-media-copilot&type=Date)](https://star-history.com/#iszhouhua/social-media-copilot&Date)

## ⚠️ 免责声明

本项目仅供学习和研究目的，不得用于任何商业活动。用户在使用本项目时应遵守所在地区的法律法规，对于违法使用所导致的后果，本项目及作者不承担任何责任。

本项目可能存在未知的缺陷和风险（包括但不限于设备损坏和账号封禁等），使用者应自行承担使用本项目所产生的所有风险及责任。 作者不保证本项目的准确性、完整性、及时性、可靠性，也不承担任何因使用本项目而产生的任何损失或损害责任。

使用本项目即表示您已阅读并同意本免责声明的全部内容。如果您对上述声明有任何疑问或不同意，请不要使用本项目的代码和功能。如果您使用了本项目的代码和功能，则视为您已完全理解并接受上述免责声明，并自愿承担使用本项目的一切风险和后果。

本项目的知识产权归开发者所有。本项目受到著作权法和国际著作权条约以及其他知识产权法律和条约的保护。用户在遵守本声明及相关法律法规的前提下，可以下载和使用本项目。

关于本项目的最终解释权归开发者所有。开发者保留随时更改或更新本免责声明的权利。