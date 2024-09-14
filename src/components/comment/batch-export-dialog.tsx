import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { throttle } from "lodash";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getPostLabel } from "@/utils/platform";
import { postIdTransform, PostIdFormField } from "../post/post-id-form-field";
import { useTask } from "../task/useTask";
import processors from "./processor";
import { TaskDialog } from "../task";

const formSchema = z.object({
  limitPerId: z.coerce.number().min(1, "请输入需要导出的评论数量").max(99999, "导出数量过多"),
  postIds: z.string().trim().min(1, "需要导出的数据不能为空").transform(postIdTransform),
});

export type FormSchema = z.infer<typeof formSchema>;

const storageKey = "comment-batch-export-limitPerId";

export function BatchCommentExportDialog() {
  const task = useTask<FormSchema>(processors[window.platform]);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      limitPerId: parseInt(localStorage.getItem(storageKey) ?? "100"),
      postIds: []
    }
  });


  async function onSubmit(values: FormSchema) {
    localStorage.setItem(storageKey, values.limitPerId + '');
    task.start(values);
  }

  const postLabel = getPostLabel();

  return (<TaskDialog {...task}>
    <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
      <DialogHeader>
        <DialogTitle>批量导出{postLabel}评论</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form className="space-y-6 py-4">
          <PostIdFormField
            control={form.control}
            name="postIds"
          />
          <FormField
            control={form.control}
            name="limitPerId"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>导出数量</FormLabel>
                  <FormDescription>每个{postLabel}需要导出的评论数</FormDescription>
                </div>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <DialogFooter>
        <Button onClick={form.handleSubmit(throttle(onSubmit, 3000))} className="w-full"> 开始</Button>
      </DialogFooter>
    </DialogContent>
  </TaskDialog>
  );
}