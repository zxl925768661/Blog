const net = require("net");
// 通过net.createServer(listeber)即可创建一个TCP服务器
const server = net.createServer(function (socket) {
  // 新的连接
  socket.on("data", function (chunk) {

    const msg = chunk.toString();
    console.log(msg, '-------服务器端data-----')
    //通过Socket上的write方法回写响应数据
    socket.write('您好' + msg);

  });
  socket.on("end", function () {
    console.log("连接断开");
  });
  // socket.write("学习TCP");
});
server.listen(8125, function () {
  console.log("server bound");
});
