import icon from "@/public/icon/32.png";
import { browser } from "wxt/browser";

export function Logo() {
    return (<img src={icon} alt="社媒助手" onClick={() => {
        browser.runtime.sendMessage<"openPopup">({ name: "openPopup" });
      }}></img>);
}