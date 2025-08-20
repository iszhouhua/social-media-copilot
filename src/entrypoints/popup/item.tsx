import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, LucideIcon } from "lucide-react";

export interface ItemProp extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon | string;
  iconClassName?: string;
  title: string;
  label?: React.ReactNode;
}

export const Item = (props: ItemProp) => {
  const { icon: Icon, title, label, className, iconClassName, ...restProps } = props;

  return (<div
    className={cn("h-8 w-full px-4 inline-flex items-center whitespace-nowrap text-sm font-medium justify-start hover:cursor-pointer hover:bg-primary hover:text-primary-foreground", className)}
    {...restProps}>
    {typeof Icon === "string" ? <img src={Icon} className={cn("mr-2 h-4 w-4", iconClassName)} alt={title} /> : <Icon className={cn("mr-2 h-4 w-4", iconClassName)} />}
    <span className="overflow-ellipsis overflow-hidden flex-1">{title}</span>
    {label}
  </div>);
};

export interface CollapsibleItemProp extends ItemProp {
  items?: ItemProp[];
  defaultExpand?: boolean;
}

export const CollapsibleItem = (props: CollapsibleItemProp) => {
  const { label, defaultExpand, children, items, ...restProps } = props;
  const [isOpen, setIsOpen] = useState(defaultExpand ?? false);

  return (<Collapsible open={isOpen} onOpenChange={setIsOpen}>
    <CollapsibleTrigger asChild>
      <Item {...restProps} label={label ?? (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)} />
    </CollapsibleTrigger>
    <CollapsibleContent className="flex flex-col gap-2 pl-4">
      {items ? items.map(item => <Item {...item} />) : children}
    </CollapsibleContent>
  </Collapsible>);
};