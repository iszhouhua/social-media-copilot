# 社媒助手

此分支为社媒助手可进行`API`调用且支持服务器部署的版本。

此版本非开箱即用版本，分为[服务器端](#服务器端)和[插件端](#插件端)两部分。主要为开发者提供代理服务，开发者可通过本软件向平台发起请求，省去破解平台加密的烦恼。

此分支的**服务器端**对外提供`HTTP`服务，通过[socket.io](https://github.com/socketio/socket.io)将请求代理到**插件端**，由插件端发起实际请求并将结果回调给**服务器端**。

项目运行需要`NodeJS`，请自行安装运行环境。

> 推荐使用 pnpm，也可使用其他依赖管理工具，如：npm、yarn、cnpm 等

### 服务器端

服务器端负责提供 api 服务，开发者可直接通过调用服务端的 api 获取平台数据

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

项目运行成功后，打开自己的Chrome浏览器，进入插件管理面板（`chrome://extensions/`）->开启开发者模式->加载已解压的扩展程序->选择`output/chrome-mv3`目录

随后打开插件，并连接服务器端，连接成功后即可通过调用服务器端的 API 获取平台数据了。

插件端开发文档可参阅[WXT 文档](https://wxt.dev)

## API

### /cookies

用于设置平台的 cookie

- 请求链接：`http://localhost:3000/cookies`
- 请求方法：`POST`
- 请求体：

| 字段    | 类型   | 说明                   |
| ------- | ------ | ---------------------- |
| url     | string | 与设置cookie关联的请求URL。该值可以影响创建的cookie的默认域和路径值。   |
| cookies | array  | 需要写入的 cookie 数组 |

Cookie数组选项值如下：

```typescript
{
    /** Optional. The domain of the cookie. If omitted, the cookie becomes a host-only cookie.  */
    domain ?: string | undefined;
    /** Optional. The name of the cookie. Empty by default if omitted.  */
    name ?: string | undefined;
    /**
     * The partition key for reading or modifying cookies with the Partitioned attribute.
     * @since Chrome 119
     */
    partitionKey ?: CookiePartitionKey | undefined;
    /** Optional. The ID of the cookie store in which to set the cookie. By default, the cookie is set in the current execution context's cookie store.  */
    storeId ?: string | undefined;
    /** Optional. The value of the cookie. Empty by default if omitted.  */
    value ?: string | undefined;
    /** Optional. The expiration date of the cookie as the number of seconds since the UNIX epoch. If omitted, the cookie becomes a session cookie.  */
    expirationDate ?: number | undefined;
    /** Optional. The path of the cookie. Defaults to the path portion of the url parameter.  */
    path ?: string | undefined;
    /** Optional. Whether the cookie should be marked as HttpOnly. Defaults to false.  */
    httpOnly ?: boolean | undefined;
    /** Optional. Whether the cookie should be marked as Secure. Defaults to false.  */
    secure ?: boolean | undefined;
    /**
     * Optional. The cookie's same-site status. Defaults to "unspecified", i.e., if omitted, the cookie is set without specifying a SameSite attribute.
     * @since Chrome 51
     */
    sameSite ?: SameSiteStatus | undefined;
}
```

请求示例：

```json
{
  "url": "https://www.xiaohongshu.com/explore",
  "cookies": [
    {
      "domain": ".xiaohongshu.com",
      "expirationDate": 1776311753,
      "name": "web_session",
      "path": "/",
      "value": "your session"
    }
  ]
}
```

> [!TIP]
> 获取`cookies`可直接通过[Cookie-Editor](https://chromewebstore.google.com/detail/hlkenndednhfkekhgcdicdfddnkalmdm)将 Cookie 导出为 JSON。

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
  "params": {
    "aweme_id": "7483481060458663168"
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
    "image_formats": ["jpg", "webp", "avif"],
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

### 半托管方案（本地插件+远程服务器）

可通过在服务器部署服务端代码，在本地运行插件端代码，便可在自己的系统中通过 API 调用获取平台数据。

- 优点：本地运行插件，可随时观测平台状态，处理遇到的平台风控问题。

- 缺点：插件在本地运行，需长期保持电脑处于开机状态，无法进行托管。

服务器端代码可使用如下方式进行Docker镜像一键部署，也可自行使用其他方式部署。

```shell
# 拉取镜像
docker pull iszhouhua/social-media-copilot:server
# 运行镜像
docker run -d --name social-media-copilot -p 3000:3000 iszhouhua/social-media-copilot:server
```

### 全托管方案（Docker部署）

基于Chrome无头浏览器[zenika/alpine-chrome](https://github.com/jlandure/alpine-chrome)进行Docker镜像构建，将插件运行于无头浏览器中，并运行服务器端代码，以实现双端代码全托管运行。

- 优点：全托管运行，可完全部署在服务器，只需维护好cookie即可。

- 缺点：通过无头浏览器运行，遇到触发平台风控时不方便处理。

#### 官方Docker运行

```shell
# 拉取镜像
docker pull iszhouhua/social-media-copilot:latest
# 运行镜像
docker container run -d --name social-media-copilot --cap-add=SYS_ADMIN  -p 3000:3000 iszhouhua/social-media-copilot:latest
```

#### 自行构建

```shell
# 编译插件端代码
npm run build
# 构建Docker镜像
docker build . -t=iszhouhua/social-media-copilot:latest
# 运行Docker镜像
docker container run -d --name social-media-copilot --cap-add=SYS_ADMIN  -p 3000:3000 iszhouhua/social-media-copilot:latest
```

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=iszhouhua/social-media-copilot&type=Date)](https://www.star-history.com/#iszhouhua/social-media-copilot&Date)

## ⚠️ 免责声明

本项目仅供学习和研究目的，不得用于任何商业活动。用户在使用本项目时应遵守所在地区的法律法规，对于违法使用所导致的后果，本项目及作者不承担任何责任。

本项目可能存在未知的缺陷和风险（包括但不限于设备损坏和账号封禁等），使用者应自行承担使用本项目所产生的所有风险及责任。 作者不保证本项目的准确性、完整性、及时性、可靠性，也不承担任何因使用本项目而产生的任何损失或损害责任。

使用本项目即表示您已阅读并同意本免责声明的全部内容。如果您对上述声明有任何疑问或不同意，请不要使用本项目的代码和功能。如果您使用了本项目的代码和功能，则视为您已完全理解并接受上述免责声明，并自愿承担使用本项目的一切风险和后果。

本项目的知识产权归开发者所有。本项目受到著作权法和国际著作权条约以及其他知识产权法律和条约的保护。用户在遵守本声明及相关法律法规的前提下，可以下载和使用本项目。

关于本项目的最终解释权归开发者所有。开发者保留随时更改或更新本免责声明的权利。
