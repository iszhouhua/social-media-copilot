/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const request = axios.create({
    baseURL: "https://www.kuaishou.com",
    timeout: 10000,
    withCredentials: true,
});


interface Result {
    errors: {
        message: string;
        locations: { line: number, column: number }[];
        path: string[];
        extensions: { code: string };
    }[];
    data: any;
}

request.interceptors.response.use(
    (response: AxiosResponse<Result, any>) => {
        const { data, errors } = response.data
        if (errors?.length) {
            const msg = errors.map(err => err.message).join("\n") || '接口请求失败';
            throw new Error(msg)
        }
        return data
    }, (error: AxiosError<Result>) => {
        const { data } = error.response ?? {};
        const msg = data?.errors?.[0]?.message || error.message;
        return Promise.reject(msg);
    }
);

export default request;