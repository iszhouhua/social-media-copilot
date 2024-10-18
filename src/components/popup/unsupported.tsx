import xhsIcon from "@/assets/icons/xhs.png";
import dyIcon from "@/assets/icons/dy.png";

const supportedPlatforms = [
  {
    name: "小红书",
    url: "https://www.xiaohongshu.com",
    icon: xhsIcon
  },
  {
    name: "抖音",
    url: "https://www.douyin.com",
    icon: dyIcon
  }
];

export const UnsupportedPlatform = () => {

  return (<>
    <header className="flex items-center justify-between p-4 gap-4 bg-primary text-primary-foreground shadow"><p
      className="w-full text-center">请前往以下平台使用社媒助手</p></header>
    <main className="m-4">
      <div className="flex items-center justify-center flex-wrap gap-y-4">
        {supportedPlatforms.map(item => {
          return (
            <a key={item.name} className="w-20 flex flex-col items-center gap-2" target="_blank" href={item.url}>
              <img src={item.icon} className="w-8 h-8 rounded-[22.5%]" alt={item.name} />
              <span className="font-bold">{item.name}</span>
            </a>);
        })}
      </div>
    </main>
  </>);
};