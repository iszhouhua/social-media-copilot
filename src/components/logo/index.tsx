export function Logo() {
  return (<img src={browser.runtime.getURL("/icon/48.png")} className="hover:cursor-pointer size-8" alt="社媒助手" onClick={() => {
    sendMessage("openPopup", undefined);
  }}></img>);
}