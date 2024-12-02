import { Separator } from "@/components/ui/separator";
import { sendMessage } from "@/utils/messaging/extension";
import { Book, BookText, BookUser, CircleUser, Contact, Heart, Info, MessageSquare, MessageSquareMore, MessageSquareText } from "lucide-react";
import { CollapsibleItem, Item } from "./item";

export default (props: {
    platform: Platform
    tabId: number
}) => {
    const { platform, tabId } = props;

    const handleOpenDialog = async (name: string) => {
        await sendMessage("openTaskDialog", { name }, tabId);
    };

    return (<div className="flex flex-col gap-1 py-1">
        <Item icon={CircleUser} title={i18n.t('popup.batchExportAuthor', [i18n.t(`${platform}.author`)])} onClick={() => handleOpenDialog('author')} />
        <CollapsibleItem icon={Book} title={i18n.t('popup.batchExportPost', [i18n.t(`${platform}.post`)])}>
            <Item icon={BookText} title={i18n.t('popup.batchExportPostByUrl', [i18n.t(`${platform}.post`)])} onClick={() => handleOpenDialog('post')} />
            <Item icon={BookUser} title={i18n.t('popup.batchExportPostByUrl', [i18n.t(`${platform}.author`)])} onClick={() => handleOpenDialog('author-post')} />
        </CollapsibleItem>
        <Item icon={MessageSquareMore} title={i18n.t('popup.batchExportPostComment', [i18n.t(`${platform}.post`)])} onClick={() => handleOpenDialog('post-comment')} />
        <Separator />
        <CollapsibleItem icon={Contact} iconClassName="text-violet-600" title={i18n.t('popup.contact')}>
            <Item icon={MessageSquareText} title={i18n.t('popup.telegramGroup')} onClick={() => window.open('https://t.me/SocialMediaCopilot')} />
            <Item icon={MessageSquareText} title={i18n.t('popup.qqGroup')} onClick={() => window.open('https://smc.iszhouhua.com/image/qq-group-qr-code.jpg')} />
            <Item icon={MessageSquareText} title={i18n.t('popup.wechatGroup')} onClick={() => window.open('https://smc.iszhouhua.com/image/wechat-group-qr-code.jpg')} />
            <Item icon={MessageSquare} title={i18n.t('popup.wechat')} onClick={() => window.open('https://smc.iszhouhua.com/image/wechat-qr-code.jpg')} />
        </CollapsibleItem>
        <Item icon={Heart} iconClassName="text-red-600" title={i18n.t('popup.donate')} onClick={() => window.open('https://alms.iszhouhua.com')} />
        <Item icon={Info} iconClassName="text-cyan-600" title={i18n.t('popup.help')} onClick={() => window.open('https://ocn0jsywtv09.feishu.cn/wiki/space/7441517360869064705')} />
    </div>);
};