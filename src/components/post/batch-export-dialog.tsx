import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { throttle } from "lodash";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { getPostLabel } from "@/utils/platform";
import { useTask } from "@/components/task/useTask";
import { PostIdFormField, postIdTransform } from "./post-id-form-field";
import { TaskDialog } from "@/components/task";
import processors from "./processor";

export const formSchema = z.object({
    needMedia: z.boolean().default(false).optional(),
    postIds: z.string().trim().min(1, "需要导出的数据不能为空").transform(postIdTransform),
});

export function BatchPostExportDialog() {

    const task = useTask<z.infer<typeof formSchema>>(processors[window.platform]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            needMedia: false,
            postIds: []
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        task.start(values);
    }

    const postLabel = getPostLabel();

    return (<TaskDialog {...task}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>批量导出{postLabel}数据</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <PostIdFormField
                        control={form.control}
                        name="postIds"
                    />
                    <FormField
                        control={form.control}
                        name="needMedia"
                        render={({ field }) => (
                            <FormItem
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>同时导出图片和视频</FormLabel>
                                    <FormDescription>
                                        {import.meta.env.EDGE ? "请确认Edge下载设置中的”每次下载都询问我该做些什么“选项处于关闭状态。否则，下载区域会弹出很多“打开”和“另存为”的选项按钮。" : "请确认Chrome下载设置中的”下载前询问每个文件的保存位置“选项未被选中。否则，会弹出很多“另存为”对话框。"}
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
            <DialogFooter>
                <Button onClick={form.handleSubmit(throttle(onSubmit, 3000))} className="w-full">开始</Button>
            </DialogFooter>
        </DialogContent>
    </TaskDialog>);
}