import { ChevronDown, ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface ItemProp extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon | string;
  title: string;
  label?: React.ReactNode;
}

export const Item = (props: ItemProp) => {
  const { icon: Icon, title, label, className, ...restProps } = props;

  return (<div
    className={cn("h-8 w-full px-4 inline-flex items-center whitespace-nowrap text-sm font-medium justify-start hover:cursor-pointer hover:bg-primary hover:text-primary-foreground", className)}
    {...restProps}>
    {typeof Icon === "string" ? <img src={Icon} className="mr-2 h-4 w-4" alt={title} /> : <Icon className="mr-2 h-4 w-4" />}
    <span className="overflow-ellipsis overflow-hidden flex-1">{title}</span>
    {label}
  </div>);
};

export const CollapsibleItem = (props: ItemProp & {
  children: React.ReactNode[]
}) => {
  const { label, children, ...restProps } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (<Collapsible open={isOpen} onOpenChange={setIsOpen}>
    <CollapsibleTrigger asChild>
      <Item {...restProps} label={label ?? (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)} />
    </CollapsibleTrigger>
    <CollapsibleContent className="flex flex-col gap-2 pl-4">
      {children}
    </CollapsibleContent>
  </Collapsible>);
};