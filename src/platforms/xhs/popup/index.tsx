import { CollapsibleItem, Item } from "@/entrypoints/popup/item"
import { PopupProps } from "@/platforms";
import { Book, BookText, Contact, MessageSquareText } from "lucide-react"

export default (props: PopupProps) => {
    const { onOpenDialog } = props;

    return (<>
        <Item icon={BookText} title='批量导出博主信息'
            onClick={() => onOpenDialog("author")} />
        <CollapsibleItem icon={Contact} title='批量导出笔记数据'>
            <Item icon={Book} title='根据笔记链接导出'
                onClick={() => onOpenDialog("post")} />
            <Item icon={BookText} title='根据博主链接导出'
                onClick={() => onOpenDialog("author-post")} />
        </CollapsibleItem>
        <Item icon={MessageSquareText} title='批量导出笔记评论'
            onClick={() => onOpenDialog("post-comment")} />
    </>)
}