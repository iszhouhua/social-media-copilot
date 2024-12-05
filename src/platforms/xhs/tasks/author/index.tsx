import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { throttle } from "lodash";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TaskDialog } from "@/components/task";
import { parseAuthorId } from './parse-author-id';
import { Processor } from './processor';
import { NeedInteractionInfoFormField } from "@/components/form-field/need-interaction-info";
import { TextareaArrayFormField, textareaArrayTransform } from "@/components/form-field/textarea-array";

export { parseAuthorId, Processor }

const formSchema = z.object({
    needInteractionInfo: z.boolean().default(false).optional(),
    authorIds: z.string().trim().min(1, "需要导出的数据不能为空").transform((arg, ctx) => textareaArrayTransform(arg, ctx, parseAuthorId)),
});

export type FormSchema = z.infer<typeof formSchema>;

export default () => {
    const taskRef = useRef<React.ComponentRef<typeof TaskDialog>>(null);

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            needInteractionInfo: false,
            authorIds: []
        }
    });

    return (<TaskDialog ref={taskRef}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>批量导出博主数据</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <TextareaArrayFormField
                        control={form.control}
                        name="authorIds" label="博主链接" />
                    <NeedInteractionInfoFormField
                        control={form.control}
                        name="needInteractionInfo"
                        label="同时导出近10条笔记的互动数据"
                        description="勾选后会导出每位博主近10条笔记的互动数据，包括点赞、评论、收藏等数据的中位数、平均数等。" />
                </form>
            </Form>
            <DialogFooter>
                <Button onClick={form.handleSubmit(throttle((values) => taskRef.current!.start(Processor, values), 3000))} className="w-full">开始</Button>
            </DialogFooter>
        </DialogContent>
    </TaskDialog>);
}
