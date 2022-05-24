const net = require("net");
const msg = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const bufferSize = 128;
let rest = null;
const buf = Buffer.alloc(bufferSize);
const client = net.connect({ port: 8125 }, function () {
  //'connect' listener
  console.log("client connected");
  // 在客户端的connect事件回调中通过多个write()发送数据，它可能会将多次write()写入的数据一次发出
  for (let i = 0; i < 18; i++) {
    client.write(Buffer.alloc(bufferSize).fill(msg, 0, msg.length));
  }
});
client.on("data", function (chunk) {
  // 如果上一次data有未完成的数据包的数据片段，合并一起处理
  if(rest && rest.length > 0){
    chunk = Buffer.concat([rest, chunk]);  
    rest = null;
  }
  // 空间不够，进行扩容
  buf = Buffer.alloc(chunk.length > bufferSize ? chunk.length: bufferSize);
  buf.write(chunk.toString());

  while(buf.length >= bufferSize) {
    console.log(buf.slice(0, bufferSize).toString());
    buf = buf.slice(bufferSize)
  }
  // 缓存不完整的数据包，等待下一次data事件接收到数据后一起处理
  buf.length && (rest = buf);
});
client.on("end", function () {
  console.log("client disconnected");
});