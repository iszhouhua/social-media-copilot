import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { throttle } from "lodash";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NeedMediaFormField } from "@/components/form-field/need-media";
import { TaskDialog } from "@/components/task";
import { Processor } from "./processor";
import { parsePostId, parsePostParam } from "./parse-post-id";
import { TextareaArrayFormField, textareaArrayTransform } from "@/components/form-field/textarea-array";

const formSchema = z.object({
    needMedia: z.boolean().default(false).optional(),
    postParams: z.string().trim().min(1, "需要导出的数据不能为空").transform((arg, ctx) => textareaArrayTransform(arg, ctx, parsePostParam)),
});

export { parsePostId, Processor }

export type FormSchema = z.infer<typeof formSchema>;

export default (props: {
    urls?: string[]
}) => {

    const taskRef = useRef<React.ComponentRef<typeof TaskDialog>>(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            needMedia: false,
            postParams: props?.urls?.join('\n') || ''
        }
    });

    return (<TaskDialog ref={taskRef}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>批量导出笔记数据</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <TextareaArrayFormField
                        control={form.control}
                        name="postParams" label="笔记链接" description="请输入完整的笔记链接，可使用App分享链接" />
                    <NeedMediaFormField control={form.control} name="needMedia" />
                </form>
            </Form>
            <DialogFooter>
                <Button onClick={form.handleSubmit(throttle((values) => taskRef.current!.start(Processor, values), 3000))} className="w-full">开始</Button>
            </DialogFooter>
        </DialogContent>
    </TaskDialog>);
}