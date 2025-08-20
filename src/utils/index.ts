/**
 * 等待函数返回非空内容，直到超时
 * @param func 需要执行的函数
 * @param interval 检测间隔
 * @param timeout 超时时间
 */
export function waitFor<T>(func: () => T, interval = 500, timeout = 5000): Promise<T> {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const check = () => {
            const result = func();
            if (result || Date.now() - startTime >= timeout) {
                // 结果不为空，或者达到了超时时间，就中止检查
                resolve(result);
            } else {
                // 等待一段时间后再次检查
                setTimeout(check, interval);
            }
        };
        check();
    });
}


/**
 * 暂停指定时长
 * @param {number} ms 需要暂停的毫秒数
 */
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 对指定内容进行hash
 * @param content 需要进行hash的内容
 * @param algorithm 使用的算法
 * @returns 
 */
export async function hash(content: string, algorithm: AlgorithmIdentifier = 'SHA-256') {
    const data = new TextEncoder().encode(content);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}