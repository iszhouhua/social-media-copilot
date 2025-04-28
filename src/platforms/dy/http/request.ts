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
    const data = await browser.runtime.sendMessage<"fetch">({
        name: "fetch",
        body: [axios.getUri(config), init]
    });
    if (!data) {
        throw new AxiosError('Network Error')
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
request.interceptors.response.use(
    (response: AxiosResponse) => {
        const { status_code, status_msg, code, message } = response.data;
        if (status_code !== 0 && code !== 0) {
            throw new Error(status_msg || message || "请求失败");
        }
        return response.data;
    }
);

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
    params["cookie_enabled"] = navigator?.cookieEnabled;
    params["screen_width"] = screen?.width;
    params["screen_height"] = screen?.height;
    params["browser_language"] = navigator?.language;
    params["browser_platform"] = navigator?.platform;
    params["browser_online"] = navigator?.onLine;
    params["cpu_core_num"] = navigator?.hardwareConcurrency;
    // @ts-ignore
    params["device_memory"] = navigator?.deviceMemory;
    // @ts-ignore
    params["downlink"] = navigator?.connection?.downlink;
    // @ts-ignore
    params["effective_type"] = navigator?.connection?.effectiveType;
    // @ts-ignore
    params["round_trip_time"] = navigator?.connection?.rtt;
    return params;
}