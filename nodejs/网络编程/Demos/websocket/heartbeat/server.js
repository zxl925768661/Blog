const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

function heartbeat() {
  this.isAlive = true;
}

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', function connection(ws) {
  console.log('连接了'); 
  ws.isAlive = true;
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
  ws.on('pong', heartbeat);
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', function close() {
  console.log('服务器端关闭了')
  clearInterval(interval);
});

// 以下代码模拟实现服务器端关闭
// setTimeout(function() {
//     console.log('服务器端关闭了0000')
//     wss.close();
// }, 61000);