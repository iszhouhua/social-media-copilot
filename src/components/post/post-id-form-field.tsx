import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import React from "react";
import {getPostLabel, parsePostId} from "@/utils/platform";
import {ControllerProps, FieldPath, FieldValues} from "react-hook-form";
import {Textarea} from "@/components/ui/textarea";
import {RefinementCtx, z} from "zod";
import {compact, split} from "lodash";

export const postIdTransform = async (arg: string, ctx: RefinementCtx): Promise<string[]> => {
    const idOrUrls = compact(split(arg, "\n"));
    const ids: Array<string> = [];
    for (let idOrUrl of idOrUrls) {
        try {
            const id = await parsePostId(idOrUrl);
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

export const PostIdFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: Omit<ControllerProps<TFieldValues, TName>, "render">) => {

    const postLabel = getPostLabel();

    return (
        <FormField
            {...props}
            render={({field}) => (<FormItem>
                <div className="flex items-center justify-between">
                    <FormLabel>{postLabel}ID或链接</FormLabel>
                    <FormDescription>支持输入{postLabel}ID或链接，每行一个</FormDescription>
                </div>
                <FormControl>
                    <Textarea rows={10} placeholder="请输入ID或链接，一行一个" {...field} />
                </FormControl>
                <FormMessage/>
            </FormItem>)}
        />)
}