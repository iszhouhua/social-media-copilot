import { TaskProcessor } from "@/utils/task";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

const formSchema = z.object({
    mediaTypes: z.string().array().min(1, '请至少选择一项需要下载的媒体类型')
});

export type FormSchema = z.infer<typeof formSchema>;

export type MediaOption = {
    value: string;
    label: string;
};

export function DownloadMedia(props: {
    children?: React.ReactNode;
    processor: TaskProcessor;
}) {
    const { processor, children } = props;
    const [openDialog, setOpenDialog] = useState(false);

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: { mediaTypes: [] }
    });

    const handleSubmit = async (values: FormSchema) => {
        const options = processor.getMediaDownloadOptions(values.mediaTypes);
        if (!options?.length) {
            toast.warning("相关内容为空，无法下载");
            return;
        }
        for (const option of options) {
            await sendMessage('download', { filename: option.filename, url: option.url });
        }
        toast.success("下载成功");
        setOpenDialog(false);
    }


    return <>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-[400px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>批量下载媒体文件</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-8">
                        <FormField
                            control={form.control}
                            name="mediaTypes"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <div className="mb-4">
                                            <FormLabel className="text-base">选择需要下载的媒体类型</FormLabel>
                                            <FormDescription>
                                                请确认Chrome下载设置中的”下载前询问每个文件的保存位置“选项未被选中。否则，会弹出很多“另存为”对话框。
                                            </FormDescription>
                                        </div>
                                        {processor.mediaOptions.map((item) => (
                                            <FormField
                                                key={item.value}
                                                control={form.control}
                                                name="mediaTypes"
                                                render={() => {
                                                    return (
                                                        <FormItem
                                                            key={item.value}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item.value)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, item.value])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== item.value
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-sm font-normal">{item.label}</FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <Button onClick={form.handleSubmit(handleSubmit)} className="w-full">开始下载</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>;
}