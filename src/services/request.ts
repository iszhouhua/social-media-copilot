import { website } from "@/utils/messaging";
import { AxiosRequestConfig } from "axios";
import { toast } from "sonner";

export type RequestConfig<D = any> = AxiosRequestConfig<D> & {
    noCache?: boolean
}

const requestCache = new Map<string, any>();
export async function request<T = any, D = any>(config: RequestConfig<D>): Promise<T> {
    const { noCache, ...restConfig } = config;
    try {
        if (noCache) {
            return website.sendMessage("request", restConfig);
        }
        const key = await hash(JSON.stringify(restConfig));
        if (requestCache.has(key)) {
            return requestCache.get(key);
        }
        const result = await website.sendMessage("request", restConfig);
        if (!result) {
            throw new Error('返回数据为空!');
        }
        requestCache.set(key, result);
        return result;
    } catch (err: any) {
        toast.error(err.message);
        throw err;
    }
};

export function get<T = any, D = any>(url: string, config?: RequestConfig<D>): Promise<T> {
    return request({ url, method: 'GET', ...config });
};

export function post<T = any, D = any>(url: string, data?: D, config?: RequestConfig<D>): Promise<T> {
    return request({ url, method: 'POST', data, ...config });
};

export default request;