import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { Input } from "../ui/input";

export const LimitPerIdFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
    idLabel: string
    dataLabel: string
}) => {
    const { idLabel, dataLabel, ...restProps } = props;
    return (
        <FormField
            {...restProps}
            render={({ field }) => (
                <FormItem>
                    <div className="flex items-center justify-between">
                        <FormLabel>导出数量</FormLabel>
                        <FormDescription>每个{idLabel}需要导出的{dataLabel}数</FormDescription>
                    </div>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>)}
        />)
}