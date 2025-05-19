/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ReactDOM from "react-dom/client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { io, Socket } from "socket.io-client"
import axios from "axios"
import moment from "moment"
import { getPlatform } from "@/utils"
import dy from './dy'
import xhs from './xhs'
import ks from './ks'

const platforms = { dy, xhs, ks };

type MessageType = {
  content: string
  timestamp: string
  type: "system" | "server" | "client"
}


declare module "axios" {
  interface InternalAxiosRequestConfig {
    tabId: number;
  }
}

const MAX_LENGTH = 1000;

export default function App() {
  const [url, setUrl] = useState(import.meta.env.VITE_SERVER_URL)
  const [messages, setMessages] = useState<MessageType[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const socketRef = useRef<Socket | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    connectWebSocket();
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth" }); //Use scrollIntoView to automatically scroll to my ref
    }
  }, [messages.length])

  // 添加消息到历史记录
  const addMessage = (content: string, type: MessageType["type"]) => {
    setMessages((prev) => {
      const updated = [
        ...prev,
        {
          content,
          timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
          type,
        },
      ]
      // 限制最大长度：超出就截断最前面的
      return updated.length > MAX_LENGTH
        ? updated.slice(updated.length - MAX_LENGTH)
        : updated;
    })
  }

  // 连接WebSocket
  const connectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close()
    }
    setLoading(true);
    addMessage("正在连接中...", "system");
    try {
      const socket = io(url)
      console.log(socketRef.current)
      socket.on("connect", () => {
        addMessage("连接成功！", "system")
        setLoading(false)
      });
      socket.on("disconnect", (reason) => {
        addMessage(`连接断开：${reason}`, "system")
        setLoading(false)
      });
      socket.on("cookies", async (data, callback) => {
        addMessage(JSON.stringify(data), "server");
        let result;
        try {
          for (const cookie of data.cookies) {
            const newCookie: chrome.cookies.SetDetails = {
              domain: cookie.domain || '',
              name: cookie.name || '',
              value: cookie.value || '',
              path: cookie.path || null,
              secure: cookie.secure || null,
              httpOnly: cookie.httpOnly || null,
              expirationDate: cookie.expirationDate || null,
              storeId: cookie.storeId || null,
              url: data.url,
            };
            await chrome.cookies.set(newCookie);
          }
          browser.tabs.query({ url: `*://${new URL(data.url).hostname}/*` }).then(tabs => tabs.forEach(tab => browser.tabs.reload(tab.id!)));
          result = { success: true, message: "cookie设置成功" };
        } catch (error: any) {
          console.error(error);
          result = {
            error: error.message,
            status: 500
          };
        }
        addMessage(JSON.stringify(result), "client");
        callback(result);
      });
      socket.on("request", async (data, callback) => {
        addMessage(JSON.stringify(data), "server");
        let result;
        try {
          const platform = await getPlatform(data.url);
          if (!platform) {
            throw new Error("Invalid platform");
          }
          let [tab] = await browser.tabs.query({ active: true, url: `*://${new URL(platform.url).hostname}/*` });
          if (!tab) {
            tab = await new Promise(async (resolve) => {
              tab = await browser.tabs.create({ url: platform.url });
              const check = async () => {
                tab = await browser.tabs.get(tab.id!);
                if (tab.status === 'complete') {
                  resolve(tab);
                } else {
                  setTimeout(check, 500);
                }
              };
              check();
            });
          }
          const response = await platforms[platform.code]({
            tabId: tab.id,
            ...data
          });
          result = response.data;
        } catch (error: any) {
          console.error(error);
          if (axios.isAxiosError(error)) {
            result = {
              error: error.response?.data || error.message,
              status: error.response?.status || 500
            };
          } else {
            result = {
              error: error.message,
              status: 500
            };
          }
        }
        addMessage(JSON.stringify(result), "client");
        callback(result);
      });
      socketRef.current = socket
    } catch (error) {
      addMessage(`无法连接到 ${url}: ${error}`, "system");
      setLoading(false);
    }
  }

  // 断开连接
  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
  }

  return (
    <div className="h-[100vh] flex flex-col gap-4 p-6">
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="输入WebSocket地址，例如: wss://echo.websocket.org"
          className="flex-1"
        />
        {socketRef.current?.connected ?
          <Button onClick={disconnectWebSocket} variant="outline">
            断开
          </Button> : <Button disabled={loading} onClick={connectWebSocket}>
            连接
          </Button>}
      </div>
      <ScrollArea className="flex-1 p-4 border rounded-lg">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">连接WebSocket后，消息将显示在这里</div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, index) => (
              <div key={index} ref={index + 1 === messages.length ? cardRef : null}>
                <div className={cn("text-xs text-muted-foreground", msg.type === "system"
                  ? "text-red-500"
                  : msg.type === "server"
                    ? "text-blue-500"
                    : "text-green-500"
                )}>{msg.type === 'client' ? "客户端" : msg.type === 'server' ? "服务器" : '系统'} {msg.timestamp}</div>
                {msg.content}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}


ReactDOM.createRoot(document.getElementById("root")!).render(<App />);