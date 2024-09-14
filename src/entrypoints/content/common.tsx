import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { BatchPostExportDialog } from "@/components/post";
import { BatchCommentExportDialog } from "@/components/comment";

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
        {dialogName === "comment" && <BatchCommentExportDialog />}
    </>
    );
};