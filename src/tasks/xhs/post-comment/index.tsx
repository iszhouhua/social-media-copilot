import { LimitPerIdFormField } from "@/components/form-field/limit-per-id";
import { UrlArrayFormField, urlArrayTransform } from "@/components/form-field/url-array";
import { Form } from "@/components/ui/form";
import { TaskDialog, TaskDialogContent } from "@/tasks/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parseUrl } from "../post";
import { Processor } from "./processor";

const formSchema = z.object({
    limitPerId: z.coerce.number().min(1),
    urls: z.array(z.string().trim()).nonempty().transform((arg, ctx) => urlArrayTransform(arg, ctx, parseUrl)),
});

export type FormSchema = z.infer<typeof formSchema>;

export { Processor };


export default (props: {
    post?: {
        commentCount: number
        title: string
        url: string
    }
}) => {
    const { post } = props;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            limitPerId: Math.min(post?.commentCount || 100, 1000),
            urls: post ? [post.url] : []
        }
    });

    return (
        <TaskDialog handleSubmit={form.handleSubmit} Processor={Processor}>
            <TaskDialogContent title={post ? <>导出笔记<span className="text-red-400">{post.title}</span>的评论数据</> : <>根据笔记链接批量导出笔记评论</>}>
                <Form {...form}>
                    <form className="space-y-6 py-4">
                        {!post && <UrlArrayFormField
                            control={form.control}
                            name="urls"
                            label="笔记链接"
                        />}
                        <LimitPerIdFormField
                            control={form.control}
                            name="limitPerId"
                            description={post ? `当前笔记共有${post.commentCount}条评论` : '每条笔记需要导出的评论数量'} />
                    </form>
                </Form>
            </TaskDialogContent>
        </TaskDialog>
    );
}