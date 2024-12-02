import ReactDOM from "react-dom/client";
import App from './app';
import Other from './other';

const root = ReactDOM.createRoot(document.getElementById("root")!);
browser.tabs.query({ active: true, currentWindow: true })
    .then(([tab]) => {
        const platform = getPlatform(tab.url);
        if (platform) {
            root.render(<App platform={platform} tabId={tab.id!} />);
        }else{
            root.render(<Other />);
        }
    }).catch(() => root.render(<Other />));