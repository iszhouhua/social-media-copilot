import { platformInfoList } from "../platform";

export const UnsupportedPlatform = () => {

  return (<>
    <header className="flex items-center justify-between p-4 gap-4 bg-primary text-primary-foreground shadow"><p
      className="w-full text-center">请前往以下平台使用社媒助手</p></header>
    <main className="m-4">
      <div className="flex items-center justify-center flex-wrap gap-y-4">
        {platformInfoList.map(item => {
          return (
            <a key={item.code} className="w-20 flex flex-col items-center gap-2" target="_blank" href={item.url}>
              <img src={item.icon} className="w-8 h-8 rounded-[22.5%]" alt={item.name} />
              <span className="font-bold">{item.name}</span>
            </a>);
        })}
      </div>
    </main>
  </>);
};