import { LimitPerIdFormField } from "@/components/form-field/limit-per-id";
import { NeedMediaFormField } from "@/components/form-field/need-media";
import { UrlArrayFormField, urlArrayTransform } from "@/components/form-field/url-array";
import { Form } from "@/components/ui/form";
import { TaskDialog, TaskDialogContent } from "@/tasks/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parseUrl } from "../author";
import { Processor } from "./processor";

const formSchema = z.object({
    needMedia: z.boolean().default(false).optional(),
    limitPerId: z.coerce.number().min(1, "请输入需要导出的数量"),
    urls: z.array(z.string().trim()).nonempty().transform((arg, ctx) => urlArrayTransform(arg, ctx, parseUrl)),
});

export type FormSchema = z.infer<typeof formSchema>;

export { Processor };

export default (props: {
    author?: {
        id: string;
        name: string;
        url: string;
    }
}) => {
    const { author } = props;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            needMedia: false,
            urls: author ? [author.url] : [],
            limitPerId: 10,
        }
    });

    return (<TaskDialog handleSubmit={form.handleSubmit} Processor={Processor}>
        <TaskDialogContent title={author ? <>导出<span className="text-red-400">{author.name}</span>的笔记数据</> : <>根据博主链接批量导出笔记数据</>}>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    {!author && <UrlArrayFormField
                        control={form.control}
                        name="urls" label="博主链接" />}
                    <LimitPerIdFormField
                        control={form.control}
                        name="limitPerId"
                        description={author ? undefined : '每位博主需要导出的笔记数量'} />
                    <NeedMediaFormField control={form.control} name="needMedia" />
                </form>
            </Form>
        </TaskDialogContent></TaskDialog>);
}