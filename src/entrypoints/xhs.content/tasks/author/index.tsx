import { RequestIntervalFormField } from "@/components/form-field/request-interval";
import { UrlArrayFormField, urlArrayTransform } from "@/components/form-field/url-array";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parseAuthorUrl } from "../../utils/parse-url";
import { Processor } from './processor';

const formSchema = z.object({
    urls: z.array(z.string().trim()).nonempty().transform((arg, ctx) => urlArrayTransform(arg, ctx, parseAuthorUrl)),
    requestInterval: z.coerce.number().min(0, "请求间隔必须大于0秒")
});

export type FormSchema = z.infer<typeof formSchema>;


const Component = (props: TaskDialogProps) => {
    const { setProcessor, ...restProps } = props;

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            urls: [],
            requestInterval: 0
        }
    });
    const handleSubmit = (values: FormSchema) => {
        setProcessor(new Processor(values));
    }

    return (<Dialog {...restProps}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>批量导出博主信息</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <UrlArrayFormField
                        control={form.control}
                        name="urls" label="博主链接" />
                    <RequestIntervalFormField name="requestInterval" control={form.control}/>
                </form>
            </Form>
            <DialogFooter>
                <Button onClick={form.handleSubmit(handleSubmit)} className="w-full">开始</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>);
}


export default defineTaskDialog({
    name: "author",
    children: Component,
    processor: Processor
});