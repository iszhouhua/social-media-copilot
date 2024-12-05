import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { RefinementCtx, z } from "zod";
import { compact, split } from "lodash";

const textCache = new Map<string, any>();
export const textareaArrayTransform = async <T=string> (arg: string, ctx: RefinementCtx, parseFunc: (text: string) => Promise<T>): Promise<Array<T>> => {
    const list = compact(split(arg, "\n"));
    const result: Array<T> = [];
    for (const item of list) {
        try {
            if(textCache.has(item)){
                result.push(textCache.get(item));
            }else{
                const data = await parseFunc(item);
                textCache.set(item, data);
                result.push(data);
            }
        } catch (error:any) {
            console.error(error);
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `${item}无效.${error?.message}`,
            });
        }
    }
    return result;
}

export const TextareaArrayFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
    label: string
    description?: string
}) => {
    const { label,description, ...restProps } = props;
    return (
        <FormField
            {...restProps}
            render={({ field }) => (<FormItem>
                <div className="flex items-center justify-between">
                    <FormLabel>{label}</FormLabel>
                    <FormDescription>{description}</FormDescription>
                </div>
                <FormControl>
                    <Textarea rows={10} placeholder={`请输入${label}，一行一个，可直接粘贴多行文本内容`} {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>)}
        />)
}