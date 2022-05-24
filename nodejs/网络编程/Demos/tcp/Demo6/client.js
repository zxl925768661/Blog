const net = require('net');
const StackBuffer = require('./stackBuffer');
const stick = new StackBuffer(128);
const msg = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const client = net.createConnection({ port: 8080, host: '127.0.0.1' }, function () {
    for (let i = 0; i < 18; i++) {
        client.write(stick.publishMsg(msg))
      } 
});

client.on('data', function (data) {
    console.log(data.toString());
});
client.on('end', function () {
    console.log('disconnect from server');
});