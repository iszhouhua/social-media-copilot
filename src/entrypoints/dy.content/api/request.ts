/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios, { AxiosError, AxiosHeaders, AxiosPromise, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Bowser from "bowser";

const adapter = async (config: InternalAxiosRequestConfig): AxiosPromise => {
    const init: RequestInit = {
        method: (config.method ?? "GET").toUpperCase(),
        headers: AxiosHeaders.from(config.headers).normalize(true),
        body: config.data,
        credentials: "include",
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
    params["version_code"] = "170400";
    params['update_version_code'] = "170400";
    params["version_name"] = "17.4.0";
    params["pc_client_type"] = 1;
    params['pc_libra_divert'] = navigator.platform?.indexOf?.("Mac") > -1 ? "Mac" : navigator.platform?.indexOf("Linux") > -1 ? "Unix" : "Windows";
    params["support_dash"] = 1;
    params["support_h265"] = 1;

    const parser = Bowser.getParser(window.navigator.userAgent);
    const result = parser.getResult();
    params["cookie_enabled"] = true;
    params["screen_width"] = screen.width;
    params["screen_height"] = screen.height;
    params["browser_language"] = navigator.language;
    params["browser_platform"] = navigator.platform;
    params["browser_name"] = result.browser.name;
    params["browser_version"] = result.browser.version;
    params["browser_online"] = navigator.onLine;
    params["engine_name"] = result.engine.name;
    params["engine_version"] = result.engine.version;
    params["os_name"] = result.os.name;
    params["os_version"] = result.os.version;
    params["cpu_core_num"] = navigator.hardwareConcurrency;
    params["device_memory"] = (navigator as any).deviceMemory;
    params["platform"] = "PC";
    params["downlink"] = (navigator as any).connection?.downlink;
    params["effective_type"] = (navigator as any).connection?.effectiveType;
    params["round_trip_time"] = (navigator as any).connection?.rtt;
    return params;
}