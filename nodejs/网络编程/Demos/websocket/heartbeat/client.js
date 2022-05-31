const WebSocket = require('ws');

function heartbeat() {
  clearTimeout(this.pingTimeout);
 
  // terminate()立即销毁连接， close()可能会使套接字再保持30秒
  this.pingTimeout = setTimeout(() => {
    this.terminate();
  }, 30000 + 1000);
}

const client = new WebSocket('ws://localhost:3000');

client.on('open', heartbeat);
client.on('open', () => {
  client.send('hello');
});
client.on('ping', heartbeat);


// 接收
client.on('message', function message(data) {
  console.log('received: %s', data);
});

client.on('close', function clear() {
  clearTimeout(this.pingTimeout);
  console.log('客户端关闭了');
});