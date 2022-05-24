const net = require('net');
const StackBuffer = require('./stackBuffer');
const stick = new StackBuffer(128);

const tcp_server = net.createServer(function (socket) {

    socket.on('data', data => {
        stick.putData(data)
    });
    socket.on('close', () => console.log('client disconnected'));
    socket.on('error', error => console.log(`error:客户端异常断开: ${error}`));

    stick.onMsgRecv(data => console.log('recv data: ' + data.toString()));
});


tcp_server.on('error', err => console.log(err));
tcp_server.listen(8080, () => console.log('tcp_server listening on 8080'));