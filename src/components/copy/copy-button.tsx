import { Button, ButtonProps } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import copy from "copy-to-clipboard";
import { throttle } from "lodash";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type CopyOption = {
  label: string;
  value: string;
  hidden?: boolean;
}

export function CopyButton(props: ButtonProps & {
  options: CopyOption[];
  getData?: () => Promise<Record<string, any>>;
}) {
  const { options, getData,children, ...restProps } = props;
  const [openDropdown, setOpenDropdown] = useState(false);

  const getDataValue = (key: string, data: Record<string, any>) => {
    let content = data;
    key.split('.').forEach(item => {
      if (!content) {
        return;
      }
      content = content[item];
    })
    return content ? String(content) : '';
  }

  const copyData = async (value: string) => {
    let content = getData ? getDataValue(value, await getData()) : value;
    if (!content) {
      toast.warning("内容为空");
    } else if (copy(content)) {
      toast.success("复制成功");
    } else {
      toast.error("复制失败");
    }
  }
  const copyAll = async () => {
    let list: CopyOption[] = options;
    if (getData) {
      list = [];
      const data = await getData();
      for (const option of options) {
        const content = await getDataValue(option.value, data);
        list.push({
          ...option,
          value: content
        });
      }
    }
    const content = list.map(item => `${item.label}:${item.value}`).join('\n');
    if (copy(content)) {
      toast.success("复制成功");
    } else {
      toast.error("复制失败");
    }
  }

  return (
    <DropdownMenu
      modal={false}
      open={openDropdown}
      onOpenChange={() => setOpenDropdown(false)}
    >
      <DropdownMenuTrigger asChild>
        <Button onMouseEnter={() => setOpenDropdown(true)} onClick={throttle(copyAll, 1000)} {...restProps}>
          {children}
          {openDropdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onMouseLeave={() => setOpenDropdown(false)}
      >
        {options.filter(item => !item.hidden).map(item =>
          <DropdownMenuItem key={item.label} onClick={throttle(() => copyData(item.value), 1000)}>
            复制{item.label}
          </DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}