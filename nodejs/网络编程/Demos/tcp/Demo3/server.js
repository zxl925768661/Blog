const net = require("net");
const bufferSize = 128;
let rest = null;
let buf = Buffer.alloc(bufferSize);
// 通过net.createServer(listeber)即可创建一个TCP服务器
const server = net.createServer(function (socket) {
  // 新的连接
  socket.on("data", function (chunk) {
    // 如果上一次data有未完成的数据包的数据片段，合并一起处理
    if(rest && rest.length > 0){
      chunk = Buffer.concat([rest, chunk]);  
      rest = null;
    }
    // 空间不够，进行扩容
    buf = Buffer.alloc(chunk.length > bufferSize ? chunk.length: bufferSize);
    
    buf.write(chunk.toString());
    //通过Socket上的write方法回写响应数据
    while(buf.length >= bufferSize) {
      let _buf = Buffer.alloc(bufferSize)
      buf.copy(_buf, 0);
      socket.write(_buf);
      console.log(_buf.toString());
      buf = buf.slice(bufferSize);
    }
    // 缓存不完整的数据包，等待下一次data事件接收到数据后一起处理
    buf.length && (rest = buf);
  });
  socket.on("end", function () {
    console.log("连接断开");
  });
});
server.listen(8125, function () {
  console.log("server bound");
});
