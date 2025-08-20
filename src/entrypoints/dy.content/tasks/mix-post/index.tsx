import { RequestIntervalFormField } from "@/components/form-field/request-interval";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Processor } from "./processor";


const formSchema = z.object({
    requestInterval: z.coerce.number().min(0, "请求间隔必须大于0秒")
});

export type FormSchema = z.infer<typeof formSchema>
    & {
        mixId: string
        mixName: string
        total: number
    };

export { Processor };

export type ExtendedProps = {
    mixInfo?: DouyinAPI.MixInfo;
}
const Component = (props: TaskDialogProps & ExtendedProps) => {
    const { mixInfo, setProcessor, ...restProps } = props;

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            requestInterval: 0
        }
    });

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        if (!mixInfo) {
            toast.error("合集信息获取失败");
            return;
        }
        setProcessor(new Processor({
            ...values,
            mixId: mixInfo?.mix_id,
            mixName: mixInfo?.mix_name,
            total: mixInfo?.statis?.updated_to_episode ?? 0
        }));
    }

    return (<Dialog {...restProps}>
        <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
                <DialogTitle>导出合集<span className="text-red-400">{mixInfo?.mix_name}</span>的视频数据</DialogTitle>
                <DialogDescription>当前合集共有<span className="text-red-400">{mixInfo?.statis?.updated_to_episode ?? '?'}</span>个视频</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6 py-4">
                    <RequestIntervalFormField control={form.control} name="requestInterval" />
                </form>
            </Form>
            <DialogFooter>
                <Button onClick={form.handleSubmit(handleSubmit)} className="w-full">开始</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>);
}



export default defineTaskDialog({
    name: "mix-post",
    children: Component,
    processor: Processor
});