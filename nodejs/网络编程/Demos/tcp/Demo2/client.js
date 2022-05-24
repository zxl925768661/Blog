const net = require("net");
const msg = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const client = net.connect({ port: 8125 }, function () {
  //'connect' listener
  console.log("client connected");
  // 在客户端的connect事件回调中通过多个write()发送数据，它可能会将多次write()写入的数据一次发出
  for (let i = 0; i < 18; i++) {
    client.write(msg);
  }
});
client.on("data", function (data) {
  console.log(data.toString(), '-------客户端data-----');
  // client.end();
});
client.on("end", function () {
  console.log("client disconnected");
});