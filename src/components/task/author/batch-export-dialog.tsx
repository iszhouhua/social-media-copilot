import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { throttle } from "lodash";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getAuthorLabel, getPostLabel, parseAuthorId } from "@/utils/platform";
import { useTask } from "@/components/task/useTask";
import { IdOrUrlFormField, idOrUrlTransform } from "@/components/form-field/id-or-url";
import { TaskDialog } from "@/components/task";
import processor from "./processor";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    needInteractionInfo: z.boolean().default(false).optional(),
    authorIds: z.string().trim().min(1, "需要导出的数据不能为空").transform((arg, ctx) => idOrUrlTransform(arg, ctx, parseAuthorId)),
});

export type FormSchema = z.infer<typeof formSchema>;

export function BatchAuthorExportDialog() {

    const task = useTask<FormSchema>(processor());

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            needInteractionInfo: false,
            authorIds: []
        }
    });

    const authorLabel = getAuthorLabel();
    const postLabel = getPostLabel();

    return (<TaskDialog {...task}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>批量导出{authorLabel}数据</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <IdOrUrlFormField
                        control={form.control}
                        name="authorIds" idLabel={authorLabel} />
                    <FormField
                        control={form.control}
                        name="needInteractionInfo"
                        render={({ field }) => (<FormItem
                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>同时导出近10个{postLabel}的互动数据</FormLabel>
                                <FormDescription>
                                    勾选后会导出每位{authorLabel}近10个{postLabel}的互动数据，包括点赞、评论、收藏等数据的中位数、平均数等。
                                    同时也会额外采集{postLabel}数据，建议仅在需要用到时勾选。
                                </FormDescription>
                            </div>
                        </FormItem>)} />
                </form>
            </Form>
            <DialogFooter>
                <Button onClick={form.handleSubmit(throttle((values) => task.start(values), 3000))} className="w-full">开始</Button>
            </DialogFooter>
        </DialogContent>
    </TaskDialog>);
}