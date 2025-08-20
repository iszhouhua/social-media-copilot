import { LimitPerIdFormField } from "@/components/form-field/limit-per-id";
import { RequestIntervalFormField } from "@/components/form-field/request-interval";
import { UrlArrayFormField, urlArrayTransform } from "@/components/form-field/url-array";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parseAuthorUrl } from "../../utils/parse-url";
import { Processor } from "./processor";

const formSchema = z.object({
    limitPerId: z.coerce.number().min(1, "请输入需要导出的数量"),
    authorUrls: z.array(z.string().trim()).nonempty().transform((arg, ctx) => urlArrayTransform(arg, ctx, parseAuthorUrl)),
    requestInterval: z.coerce.number().min(0, "请求间隔必须大于0秒")
});

export type FormSchema = z.infer<typeof formSchema>;

export { Processor };

export type ExtendedProps = {
    author?: {
        id: string;
        name: string;
        url: string;
    }
}

const Component = (props: TaskDialogProps & ExtendedProps) => {
    const { author, setProcessor, ...restProps } = props;

    const form = useForm<any, any, FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            authorUrls: author ? [author.url] : [],
            limitPerId: 100,
            requestInterval: 0
        }
    });

    const handleSubmit = (values: FormSchema) => {
        setProcessor(new Processor({ ...values, urls: [] }));
    }

    return (<Dialog {...restProps}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>{author ? <>导出<span className="text-red-400">{author.name}</span>的笔记数据</> : <>根据博主链接批量导出笔记数据</>}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    {!author && <UrlArrayFormField
                        control={form.control}
                        name="authorUrls" label="博主链接" />}
                    <LimitPerIdFormField
                        control={form.control}
                        name="limitPerId"
                        description={author ? undefined : '每位博主需要导出的笔记数量'} />
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