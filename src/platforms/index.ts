import { AxiosInstance } from "axios";

export type PopupProps = { onOpenDialog: (name: string) => void }

export interface Platform {
    http: AxiosInstance
    injects: Array<SmcContentScriptUiOptions>
    popup: (props: PopupProps) => JSX.Element
    tasks: Array<React.FC>
}

const modules = import.meta.glob('./*/*/index.{ts,tsx}', { eager: true, import: 'default' });

const platforms: Record<string, Platform> = {};
for (const path in modules) {
    const [_, platform, property] = path.split('/');
    if (!platforms[platform]) {
        // @ts-ignore
        platforms[platform] = {}
    }
    // @ts-ignore
    platforms[platform][property] = modules[path];
}

export default platforms;