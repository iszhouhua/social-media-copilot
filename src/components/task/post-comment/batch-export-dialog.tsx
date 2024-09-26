import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { throttle } from "lodash";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getPostLabel, parsePostId } from "@/utils/platform";
import { IdOrUrlFormField, idOrUrlTransform } from "@/components/form-field/id-or-url";
import { useTask } from "@/components/task/useTask";
import processor from "./processor";
import { TaskDialog } from "@/components/task";
import { LimitPerIdFormField } from "@/components/form-field/limit-per-id";

const formSchema = z.object({
  limitPerId: z.coerce.number().min(1, "请输入需要导出的评论数量").max(99999, "导出数量过多"),
  postIds: z.string().trim().min(1, "需要导出的数据不能为空").transform((arg, ctx) => idOrUrlTransform(arg, ctx, parsePostId)),
});

export type FormSchema = z.infer<typeof formSchema>;

const storageKey = "comment-batch-export-limitPerId";

export function BatchCommentExportDialog() {
  const task = useTask<FormSchema>(processor());

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
          <IdOrUrlFormField
            control={form.control}
            name="postIds"
            idLabel={postLabel}
          />
          <LimitPerIdFormField
            control={form.control}
            name="limitPerId"
            idLabel={postLabel} dataLabel="评论" />
        </form>
      </Form>
      <DialogFooter>
        <Button onClick={form.handleSubmit(throttle(onSubmit, 3000))} className="w-full"> 开始</Button>
      </DialogFooter>
    </DialogContent>
  </TaskDialog>
  );
}