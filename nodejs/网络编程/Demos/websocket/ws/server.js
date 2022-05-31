const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

// 创建 WebSocket 服务器 监听在 3000 端口
const wss = new WebSocketServer({port: 3000});

//如果有WebSocket请求接入，wss对象可以响应connection事件来处理这个WebSocket：
wss.on('connection', (ws) => { // 在connection事件中，回调函数会传入一个WebSocket的实例，表示这个WebSocket连接
  console.log('连接了');
    // 接收客户端信息并把信息返回发送
    ws.on('message', (message) => {
      // send 方法的第二个参数是一个错误回调函数
      ws.send(message.toString(), (err) => { 
        if (err) {
          console.log(`[SERVER] error: ${err}`);
        }
    })
  });
})