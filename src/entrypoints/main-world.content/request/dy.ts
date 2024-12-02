import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Bowser from "bowser";

const request = axios.create({
    baseURL: "https://www.douyin.com",
    timeout: 10000,
    withCredentials: true
});

request.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    config.params = Object.assign(getCommonParams(), config.params);
    return config;
});

request.interceptors.response.use(
    (response: AxiosResponse) => {
        if (!response.data) {
            throw new Error("抖音API返回内容为空");
        }
        const { status_code, status_msg } = response.data;
        if (status_code !== 0) {
            throw new Error(status_msg || "请求失败");
        }
        return response.data;
    }
);

export default request;

function getCommonParams(): Record<string, any> {
    const browser = Bowser.parse(navigator.userAgent);
    const params: Record<string, any> = {};
    params["aid"] = 6383;
    params["device_platform"] = "webapp";
    params["channel"] = "channel_pc_web";
    params["update_version_code"] = 170400;
    params["version_code"] = 190500;
    params["version_name"] = "19.5.0";
    params["platform"] = "PC";
    params["pc_client_type"] = 1;
    params["pc_libra_divert"] = navigator.platform?.indexOf("Mac") > -1 ? "Mac" : navigator.platform?.indexOf("Linux") > -1 ? "Unix" : "Windows";
    params["cookie_enabled"] = navigator?.cookieEnabled;
    params["screen_width"] = screen?.width;
    params["screen_height"] = screen?.height;
    params["browser_name"] = browser.browser.name;
    params["browser_version"] = browser.browser.version;
    params["engine_name"] = browser.engine.name;
    params["engine_version"] = browser.engine.name;
    params["os_name"] = browser.os.name;
    params["os_version"] = browser.os.version;
    params["browser_language"] = navigator.language;
    params["browser_platform"] = navigator.platform;
    params["browser_online"] = navigator.onLine;
    params["cpu_core_num"] = navigator.hardwareConcurrency;
    // @ts-ignore
    params["device_memory"] = navigator.deviceMemory;
    // @ts-ignore
    params["downlink"] = navigator.connection?.downlink;
    // @ts-ignore
    params["effective_type"] = navigator.connection?.effectiveType;
    // @ts-ignore
    params["round_trip_time"] = navigator.connection?.rtt;

    const sysInfo = localStorage.getItem("SysInfo");
    if (sysInfo) {
        params["webid"] = JSON.parse(sysInfo).webid;
    }
    const cookieMap = document.cookie.split(";").filter(item => item.split("=").length === 2).map(item => {
        const arr = item.split("=");
        return { [arr[0].trim()]: arr[1] }
    }).reduce((acc, obj) => {
        return { ...acc, ...obj };
    }, {});
    params['uifid'] = cookieMap['UIFID'];
    return params;
}