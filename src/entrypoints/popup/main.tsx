import ReactDOM from "react-dom/client";
import React from "react";
import { Book, BookText, Contact, JapaneseYen, MessageCircleWarning, MessageSquare, MessageSquareText, StickyNote } from "lucide-react";
import { CollapsibleItem, Item } from "./components/item";
import { UnsupportedPlatform } from "./components/unsupported";
import { PlatformInfo, platformInfoList } from "./platform";
import wechatQrCode from "@/assets/images/wechat-qr-code.png";
import appreciationCode from "@/assets/images/appreciation-code.png";
import { browser } from "wxt/browser";
import { getAuthorLabel, getPostLabel } from "@/utils/platform";

const App = () => {
  const [platformInfo, setPlatformInfo] = React.useState<PlatformInfo>();
  const [tabId, setTabId] = React.useState<number>();

  React.useEffect(() => {
    browser.tabs.query({ active: true }).then(([tab]) => {
      if (!tab) {
        return;
      }
      setTabId(tab.id);
      const platformInfo = platformInfoList.find(p => tab.url?.startsWith(p.url));
      setPlatformInfo(platformInfo);
    });
  }, []);

  const handleOpenDialog = async (name: string) => {
    await browser.scripting.executeScript({
      target: { tabId: tabId! },
      func: (name) => window.dispatchEvent(new CustomEvent("open-dialog", { detail: name })),
      args: [name]
    });
  };

  return (platformInfo ? <div className="flex flex-col gap-2 py-2">

    <CollapsibleItem icon={Contact} title={`批量导出${getPostLabel(platformInfo.code)}`}>
      <Item icon={Book} title={`根据${getPostLabel(platformInfo.code)}ID或链接导出`}
        onClick={() => handleOpenDialog("post")} />
      <Item icon={BookText} title={`根据${getAuthorLabel(platformInfo.code)}ID或链接导出`}
        onClick={() => handleOpenDialog("author-post")} />
    </CollapsibleItem>
    <Item icon={MessageSquareText} title={`批量导出${getPostLabel(platformInfo.code)}评论`}
      onClick={() => handleOpenDialog("post-comment")} />
      <Item icon={BookText} title={`批量导出${getAuthorLabel(platformInfo.code)}信息`}
        onClick={() => handleOpenDialog("author")} />
    <CollapsibleItem icon={Contact} title="沟通交流">
      <Item icon={MessageCircleWarning} title="功能反馈" onClick={() => window.open('https://github.com/iszhouhua/social-media-copilot/issues')} />
      <Item icon={MessageSquareText} title="电报交流群" onClick={() => window.open('https://t.me/SocialMediaCopilot')} />
      <Item icon={MessageSquare} title="添加微信" onClick={() => window.open(wechatQrCode)} />
    </CollapsibleItem>
    <Item icon={JapaneseYen} title="打赏作者" onClick={() => window.open(appreciationCode)} />
  </div> : <UnsupportedPlatform />);
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);