import { LimitPerIdFormField } from "@/components/form-field/limit-per-id";
import { MaterialTypesFormField } from "@/components/form-field/material-types";
import { UrlArrayFormField, urlArrayTransform } from "@/components/form-field/url-array";
import { Form } from "@/components/ui/form";
import { TaskDialog, TaskDialogContent } from "@/tasks/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parseUrl } from "../author/parse-url";
import { Processor } from "./processor";

const formSchema = z.object({
    limitPerId: z.coerce.number().min(1, "请输入需要导出的数量"),
    urls: z.array(z.string().trim()).nonempty().transform((arg, ctx) => urlArrayTransform(arg, ctx, parseUrl)),
    materialTypes: z.string().array()
});

export type FormSchema = z.infer<typeof formSchema>;

export { Processor };

export default (props: {
    author?: {
        authorId: string
        authorName: string
        postCount: number
        url: string
    }
}) => {
    const { author } = props;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            urls: author ? [author.url] : [],
            limitPerId: 10,
            materialTypes: []
        }
    });

    return (<TaskDialog handleSubmit={form.handleSubmit} Processor={Processor}>
        <TaskDialogContent title={author ? <>导出<span className="text-red-400">{author.authorName}</span>的视频数据</> : <>根据达人链接批量导出视频数据</>}>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    {!author && <UrlArrayFormField
                        control={form.control}
                        name="urls" label="达人链接" />}
                    <LimitPerIdFormField
                        control={form.control}
                        name="limitPerId"
                        description={author ? `当前达人共有${author.postCount}个作品` : '每位达人需要导出的视频数量'} />
                    <MaterialTypesFormField control={form.control} name="materialTypes" items={[
                        { label: "视频/图集", value: "video", required: true },
                        { label: "封面", value: "cover" },
                        { label: "音乐", value: "music" },
                    ]} />
                </form>
            </Form>
        </TaskDialogContent>
    </TaskDialog>);
}