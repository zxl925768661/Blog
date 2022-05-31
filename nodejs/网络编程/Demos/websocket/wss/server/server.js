const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const https = require("https");
const fs = require("fs");

const server = https.createServer({
  key: fs.readFileSync("./keys/server.key"),
  cert: fs.readFileSync("./keys/server.crt")
});
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});

server.listen(8124);