import { LimitPerIdFormField } from "@/components/form-field/limit-per-id";
import { UrlArrayFormField, urlArrayTransform } from "@/components/form-field/url-array";
import {
    Form
} from "@/components/ui/form";
import { TaskDialog, TaskDialogContent } from "@/tasks/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parseUrl } from "../post";
import { Processor } from "./processor";

const formSchema = z.object({
    limitPerId: z.coerce.number().min(1, "请输入需要导出的评论数量"),
    urls: z.array(z.string().trim()).nonempty().transform((arg, ctx) => urlArrayTransform(arg, ctx, parseUrl)),
});

export type FormSchema = z.infer<typeof formSchema>;

export { Processor };

export default (props: {
    post?: {
        postId: string
        commentCount: number
        title: string
        url:string
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

    return (<TaskDialog handleSubmit={form.handleSubmit} Processor={Processor}>
        <TaskDialogContent title={post ? <>导出视频<span className="text-red-400">{(post.title?.length > 20) ? post.title.substring(0, 20) + '...' : post.title}</span>的评论数据</> : <>根据视频链接批量导出视频评论</>}>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    {!post && <UrlArrayFormField
                        control={form.control}
                        name="urls"
                        label="视频链接"
                    />}
                    <LimitPerIdFormField
                        control={form.control}
                        name="limitPerId"
                        description={post ? `当前视频共有${post.commentCount}条评论` : '每条视频需要导出的评论数量'} />
                </form>
            </Form>
        </TaskDialogContent>
    </TaskDialog>
    );
}