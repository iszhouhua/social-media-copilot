import icon from "@/public/icon/32.png";

export function Logo() {
    return (<img src={icon} alt="社媒助手" onClick={() => {
        browser.runtime.sendMessage<"openPopup">({ name: "openPopup" });
      }}></img>);
}