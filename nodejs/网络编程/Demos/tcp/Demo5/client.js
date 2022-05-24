const net = require("net");
const transfer = require('./transfer.js');
let rest = null;
let tsf = new transfer();
const msg = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const client = net.connect({ port: 8124 }, function () {
  //'connect' listener
  console.log("client connected");
  
});
// 发送数据
for (let i = 0; i < 18; i++) {
  client.write(tsf.encode(msg));
}
client.on("data", function (chunk) {
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

      const ret = tsf.decode(packageCon); // 解码当前数据中第一个数据包
      console.log(ret.body);
  };
  // 缓存不完整的数据包，等待下一次data事件接收到数据后一起处理
  chunk.length && (rest = chunk);  

  // client.end();
});
client.on("end", function () {
  console.log("client disconnected");
});

