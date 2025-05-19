const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');

const socketMap = new Map();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/request', async (req, res) => {
  if (!req.body?.url) {
    res.status(400).send("请求URL不能为空");
    return;
  }
  if (socketMap.size === 0) {
    res.status(412).send("socket连接为空");
    return;
  }
  try {
    const socket = Array.from(socketMap.values())[Math.floor(Math.random() * socketMap.size)];
    const response = await socket.timeout(10000).emitWithAck("request", req.body);
    console.log("request", req.body);
    console.log("response", response);
    if (response.error) {
      res.status(response.status || 500).send(response.error);
    } else {
      res.send(response);
    }
  } catch (err) {
    console.error('request error', err);
    res.status(500).send(err.message);
  }
});

app.post('/cookies', async (req, res) => {
  if (!req.body?.url) {
    res.status(400).send("与Cookie关联的URL不能为空");
    return;
  }
  if (!Array.isArray(req.body?.cookies)) {
    res.status(400).send("Cookies不能为空");
    return;
  }
  try {
    const socket = Array.from(socketMap.values())[Math.floor(Math.random() * socketMap.size)];
    const response = await socket.timeout(10000).emitWithAck("cookies", req.body);
    if (response.error) {
      res.status(response.status || 500).send(response.error);
    } else {
      res.send(response);
    }
  } catch (err) {
    console.error('request error', err);
    res.status(500).send(err.message);
  }
});

io.on('connection', (socket) => {
  console.log('客户端连接:', socket.id);
  socketMap.set(socket.id, socket);
  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id);
    socketMap.delete(socket.id, socket);
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

if (process.env.HEADLESS) {
  const puppeteer = require("puppeteer-core");
  const path = require("path");

  (async () => {
    let extensionPath = path.join(__dirname, "chrome-extension");
    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium-browser",
      bindAddress: "0.0.0.0",
      headless: true,
      ignoreDefaultArgs: ["--disable-extensions"],
      args: [
        `--load-extension=${extensionPath}`,
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "--remote-debugging-port=9222",
        "--remote-debugging-address=0.0.0.0"
      ]
    });
    const workerTarget = await browser.waitForTarget(
      // Assumes that there is only one service worker created by the extension and its URL ends with background.js.
      target => target.type() === 'service_worker' && target.url().endsWith('background.js')
    );
    const extensionUrl = workerTarget.url();
    const [, , extensionID] = extensionUrl.split('/');
    const extensionPopupHtml = 'sidepanel.html'
    const extensionPage = await browser.newPage();
    await extensionPage.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
  })();
}