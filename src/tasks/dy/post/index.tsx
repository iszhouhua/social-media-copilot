import { MaterialTypesFormField } from "@/components/form-field/material-types";
import { UrlArrayFormField, urlArrayTransform } from "@/components/form-field/url-array";
import { Form } from "@/components/ui/form";
import { TaskDialog, TaskDialogContent } from "@/tasks/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parseUrl } from "./parse-url";
import { Processor } from "./processor";

const formSchema = z.object({
    materialTypes: z.string().array(),
    urls: z.array(z.string().trim()).nonempty().transform((arg, ctx) => urlArrayTransform(arg, ctx, parseUrl)),
});

export { parseUrl, Processor };

export type FormSchema = z.infer<typeof formSchema>;

export default () => {

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            materialTypes: [],
            urls: []
        }
    });

    return (<TaskDialog handleSubmit={form.handleSubmit} Processor={Processor}>
        <TaskDialogContent title="批量导出视频数据">
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <UrlArrayFormField
                        control={form.control}
                        name="urls" label="视频链接" />

                    <MaterialTypesFormField control={form.control} name="materialTypes" items={[
                        { label: "视频/图集", value: "video", required: true },
                        { label: "封面", value: "cover" },
                        { label: "音乐", value: "music" },
                    ]} />
                </form>
            </Form>
        </TaskDialogContent>
    </TaskDialog>);
}