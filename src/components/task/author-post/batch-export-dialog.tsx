import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { throttle } from "lodash";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getAuthorLabel, getPostLabel, parseAuthorId } from "@/utils/platform";
import { useTask } from "@/components/task/useTask";
import { IdOrUrlFormField, idOrUrlTransform } from "@/components/form-field/id-or-url";
import { NeedMediaFormField } from "@/components/form-field/need-media";
import { TaskDialog } from "@/components/task";
import processor from "./processor";
import { LimitPerIdFormField } from "@/components/form-field/limit-per-id";

const formSchema = z.object({
    needMedia: z.boolean().default(false).optional(),
    limitPerId: z.coerce.number().min(1, "请输入需要导出的数量").max(99999, "导出数量过多"),
    authorIds: z.string().trim().min(1, "需要导出的数据不能为空").transform((arg, ctx) => idOrUrlTransform(arg, ctx, parseAuthorId)),
});

export type FormSchema = z.infer<typeof formSchema>;

const storageKey = "author-post-batch-export-limitPerId";

export function BatchAuthorPostExportDialog() {

    const task = useTask<FormSchema>(processor());

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            needMedia: false,
            authorIds: [],
            limitPerId: parseInt(localStorage.getItem(storageKey) ?? "10"),
        }
    });

    async function onSubmit(values: FormSchema) {
        localStorage.setItem(storageKey, values.limitPerId + '');
        task.start(values);
    }

    const postLabel = getPostLabel();
    const authorLabel = getAuthorLabel();

    return (<TaskDialog {...task}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>根据{authorLabel}链接批量导出{postLabel}数据</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <IdOrUrlFormField
                        control={form.control}
                        name="authorIds" idLabel={authorLabel} />
                    <LimitPerIdFormField
                        control={form.control}
                        name="limitPerId"
                        idLabel={authorLabel} dataLabel={postLabel} />
                    <NeedMediaFormField control={form.control} name="needMedia" />
                </form>
            </Form>
            <DialogFooter>
                <Button onClick={form.handleSubmit(throttle(onSubmit, 3000))} className="w-full">开始</Button>
            </DialogFooter>
        </DialogContent>
    </TaskDialog>);
}