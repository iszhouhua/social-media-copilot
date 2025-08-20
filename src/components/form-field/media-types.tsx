import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

export type MediaType = {
    value: string;
    label: string;
    required?: boolean;
};

export const MediaTypesFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
    items: MediaType[];
    defaultChecked?: boolean;
}) => {
    const { items, defaultChecked, ...restProps } = props;
    return (
        <FormField
            {...restProps}
            render={({ field }) => {
                const [needMedia, setNeedMedia] = useState<boolean | undefined>(defaultChecked);
                useEffect(() => {
                    if (!needMedia) {
                        field.onChange([]);
                        return;
                    }
                    field.onChange(items.filter((item) => item.required).map((item) => item.value));
                }, [needMedia])

                return (
                    <FormItem>
                        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow mb-4">
                            <Checkbox
                                checked={needMedia}
                                onCheckedChange={(v) => {
                                    if (v === 'indeterminate') {
                                        setNeedMedia(undefined);
                                    } else {
                                        setNeedMedia(v);
                                    }
                                }}
                            />
                            <div className="space-y-1 leading-none">
                                <FormLabel>同时导出素材</FormLabel>
                                <FormDescription>
                                    {import.meta.env.EDGE ? "请确认Edge下载设置中的”每次下载都询问我该做些什么“选项处于关闭状态。否则，下载区域会弹出很多“打开”和“另存为”的选项按钮。" : "请确认Chrome下载设置中的”下载前询问每个文件的保存位置“选项未被选中。否则，会弹出很多“另存为”对话框。"}
                                </FormDescription>
                            </div>
                        </div>
                        {needMedia && <div className="mr-4 flex items-center space-x-4">
                            <FormLabel>媒体类型</FormLabel>
                            {items.map((item) => (
                                <FormField
                                    key={item.value}
                                    {...restProps}
                                    render={() => {
                                        return (
                                            <FormItem
                                                key={field.value}
                                                className="flex items-center space-x-2 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        disabled={item.required}
                                                        checked={field.value?.includes(item.value)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...field.value, item.value])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                        (value: string) => value !== item.value
                                                                    )
                                                                )
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal">{item.label}</FormLabel>
                                            </FormItem>
                                        )
                                    }}
                                />
                            ))}
                        </div>}
                        <FormMessage />
                    </FormItem>
                )
            }}
        />)
}