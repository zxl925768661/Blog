const net = require("net");
// 通过net.createServer(listeber)即可创建一个TCP服务器
const server = net.createServer(function (socket) {
  // 新的连接
  socket.on("data", function (data) {
    socket.write("你好");
  });
  socket.on("end", function () {
    console.log("连接断开");
  });
  socket.write("学习TCP");
});
// listener是连接事件connection的侦听器
server.listen(8124, function () {
  console.log("server bound");
});