import icon from "@/public/icon/32.png";
import { sendMessage } from "@/utils/messaging/extension";

export function Logo() {
  return (<img src={icon} className="hover:cursor-pointer" alt={i18n.t('name')} onClick={() => {
    sendMessage("openPopup", undefined);
  }}></img>);
}