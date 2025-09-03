/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import dyIcon from "@/assets/icons/dy.png";
import xhsIcon from "@/assets/icons/xhs.png";
import ksIcon from "@/assets/icons/ks.png";
import { Separator } from "@/components/ui/separator";
import { Book, BookText, BookUser, Bug, CircleUser, GitBranch,  MessageSquareMore, MonitorCheck } from "lucide-react";
import ReactDOM from "react-dom/client";
import { Tabs } from "wxt/browser";
import { CollapsibleItem, CollapsibleItemProp, Item } from './item';

type Platform = {
    code: string;
    hostname: string;
    getItems: (handleOpenDialog: (name: string) => void) => CollapsibleItemProp[];
};

const platforms: Platform[] = [
    {
        code: 'dy',
        hostname: 'www.douyin.com',
        getItems: (handleOpenDialog) => {
            return [
                { icon: CircleUser, title: '批量导出达人信息', onClick: () => { handleOpenDialog('author') } },
                {
                    icon: Book, title: '批量导出视频数据', defaultExpand: true, items: [
                        { icon: BookText, title: '根据视频链接导出', onClick: () => { handleOpenDialog('post') } },
                        { icon: BookUser, title: '根据达人链接导出', onClick: () => { handleOpenDialog('author-post') } },
                    ]
                },
                { icon: MessageSquareMore, title: '批量导出视频评论', onClick: () => { handleOpenDialog('post-comment') } },
            ];
        }
    },
    {
        code: 'xhs',
        hostname: 'www.xiaohongshu.com',
        getItems: (handleOpenDialog) => {
            return [
                { icon: CircleUser, title: '批量导出博主信息', onClick: () => { handleOpenDialog('author') } },
                {
                    icon: Book, title: '批量导出笔记数据', defaultExpand: true, items: [
                        { icon: BookText, title: '根据笔记链接导出', onClick: () => { handleOpenDialog('post') } },
                        { icon: BookUser, title: '根据博主链接导出', onClick: () => { handleOpenDialog('author-post') } },
                    ]
                },
                { icon: MessageSquareMore, title: '批量导出笔记评论', onClick: () => { handleOpenDialog('post-comment') } },
            ];
        }
    },
    {
        code: 'ks',
        hostname: 'www.kuaishou.com',
        getItems: (handleOpenDialog) => {
            return [
                { icon: CircleUser, title: '批量导出达人信息', onClick: () => { handleOpenDialog('author') } },
                {
                    icon: Book, title: '批量导出视频数据', defaultExpand: true, items: [
                        { icon: BookText, title: '根据视频链接导出', onClick: () => { handleOpenDialog('post') } },
                        { icon: BookUser, title: '根据达人链接导出', onClick: () => { handleOpenDialog('author-post') } },
                    ]
                },
                { icon: MessageSquareMore, title: '批量导出视频评论', onClick: () => { handleOpenDialog('post-comment') } },
            ];
        }
    }
];


const App = () => {
    const [tab, setTab] = useState<Tabs.Tab>();
    const [platform, setPlatform] = useState<Platform>();

    useEffect(() => {
        browser.tabs.query({ active: true, currentWindow: true })
            .then(([tab]) => {
                setTab(tab);
                if (tab?.url) {
                    const hostname = new URL(tab.url).hostname;
                    setPlatform(platforms.find(p => p.hostname === hostname));
                }
            });
    }, []);

    const handleOpenDialog = (name: string) => {
        sendMessage('openTaskDialog', { name }, tab?.id);
    }

    return (<div className="flex flex-col gap-1 py-1">
        {platform ? platform.getItems(handleOpenDialog).map(item => item.items ? <CollapsibleItem {...item} /> : <Item {...item} />) :
            <CollapsibleItem icon={MonitorCheck} title="支持的平台" defaultExpand iconClassName="text-lime-600">
                <Item icon={dyIcon} title="抖音" onClick={() => window.open("https://www.douyin.com")} />
                <Item icon={xhsIcon} title="小红书" onClick={() => window.open("https://www.xiaohongshu.com")} />
                <Item icon={ksIcon} title="快手" onClick={() => window.open("https://www.kuaishou.com")} />
            </CollapsibleItem>}
        <Separator />
        <Item icon={GitBranch} title="查看源码" iconClassName="text-violet-600" onClick={() => window.open('https://github.com/iszhouhua/social-media-copilot')} />
        <Item icon={Bug} title="提交反馈" iconClassName="text-rose-600" onClick={() => window.open('https://github.com/iszhouhua/social-media-copilot/issues')} />
    </div>);
};


const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);