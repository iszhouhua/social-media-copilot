/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ReactDOM from "react-dom/client";
import dyIcon from "@/assets/icons/dy.png";
import xhsIcon from "@/assets/icons/xhs.png";
import platforms, { Platform } from "@/platforms";

export const Popup = () => {
    const [platform, setPlatform] = useState<Platform>();
    const [tabId, setTabId] = useState<number>();

    useEffect(() => {
        browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
            if (!tab) {
                return;
            }
            setTabId(tab.id);
            const platformCode = getPlatformCode(tab.url);
            if (platformCode) {
                setPlatform(platforms[platformCode]);
            }
        });
    }, []);

    const handleOpenDialog = async (name: string) => {
        await browser.scripting.executeScript({
            target: { tabId: tabId! },
            func: (name) => window.dispatchEvent(new CustomEvent("task-dialog", { detail: { name } })),
            args: [name]
        });
    };

    return (<>{platform ? <div className="flex flex-col gap-2 py-2">
        <platform.popup onOpenDialog={handleOpenDialog} />
    </div> : <div className="w-60">
        <header className="flex items-center justify-between p-4 gap-4 bg-blue-500 shadow"><p
            className="w-full text-center text-white">请前往以下平台使用社媒助手</p></header>
        <main className="m-4">
            <div className="flex items-center justify-center flex-wrap gap-y-4">
                <a className="w-16 flex flex-col items-center gap-2" target="_blank" href="https://www.xiaohongshu.com">
                    <img src={xhsIcon} className="w-8 h-8 rounded-[22.5%]" />
                    <span className="font-bold">小红书</span>
                </a>
                <a className="w-16 flex flex-col items-center gap-2" target="_blank" href="https://www.douyin.com">
                    <img src={dyIcon} className="w-8 h-8 rounded-[22.5%]" />
                    <span className="font-bold">抖音</span>
                </a>
            </div>
        </main>
    </div>}
    </>);
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Popup />);