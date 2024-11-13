import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { throttle } from "lodash";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TaskDialog } from "@/components/task";
import { Processor } from "./processor";
import { MaterialTypesFormField } from "@/components/form-field/material-types";
import { MixInfo } from "../../http/aweme";

const formSchema = z.object({
    mixId: z.string(),
    mixName: z.string(),
    total: z.number(),
    materialTypes: z.string().array()
});

export type FormSchema = z.infer<typeof formSchema>;

export { Processor }

export default (props: {
    mixInfo: MixInfo;
}) => {
    const { mixInfo } = props;
    const taskRef = useRef<React.ComponentRef<typeof TaskDialog>>(null);

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            mixId: mixInfo.mix_id,
            mixName: mixInfo.mix_name,
            total: mixInfo.statis?.updated_to_episode ?? 0,
            materialTypes: []
        }
    });

    function onSubmit(values: FormSchema) {
        taskRef.current!.start(Processor, values);
    }

    return (<TaskDialog ref={taskRef}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>
                    导出合集<span className="text-red-400">{mixInfo.mix_name}</span>的视频数据
                </DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <MaterialTypesFormField control={form.control} name="materialTypes" defaultChecked={true} items={[
                        { label: "视频/图集", value: "video", required: true },
                        { label: "封面", value: "cover" },
                        { label: "音乐", value: "music" },
                    ]} />
                </form>
            </Form>
            <DialogFooter>
                <Button onClick={form.handleSubmit(throttle(onSubmit, 3000))} className="w-full">开始</Button>
            </DialogFooter>
        </DialogContent>
    </TaskDialog>);
}