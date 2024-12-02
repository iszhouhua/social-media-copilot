declare global {
    interface ShadowRoot {
        head: Document['head'];
        body: Document['body'];
    }
    interface Document {
        shadow: ShadowRoot;
    }
}

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
}