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
  console.log('用户连接:', socket.id);
  socketMap.set(socket.id, socket);
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
    socketMap.delete(socket.id, socket);
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});