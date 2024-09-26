import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { throttle } from "lodash";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getPostLabel, parsePostId } from "@/utils/platform";
import { useTask } from "@/components/task/useTask";
import { IdOrUrlFormField, idOrUrlTransform } from "@/components/form-field/id-or-url";
import { NeedMediaFormField } from "@/components/form-field/need-media";
import { TaskDialog } from "@/components/task";
import processor from "./processor";

export const formSchema = z.object({
    needMedia: z.boolean().default(false).optional(),
    postIds: z.string().trim().min(1, "需要导出的数据不能为空").transform((arg, ctx) => idOrUrlTransform(arg, ctx, parsePostId)),
});

export function BatchPostExportDialog() {

    const task = useTask<z.infer<typeof formSchema>>(processor());

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            needMedia: false,
            postIds: []
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        task.start(values);
    }

    const postLabel = getPostLabel();

    return (<TaskDialog {...task}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>批量导出{postLabel}数据</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <IdOrUrlFormField
                        control={form.control}
                        name="postIds" idLabel={postLabel} />
                    <NeedMediaFormField control={form.control} name="needMedia" />
                </form>
            </Form>
            <DialogFooter>
                <Button onClick={form.handleSubmit(throttle(onSubmit, 3000))} className="w-full">开始</Button>
            </DialogFooter>
        </DialogContent>
    </TaskDialog>);
}