import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const RequestIntervalFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: Omit<ControllerProps<TFieldValues, TName>, "render">) => {
    return (
        <FormField {...props}
            render={({ field }) => {
                return (<FormItem>
                    <div className="flex items-center justify-between">
                        <FormLabel>请求间隔</FormLabel>
                        <FormDescription>
                            两次接口请求之间的间隔时长，值越大越不容易触发风控
                        </FormDescription>
                    </div>
                    <div className="flex items-center">
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <Label className="px-2">秒</Label>
                    </div>
                    <FormMessage />
                </FormItem>);
            }}
        />)
}