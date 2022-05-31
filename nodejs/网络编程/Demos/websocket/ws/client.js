const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000');

// 发送
ws.on('open', () => {
  ws.send('hello');
});

// 接收
ws.on('message', (message) => {
  console.log(message.toString()); // hello
});