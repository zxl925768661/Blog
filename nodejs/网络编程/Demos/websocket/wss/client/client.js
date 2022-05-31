const WebSocket = require('ws');
const fs = require('fs');
const ws = new WebSocket('wss://localhost:8124', {
  rejectUnauthorized: false,
  key: fs.readFileSync("./keys/client.key"),
  cert: fs.readFileSync("./keys/client.crt"),
  ca: [fs.readFileSync("../ca/ca.crt")],
});

// 发送
ws.on('open', () => {
  ws.send('hello');
});

// 接收
ws.on('message', (message) => {
  console.log(message.toString()); // hello
});