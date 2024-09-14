import ReactDOM from "react-dom/client";
import React from "react";
import { Contact, JapaneseYen, MessageCircleMore, MessageCircleWarning, MessageSquareText, StickyNote } from "lucide-react";
import { CollapsibleItem, Item } from "./components/item";
import { UnsupportedPlatform } from "./components/unsupported";
import { PlatformInfo, platformInfoList } from "./platform";
import qrCode from "@/assets/images/qr-code.png";
import appreciationCode from "@/assets/images/appreciation-code.png";
import { browser } from "wxt/browser";
import { getPostLabel } from "@/utils/platform";

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
    <Item icon={StickyNote} title={`批量导出${getPostLabel(platformInfo.code)}数据`}
      onClick={() => handleOpenDialog("post")} />
    <Item icon={MessageSquareText} title={`批量导出${getPostLabel(platformInfo.code)}评论`}
      onClick={() => handleOpenDialog("comment")} />
    <CollapsibleItem icon={Contact} title="联系作者">
      <Item icon={JapaneseYen} title="打赏作者" onClick={() => window.open(appreciationCode)} />
      <Item icon={MessageCircleWarning} title="功能反馈" onClick={() => window.open('https://github.com/iszhouhua/social-media-copilot/issues')} />
      <Item icon={MessageCircleMore} title="添加微信" onClick={() => window.open(qrCode)} />
    </CollapsibleItem>
  </div> : <UnsupportedPlatform />);
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);