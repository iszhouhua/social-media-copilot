import { NeedInteractionInfoFormField } from "@/components/form-field/need-interaction-info";
import { UrlArrayFormField, urlArrayTransform } from "@/components/form-field/url-array";
import { Form } from "@/components/ui/form";
import { TaskDialog, TaskDialogContent } from "@/tasks/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parseUrl } from './parse-url';
import { Processor } from './processor';

export { parseUrl, Processor };

const formSchema = z.object({
    needInteractionInfo: z.boolean().default(false).optional(),
    urls: z.array(z.string().trim()).nonempty().transform((arg, ctx) => urlArrayTransform(arg, ctx, parseUrl)),
});

export type FormSchema = z.infer<typeof formSchema>;

export default () => {

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            needInteractionInfo: false,
            urls: []
        }
    });

    return (<TaskDialog handleSubmit={form.handleSubmit} Processor={Processor}>
        <TaskDialogContent title="批量导出博主数据">
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <UrlArrayFormField
                        control={form.control}
                        name="urls" label="博主链接" />
                    <NeedInteractionInfoFormField
                        control={form.control}
                        name="needInteractionInfo"
                        label="同时导出近10条笔记的互动数据"
                        description="勾选后会导出每位博主近10条笔记的互动数据，包括点赞、评论、收藏等数据的中位数、平均数等。" />
                </form>
            </Form>
        </TaskDialogContent>
    </TaskDialog>);
}
