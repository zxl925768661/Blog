const net = require("net");
const delimiter = '\r\n';
let rest = null;
// 通过net.createServer(listeber)即可创建一个TCP服务器
const server = net.createServer(function (socket) {
  // 新的连接
  socket.on("data", function (chunk) {
    let data = chunk;
    // 如果上一次data有未完成的数据包的数据片段，合并一起处理
    if (rest && rest.length) {
      data = Buffer.concat([rest, chunk]);
      rest = null;
    }
    while(data.length) {
      // 判断用户输入是否带有delimiter
      let index = data.indexOf(delimiter);
      if (index > -1) {
        let next = data.indexOf(delimiter, index + 1);
        next = next > -1 ? next : data.length;
        // 含有分隔符，则对当前数据块进行切割
        let msg = data.slice(index + delimiter.length, next);
        console.log(msg.toString());
        socket.write(data.slice(0, next));
        data = data.slice(next);
      } else {
        // 缓存不完整的数据包，等待下一次data事件接收到数据后一起处理
        data.length && (rest = data);
        break;
      }
    }
    
  });
  socket.on("end", function () {
    console.log("连接断开");
  });
});
server.listen(8125, function () {
  console.log("server bound");
});
