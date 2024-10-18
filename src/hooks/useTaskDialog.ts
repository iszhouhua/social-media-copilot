export const useTaskDialog = <T = Record<string, any> | undefined>(name: string) => {

    return {
        open: (props: T) => {
            window.dispatchEvent(new CustomEvent("task-dialog", {
                detail: { name, props }
            }))
        },
        close: () => {
            window.dispatchEvent(new CustomEvent("task-dialog"));
        }
    };
}