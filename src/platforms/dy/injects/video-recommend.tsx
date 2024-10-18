import videoDetail, { Component } from './video-detail';

// 视频推荐页
const recommendDefinition = defineInjectContentScriptUi({
    ...videoDetail,
    isMatch: () => {
        if (videoDetail.isMatch()) return false;
        if (location.pathname === "/") return true;
        const modalId = new URLSearchParams(location.search).get("modal_id");
        if (!modalId) return false;
        return /^[0-9]+$/.test(modalId);
    },
    anchor: "div[data-e2e=\"feed-active-video\"] xg-right-grid",
    async onMount({ mounted, remove, anchor }) {
        const activeVideo = document.querySelector("div[data-e2e=\"feed-active-video\"]");
        if (!activeVideo) return remove();
        const awemeId = activeVideo.getAttribute("data-e2e-vid");
        if (!awemeId) return remove();
        const type = activeVideo.querySelector(".account-card")?.textContent === "图文" ? "note" : "video";
        mounted.render(<Component type={type} awemeId={awemeId} />);

        if (location.pathname === "/") {
            // 首页需要监听视频变化
            recommendListener(anchor);
        } else {
            // 其余页面不需要监听
            clearTimeout(listenerTimerId);
        }
    }
});

/**
 * 监听推荐视频变化
 */
let listenerTimerId: number;
const recommendListener = function (anchor: Element) {
    clearTimeout(listenerTimerId);
    listenerTimerId = window.context.setInterval(() => {
        if (!recommendDefinition.isMatch()) {
            clearInterval(listenerTimerId);
            return;
        }
        const newAnchor = getAnchor(recommendDefinition);
        if (newAnchor !== anchor) {
            // 节点变了，触发创建
            clearInterval(listenerTimerId);
            triggerCreateInjectContentScriptUi();
        }
    }, 500);
};

export default recommendDefinition;