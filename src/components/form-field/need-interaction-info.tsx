import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

export const NeedInteractionInfoFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
    label: string
    description: string
}) => {
    return (
        <FormField
            {...props}
            render={({ field }) => (
                <FormItem
                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>{props.label}</FormLabel>
                        <FormDescription>{props.description}</FormDescription>
                    </div>
                </FormItem>
            )}
        />)
}