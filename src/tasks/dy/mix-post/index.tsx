import { MaterialTypesFormField } from "@/components/form-field/material-types";
import { Form } from "@/components/ui/form";
import { MixInfo } from "@/services/dy/aweme";
import { TaskDialog, TaskDialogContent } from "@/tasks/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Processor } from "./processor";

const formSchema = z.object({
    mixId: z.string(),
    mixName: z.string(),
    total: z.number(),
    materialTypes: z.string().array()
});

export type FormSchema = z.infer<typeof formSchema>;

export { Processor };

export default (props: {
    mixInfo?: MixInfo;
}) => {
    const { mixInfo } = props;

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            mixId: mixInfo?.mix_id,
            mixName: mixInfo?.mix_name,
            total: mixInfo?.statis?.updated_to_episode ?? 0,
            materialTypes: []
        }
    });

    return (<TaskDialog 
        handleSubmit={form.handleSubmit}
        Processor={Processor}>
        <TaskDialogContent
            title={<>导出合集<span className="text-red-400">{mixInfo?.mix_name}</span>的视频数据</>}
        >
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <MaterialTypesFormField control={form.control} name="materialTypes" defaultChecked={true} items={[
                        { label: "视频/图集", value: "video", required: true },
                        { label: "封面", value: "cover" },
                        { label: "音乐", value: "music" },
                    ]} />
                </form>
            </Form>
        </TaskDialogContent>
    </TaskDialog>);
}