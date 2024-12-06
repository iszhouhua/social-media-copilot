import { Contact, Info, JapaneseYen, MessageSquare, MessageSquareText } from "lucide-react";
import { CollapsibleItem, Item } from "./item";
import { UnsupportedPlatform } from "./unsupported";
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
            if(platformCode){
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

    return (platform ? <div className="flex flex-col gap-2 py-2">
        <platform.popup onOpenDialog={handleOpenDialog} />
        <CollapsibleItem icon={Contact} title="沟通交流">
            <Item icon={MessageSquareText} title="Telegram交流群" onClick={() => window.open('https://t.me/SocialMediaCopilot')} />
            <Item icon={MessageSquareText} title="QQ交流群" onClick={() => window.open('https://smc.iszhouhua.com/image/qq-group-qr-code.jpg')} />
            <Item icon={MessageSquareText} title="微信交流群" onClick={() => window.open('https://smc.iszhouhua.com/image/wechat-group-qr-code.jpg')} />
            <Item icon={MessageSquare} title="添加微信" onClick={() => window.open('https://smc.iszhouhua.com/image/wechat-qr-code.jpg')} />
        </CollapsibleItem>
        <Item icon={JapaneseYen} title="打赏作者" onClick={() => window.open('https://alms.iszhouhua.com')} />
        <Item icon={Info} title="使用文档" onClick={() => window.open('https://ocn0jsywtv09.feishu.cn/wiki/Hh5vwSfh6iONmkkgEk8cXD2WnSc')} />
    </div> : <UnsupportedPlatform />);
};