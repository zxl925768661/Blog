const net = require("net");
const msg = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const delimiter = '\r\n';
let rest;
const client = net.connect({ port: 8125 }, function () {
  //'connect' listener
  console.log("client connected");
  // 在客户端的connect事件回调中通过多个write()发送数据，它可能会将多次write()写入的数据一次发出
  for (let i = 0; i < 18; i++) {
    client.write(Buffer.concat([ Buffer.from(delimiter), Buffer.from(msg) ]));
  }
});
client.on("data", function (chunk) {
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
      data = data.slice(next);
    } else {
      // 缓存不完整的数据包，等待下一次data事件接收到数据后一起处理
      data.length && (rest = data);
      break;
    }
  }
  
});
client.on("end", function () {
  console.log("client disconnected");
});