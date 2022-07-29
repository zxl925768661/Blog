const http = require("http");
const port = 8889;
const host = "127.0.0.1";
const print = function (msg) {
  t = new Date();
  console.log(t + " " + msg);
};
const server = http.createServer(function (req, res) {
  print("connection:" + req.headers["connection"]);
  var data = [];
  var len = 0;
  req.on("data", function (chunk) {
    data.push(chunk);
    len += chunk.length;
  });
  req.on("end", function () {
    print("body-length:" + len + "body:" + data.toString());
  });
  res.end("OK");
});
server.setTimeout(3 * 1000);
server.listen(port, host, function () {
  print("listening on " + port);
});
server.on("error", function (e) {
  print(e);
});
server.on("connection", function (socket) {
  print("==> a new socket with a remote port:" + socket.remotePort + "<==");
});
