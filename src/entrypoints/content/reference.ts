/**
 * 修改window上的全局引用
 * @param shadow 当前shadow
 */
export function updateReference(shadow: ShadowRoot) {
    // 修改document
    shadow.head = shadow.querySelector("head") as HTMLHeadElement;
    shadow.body = shadow.querySelector("body") as HTMLBodyElement;
    document.shadow = shadow;
    // 修改getElementById函数，优先从shadow dom中查找
    const nativeGetElementById = document.getElementById;
    Document.prototype.getElementById = function (elementId: string) {
        const element = shadow.getElementById(elementId);
        return element ? element : nativeGetElementById.call(this, elementId);
    };
    bindPlatform();
}

/**
 * 绑定平台
 */
function bindPlatform() {
    switch (location.hostname) {
        case "www.xiaohongshu.com":
            window.platform = "xhs";
            break;
        case "www.douyin.com":
            window.platform = "dy";
            break;
    }
}