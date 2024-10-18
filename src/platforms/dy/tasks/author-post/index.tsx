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
import { LimitPerIdFormField } from "@/components/form-field/limit-per-id";
import { parseAuthorId } from "../author";
import { TextareaArrayFormField,textareaArrayTransform } from "@/components/form-field/textarea-array";

const formSchema = z.object({
    needMedia: z.boolean().default(false).optional(),
    limitPerId: z.coerce.number().min(1, "请输入需要导出的数量"),
    authorIds: z.string().array().or(z.string().trim().min(1, "需要导出的数据不能为空").transform((arg, ctx) => textareaArrayTransform(arg, ctx, parseAuthorId))),
});

export type FormSchema = z.infer<typeof formSchema>;

export { Processor }

const storageKey = "author-post-batch-export-limitPerId";

export default (props: {
    author?: {
        authorId: string
        authorName: string
        postCount: number
    }
}) => {
    const { author } = props;
    const taskRef = useRef<React.ComponentRef<typeof TaskDialog>>(null);

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            needMedia: false,
            authorIds: author ? [author.authorId] : [],
            limitPerId: author?.postCount || parseInt(localStorage.getItem(storageKey) ?? "10"),
        }
    });

    function onSubmit(values: FormSchema) {
        if (!author) {
            localStorage.setItem(storageKey, values.limitPerId + '');
        }
        taskRef.current!.start(Processor, values);
    }

    return (<TaskDialog ref={taskRef}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>
                    {author ? <>导出<span className="text-red-400">{author.authorName}</span>的视频数据</> : <>根据达人ID或链接批量导出视频数据</>}
                </DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    {!author && <TextareaArrayFormField
                        control={form.control}
                        name="authorIds" label="达人ID或链接" description="支持输入达人ID或链接，可使用App分享链接" />}
                    <LimitPerIdFormField
                        control={form.control}
                        name="limitPerId"
                        description={author ? `当前达人共有${author.postCount}个作品` : '每位达人需要导出的视频数量'} />
                    <NeedMediaFormField control={form.control} name="needMedia" />
                </form>
            </Form>
            <DialogFooter>
                <Button onClick={form.handleSubmit(throttle(onSubmit, 3000))} className="w-full">开始</Button>
            </DialogFooter>
        </DialogContent>
    </TaskDialog>);
}