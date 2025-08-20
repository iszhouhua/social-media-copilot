import { LimitPerIdFormField } from "@/components/form-field/limit-per-id";
import { RequestIntervalFormField } from "@/components/form-field/request-interval";
import { UrlArrayFormField, urlArrayTransform } from "@/components/form-field/url-array";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parseUrl } from "../post";
import { Processor } from "./processor";

const formSchema = z.object({
    limitPerId: z.coerce.number().min(1, "请输入需要导出的评论数量"),
    urls: z.array(z.string().trim()).nonempty().transform((arg, ctx) => urlArrayTransform(arg, ctx, parseUrl)),
    requestInterval: z.coerce.number().min(0, "请求间隔必须大于0秒")
});

export type FormSchema = z.infer<typeof formSchema>;

export { Processor };

export type ExtendedProps = {
    post?: {
        postId: string
        commentCount: number
        title: string
        url: string
    }
}

const Component = (props: TaskDialogProps & ExtendedProps) => {
    const { post, setProcessor, ...restProps } = props;

    const form = useForm<any, any, FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            limitPerId: post?.commentCount || 1000,
            urls: post ? [post.url] : [],
            requestInterval: 0
        }
    });

    const handleSubmit = (values: FormSchema) => {
        setProcessor(new Processor(values));
    }

    return (<Dialog {...restProps}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>{post ? <>导出视频<span className="text-red-400">{(post.title?.length > 20) ? post.title.substring(0, 20) + '...' : post.title}</span>的评论数据</> : <>根据视频链接批量导出视频评论</>}</DialogTitle>
            </DialogHeader>
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
                    <RequestIntervalFormField control={form.control} name="requestInterval"/>
                </form>
            </Form>
            <DialogFooter>
                <Button onClick={form.handleSubmit(handleSubmit)} className="w-full">开始</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>);
}

export default defineTaskDialog({
    name: "post-comment",
    children: Component,
    processor: Processor
});