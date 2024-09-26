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
import { useTask } from "@/components/task/useTask";
import { FormSchema } from "./batch-export-dialog";
import processor from "./processor";
import { TaskDialog } from "@/components/task";
import { getPostLabel } from "@/utils/platform";
import { NeedMediaFormField } from "@/components/form-field/need-media";


const formSchema = z.object({
  needMedia: z.boolean().default(false).optional(),
  count: z.coerce.number().min(1, `请输入需要导出的数量`)
});

const storageKey = "author-post-batch-export-limitPerId";

export function AuthorPostExportDialog(props: {
  authorId: string
  authorName?: string
  onClose: () => void
}) {
  const { authorId, authorName, onClose } = props;
  const task = useTask<FormSchema>(processor());

  const postLabel = getPostLabel();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { count: parseInt(localStorage.getItem(storageKey) ?? "10"), needMedia: false }
  });


  async function handlerSubmit({ count, needMedia }: z.infer<typeof formSchema>) {
    localStorage.setItem(storageKey, count + '');
    task.start({ authorIds: [authorId], limitPerId: count, needMedia });
  }

  return (<TaskDialog onClose={onClose} {...task}>
    <DialogContent className="max-w-[425px]" aria-describedby={undefined}>
      <DialogHeader>
        <DialogTitle>导出<span className="text-red-400">{authorName}</span>的{postLabel}数据</DialogTitle>
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
          <NeedMediaFormField control={form.control} name="needMedia" />
        </form>
      </Form>
      <DialogFooter>
        <Button onClick={form.handleSubmit(throttle(handlerSubmit, 3000))} className="w-full">开始</Button>
      </DialogFooter>
    </DialogContent>
  </TaskDialog>
  );
}