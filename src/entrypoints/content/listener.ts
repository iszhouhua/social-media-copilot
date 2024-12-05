/**
 * 监听导航栏变化
 */
export function navigateListener() {
    // 监听时立即触发一次
    triggerCreateInjectContentScriptUi();
    let timerId: number | undefined;
    const listener = () => {
      timerId && clearTimeout(timerId);
      // 延迟500毫秒再触发创建，不然获取到的location会是原来的
      timerId = window.setTimeout(() => {
        timerId = undefined;
        triggerCreateInjectContentScriptUi();
      }, 500);
    };
    window.navigation.addEventListener("navigate", listener);
    window.context.onInvalidated(() => window.navigation.removeEventListener("navigate", listener));
  }