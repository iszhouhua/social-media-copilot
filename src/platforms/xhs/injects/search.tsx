import { Logo } from "@/components/logo";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import ReactDOM from "react-dom/client";

export interface NoteInfo {
  modelType: string
  noteCard: {
    xsecToken: string
    desc: string
    user: {
      userId: string
      nickname: string
      avatar: string
    }
    lastUpdateTime: number
    ipLocation: string
    time: number
    noteId: string
    type: string
    title: string
  }
  xsecToken: string
  id: string
}

const Component = () => {
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const [notes, setNotes] = useState<NoteInfo[]>();
  const taskDialog = useTaskDialog('post');

  const handleDownloadCurrent = async () => {
    const feeds = await browser.runtime.sendMessage<"executeScript">({
      name: "executeScript",
      body: "return window['__INITIAL_STATE__']['search']?.feeds?._rawValue"
    });
    setNotes(feeds.filter((item: any) => item.modelType === "note"));
    setOpenAlert(true);
  };
  const startDownload = () => {
    if (!notes) return;
    taskDialog.open({
      urls: notes.map(item => `https://www.xiaohongshu.com/explore/${item.id}?xsec_token=${item.xsecToken}&xsec_source=pc_search`)
    })
  }

  return (<>
    <Logo />
    <Button onClick={handleDownloadCurrent}>导出当前结果</Button>
    <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确定要导出吗?</AlertDialogTitle>
          <AlertDialogDescription>当前页面共加载了{notes?.length}条笔记，可在当前页面向下滑动以加载更多内容！</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={() => startDownload()}>确定</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>);
};

const options: SmcContentScriptUiOptions = {
  position: "inline",
  anchor: () => document.getElementById("search-type")?.parentElement,
  isMatch: (url: URL) => {
    return url.pathname === '/search_result'||url.pathname === '/search_result/'
  },
  append: "before",
  onMount: (container: HTMLElement) => {
    container.className = "flex gap-4";
    const root = ReactDOM.createRoot(container);
    const userId = location.pathname.split("/")[3];
    root.render(<Component />);
    return root;
  },
  onRemove: (root: ReactDOM.Root) => {
    root?.unmount();
  }
}
export default options;