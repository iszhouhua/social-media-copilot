import { NeedMediaFormField } from "@/components/form-field/need-media";
import { UrlArrayFormField, urlArrayTransform } from "@/components/form-field/url-array";
import { Form } from "@/components/ui/form";
import { TaskDialog, TaskDialogContent } from "@/tasks/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parseUrl } from "./parse-url";
import { Processor } from "./processor";

const formSchema = z.object({
    needMedia: z.boolean().default(false).optional(),
    urls: z.array(z.string().trim()).nonempty().transform((arg, ctx) => urlArrayTransform(arg, ctx, parseUrl)),
});

export { parseUrl, Processor };

export type FormSchema = z.infer<typeof formSchema>;

export default () => {

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            needMedia: false,
            urls: []
        }
    });

    return (<TaskDialog handleSubmit={form.handleSubmit} Processor={Processor}>
        <TaskDialogContent title="批量导出笔记数据">
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <UrlArrayFormField
                        control={form.control}
                        name="urls" label="笔记链接" />
                    <NeedMediaFormField control={form.control} name="needMedia" />
                </form>
            </Form>
        </TaskDialogContent>
    </TaskDialog>);
}