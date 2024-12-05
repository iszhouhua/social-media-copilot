import icon from "@/assets/icons/logo.png";

export function Logo() {
    return (<img src={icon} alt="社媒助手" onClick={() => {
        browser.runtime.sendMessage<"openPopup">({ name: "openPopup" });
      }}></img>);
}