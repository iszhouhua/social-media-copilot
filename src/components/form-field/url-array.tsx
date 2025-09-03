import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { join, split } from "lodash";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { RefinementCtx, z } from "zod";

const textCache = new Map<string, any>();
export const urlArrayTransform = async <T = string>(arg: string[], ctx: RefinementCtx, parseFunc: (url: URL) => Promise<T>): Promise<Array<T>> => {
    try {
        const result: Array<T> = [];
        for (const item of arg) {
            if (!item) continue;
            const urlRegex = /https?:\/\/[^\s，]+/g;
            const matches = item.match(urlRegex);
            if (!matches) {
                throw new Error(item + '无效');
            }
            for (const urlStr of matches) {
                if (textCache.has(urlStr)) {
                    result.push(textCache.get(urlStr));
                } else {
                    const data = await parseFunc(new URL(urlStr));
                    textCache.set(urlStr, data);
                    result.push(data);
                }
            }
        }
        return result;
    } catch (error: any) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: error?.message,
        });
    }
    return z.NEVER;
}

export const UrlArrayFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
    label: string
    description?: string
    separator?: string
}) => {
    const { label, description, separator = "\n", ...restProps } = props;

    return (
        <FormField
            rules={{ validate: (v) => v.length > 0 }}
            {...restProps}
            render={({ field }) => {
                const { value, onChange, ...fieldProps } = field;
                return (<FormItem>
                    <div className="flex items-center justify-between">
                        <FormLabel>{label}</FormLabel>
                        <FormDescription>{description ?? `请输入${label}，一行一个`}</FormDescription>
                    </div>
                    <FormControl>
                        <Textarea rows={10} placeholder={`请输入${label}，一行一个，可直接粘贴多行文本内容`}
                            value={join(value || [], separator)}
                            onChange={(e) => onChange(split(e.target.value, separator))}
                            {...fieldProps} />
                    </FormControl>
                    <FormMessage />
                </FormItem>)
            }}
        />)
}