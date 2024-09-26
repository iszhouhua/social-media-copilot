import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { BatchPostExportDialog } from "@/components/task/post";
import { BatchCommentExportDialog } from "@/components/task/post-comment";
import { BatchAuthorPostExportDialog } from "@/components/task/author-post";
import { BatchAuthorExportDialog } from "@/components/task/author";

export default () => {
    const [dialogName, setDialogName] = React.useState<string>("");


    React.useEffect(() => {
        const listener = (event: CustomEvent<string>) => {
            setDialogName(event.detail);
        };
        window.addEventListener("open-dialog", listener);
        return () => window.removeEventListener("open-dialog", listener);
    }, []);

    return (<>
        <Toaster position="top-center" theme="light" richColors expand />
        {dialogName === "post" && <BatchPostExportDialog />}
        {dialogName === "author-post" && <BatchAuthorPostExportDialog />}
        {dialogName === "post-comment" && <BatchCommentExportDialog />}
        {dialogName === "author" && <BatchAuthorExportDialog />}
    </>
    );
};