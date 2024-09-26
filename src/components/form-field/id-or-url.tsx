import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { RefinementCtx, z } from "zod";
import { compact, split } from "lodash";

export const idOrUrlTransform = async (arg: string, ctx: RefinementCtx, parseFunc: (idOrUrl: string) => Promise<string>): Promise<string[]> => {
    const idOrUrls = compact(split(arg, "\n"));
    const ids: Array<string> = [];
    for (let idOrUrl of idOrUrls) {
        try {
            const id = await parseFunc(idOrUrl);
            ids.push(id);
        } catch (error) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `${idOrUrl}不是有效的ID或链接`,
            });
        }
    }
    return ids;
}

export const IdOrUrlFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
    idLabel: string
}) => {
    const { idLabel, ...restProps } = props;
    return (
        <FormField
            {...restProps}
            render={({ field }) => (<FormItem>
                <div className="flex items-center justify-between">
                    <FormLabel>{idLabel}ID或链接</FormLabel>
                    <FormDescription>支持输入{idLabel}ID或链接，每行一个，可使用短链</FormDescription>
                </div>
                <FormControl>
                    <Textarea rows={10} placeholder={`请输入${idLabel}ID或链接，一行一个`} {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>)}
        />)
}