import { LimitPerIdFormField } from "@/components/form-field/limit-per-id";
import { RequestIntervalFormField } from "@/components/form-field/request-interval";
import { UrlArrayFormField, urlArrayTransform } from "@/components/form-field/url-array";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parsePostUrl } from "../../utils/parse-url";
import { Processor } from "./processor";

const formSchema = z.object({
    limitPerId: z.coerce.number().min(1),
    urls: z.array(z.string().trim()).nonempty().transform((arg, ctx) => urlArrayTransform(arg, ctx, parsePostUrl)),
    requestInterval: z.coerce.number().min(0, "请求间隔必须大于0秒")
});

export type FormSchema = z.infer<typeof formSchema>;

export { Processor };

export type ExtendedProps = {
    post?: {
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
                <DialogTitle>{post ? <>导出笔记<span className="text-red-400">{post.title}</span>的评论数据</> : <>根据笔记链接批量导出笔记评论</>}</DialogTitle>
            </DialogHeader>
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