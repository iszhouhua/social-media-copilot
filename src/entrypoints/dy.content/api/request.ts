/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios, { AxiosError, AxiosHeaders, AxiosPromise, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const adapter = async (config: InternalAxiosRequestConfig): AxiosPromise => {
    const init: RequestInit = {
        method: (config.method ?? "GET").toUpperCase(),
        headers: AxiosHeaders.from(config.headers).normalize(true),
        body: config.data
    };
    const data = await sendMessage("fetch", {
        ...init,
        url: axios.getUri(config),
    });
    if (!data) {
        throw new AxiosError('请求失败')
    }
    return { data, status: 200, statusText: "OK", headers: {}, config };
};

const request = axios.create({
    baseURL: "https://www.douyin.com",
    timeout: 10000,
    withCredentials: true,
    adapter
});
// 请求拦截器
request.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    config.params = Object.assign(getCommonParams(), config.params);
    return config;
});
// 响应拦截器
request.interceptors.response.use((response: AxiosResponse) => response.data);

export default request;

//---------- 抖音通用参数 ------------- //

function getCommonParams(): Record<string, any> {
    const params: Record<string, any> = {};
    params["aid"] = 6383;
    params["device_platform"] = "webapp";
    params["channel"] = "channel_pc_web";
    params["version_code"] = 170400;
    params["version_name"] = "17.4.0";
    params["platform"] = "PC";
    params["pc_client_type"] = 1;
    params["cookie_enabled"] = true;
    params["screen_width"] = 2560;
    params["screen_height"] = 1440;
    params["browser_language"] = "zh-CN";
    params["browser_platform"] = 'Linux x86_64';
    params["browser_name"] = 'Chrome';
    params["browser_version"] = "124.0.0.0";
    params["browser_online"] = true;
    params["engine_name"] = "Blink";
    params["engine_version"] = "124.0.0.0";
    params["os_name"] = "Linux";
    return params;
}