const net = require("net");
const transfer = require('./transfer.js');
let rest = null;
let tsf = new transfer();

// 通过net.createServer(listeber)即可创建一个TCP服务器
const server = net.createServer(function (socket) {
  // 新的连接
  socket.on("data", function (chunk) { 
    // 如果上一次data有未完成的数据包的数据片段，合并一起处理
    if(rest && rest.length > 0){
        chunk = Buffer.concat([rest, chunk]);   
        rest = null;
    }
    // 如果接收到的数据中第一个数据包是完整的，进入循环体对数据进行拆包处理
    while(chunk.length && tsf.getPackageLen(chunk) && tsf.getPackageLen(chunk) <= chunk.length){   
        let packageLen = tsf.getPackageLen(chunk);  // 用于缓存接收到的数据中第一个包的字节长度
        const packageCon = chunk.slice(0, packageLen); 
        chunk = chunk.slice(packageLen);     
        const ret = tsf.decode(packageCon);  
        console.log(ret);
        socket.write(tsf.encode(ret.body, ret.serialNum));  // 将解码的数据包再次封包发送回客户端
    };
    // 缓存不完整的数据包，等待下一次data事件接收到数据后一起处理
    chunk.length && (rest = chunk);  

  });
  socket.on("end", function () {
    console.log("连接断开");
  });
});
server.listen(8124, function () {
  console.log("server bound");
});
