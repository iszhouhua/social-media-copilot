import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

export const NeedMediaFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
    label?: string
}) => {
    const { label, ...restProps } = props;
    return (
        <FormField
            {...restProps}
            render={({ field }) => (<FormItem
                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                </FormControl>
                <div className="space-y-1 leading-none">
                    <FormLabel>{label||'同时导出图片和视频'}</FormLabel>
                    <FormDescription>
                        请确认Chrome下载设置中的”下载前询问每个文件的保存位置“选项未被选中。否则，会弹出很多“另存为”对话框。
                    </FormDescription>
                </div>
            </FormItem>)}
        />)
}