import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { throttle } from "lodash";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TaskDialog } from "@/components/task";
import { Processor } from "./processor";
import { parsePostId } from "./parse-post-id";
import { TextareaArrayFormField, textareaArrayTransform } from "@/components/form-field/textarea-array";
import { MaterialTypesFormField } from "@/components/form-field/material-types";

const formSchema = z.object({
    materialTypes: z.string().array(),
    postIds: z.string().trim().min(1, "需要导出的数据不能为空").transform((arg, ctx) => textareaArrayTransform(arg, ctx, parsePostId)),
});

export { parsePostId, Processor }

export type FormSchema = z.infer<typeof formSchema>;

export default () => {

    const taskRef = useRef<React.ComponentRef<typeof TaskDialog>>(null);

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            materialTypes: [],
            postIds: []
        }
    });

    return (<TaskDialog ref={taskRef}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>批量导出视频数据</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <TextareaArrayFormField
                        control={form.control}
                        name="postIds" label="视频链接" description="支持输入视频链接，可使用App分享链接"/>
                        
                    <MaterialTypesFormField control={form.control} name="materialTypes" items={[
                        { label: "视频/图集", value: "video", required: true },
                        { label: "封面", value: "cover" },
                        { label: "音乐", value: "music" },
                    ]} />
                </form>
            </Form>
            <DialogFooter>
                <Button onClick={form.handleSubmit(throttle((values) => taskRef.current!.start(Processor, values), 3000))} className="w-full">开始</Button>
            </DialogFooter>
        </DialogContent>
    </TaskDialog>);
}