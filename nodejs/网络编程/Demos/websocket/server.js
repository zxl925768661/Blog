// var socket = new WebSocket("ws://127.0.0.1:12010/updates");
// socket.onopen = function () {
//   setInterval(function () {
//     if (socket.bufferedAmount == 0) socket.send(getUpdateData());
//   }, 50);
// };
// socket.onmessage = function (event) {
//   // TODO:event.data
// };


var WebSocketServer = require('ws');

const wss = new WebSocketServer('ws://127.0.0.1:12010');

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});