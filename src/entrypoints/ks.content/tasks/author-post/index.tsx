import { LimitPerIdFormField } from "@/components/form-field/limit-per-id";
import { RequestIntervalFormField } from "@/components/form-field/request-interval";
import { UrlArrayFormField, urlArrayTransform } from "@/components/form-field/url-array";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parseUrl } from "../author/parse-url";
import { Processor } from "./processor";

const formSchema = z.object({
    limitPerId: z.coerce.number().min(1, "请输入需要导出的数量"),
    urls: z.array(z.string().trim()).nonempty().transform((arg, ctx) => urlArrayTransform(arg, ctx, parseUrl)),
    requestInterval: z.coerce.number().min(0, "请求间隔必须大于0秒")
});

export type FormSchema = z.infer<typeof formSchema>;

export { Processor };

export type ExtendedProps = {
    author?: {
        authorId: string
        authorName: string
        postCount: number
        url: string
    }
}

const Component = (props: TaskDialogProps & ExtendedProps) => {
    const { author, setProcessor, ...restProps } = props;

    const form = useForm<any, any, FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            urls: author ? [author.url] : [],
            limitPerId: author?.postCount || 10,
            requestInterval: 0
        },
    });

    const handleSubmit = (values: FormSchema) => {
        setProcessor(new Processor(values));
    }

    return (<Dialog {...restProps}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>{author ? <>导出<span className="text-red-400">{author.authorName}</span>的视频数据</> : <>根据达人链接批量导出视频数据</>}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    {!author && <UrlArrayFormField
                        control={form.control}
                        name="urls" label="达人链接" />}
                    <LimitPerIdFormField
                        control={form.control}
                        name="limitPerId"
                        description={author ? `当前达人共有${author.postCount}个作品` : '每位达人需要导出的视频数量'} />
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
    name: "author-post",
    children: Component,
    processor: Processor
});