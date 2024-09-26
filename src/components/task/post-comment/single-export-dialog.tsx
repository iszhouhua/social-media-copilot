import { Button } from "@/components/ui/button.tsx";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { throttle } from "lodash";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React from "react";
import { useTask } from "@/components/task/useTask";
import { FormSchema } from "./batch-export-dialog";
import processor from "./processor";
import { TaskDialog } from "@/components/task";

export function CommentExportDialog(props: {
  maxValue: number
  postId: string
  onClose: () => void
}) {
  const { maxValue, postId, onClose } = props;
  const task = useTask<FormSchema>(processor());

  const formSchema = z.object({
    count: z.coerce.number().min(1, "请输入需要导出的评论数量").max(maxValue, '导出数量不得超过评论总数')
  });

  React.useEffect(() => {
    form.setValue("count", maxValue);
  }, [maxValue]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { count: maxValue }
  });


  async function handlerSubmit({ count }: z.infer<typeof formSchema>) {
    task.start({ postIds: [postId], limitPerId: count });
  }

  return (<TaskDialog onClose={onClose} {...task}>
    <DialogContent className="max-w-[425px]" aria-describedby={undefined}>
      <DialogHeader>
        <DialogTitle>导出评论数据</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form className="space-y-6 py-4">
          <FormField
            control={form.control}
            name="count"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <div className="w-20">
                  <FormLabel>导出数量</FormLabel>
                </div>
                <div className="flex-1">
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
      <DialogFooter>
        <Button onClick={form.handleSubmit(throttle(handlerSubmit, 3000))} className="w-full">开始</Button>
      </DialogFooter>
    </DialogContent>
  </TaskDialog>
  );
}