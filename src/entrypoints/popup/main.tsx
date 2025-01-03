/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ReactDOM from "react-dom/client";
import dyIcon from "@/assets/icons/dy.png";
import xhsIcon from "@/assets/icons/xhs.png";
import { Contact, Info, JapaneseYen, MessageSquare, MessageSquareText, MonitorCheck } from "lucide-react";
import { CollapsibleItem, Item } from "./item";
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

    return (<div className="flex flex-col gap-2 py-2">
        {platform ? <platform.popup onOpenDialog={handleOpenDialog} />:
        <CollapsibleItem icon={MonitorCheck} title="支持的平台">
                <Item icon={dyIcon} title="抖音" onClick={() => window.open("https://www.douyin.com")} />
                <Item icon={xhsIcon} title="小红书" onClick={() => window.open("https://www.xiaohongshu.com")} />
            </CollapsibleItem>}
        <CollapsibleItem icon={Contact} title="沟通交流">
            <Item icon={MessageSquareText} title="Telegram交流群" onClick={() => window.open('https://t.me/SocialMediaCopilot')} />
            <Item icon={MessageSquareText} title="QQ交流群" onClick={() => window.open('https://smc.iszhouhua.com/images/qq-group-qr-code.jpg')} />
            <Item icon={MessageSquareText} title="微信交流群" onClick={() => window.open('https://smc.iszhouhua.com/images/wechat-group-qr-code.jpg')} />
            <Item icon={MessageSquare} title="添加微信" onClick={() => window.open('https://smc.iszhouhua.com/images/wechat-qr-code.jpg')} />
        </CollapsibleItem>
        <Item icon={JapaneseYen} title="打赏作者" onClick={() => window.open('https://alms.iszhouhua.com')} />
        <Item icon={Info} title="使用文档" onClick={() => window.open('https://smc.iszhouhua.com/docs')} />
    </div>);
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Popup />);