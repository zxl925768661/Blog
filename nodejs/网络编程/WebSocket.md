# WebSocket  
WebSocket协议是基于 HTTP 协议之上的扩展，是一种可以双向通信的协议。其特点包括：  
1. 建立在 TCP 协议之上，服务器端的实现比较容易；
2. 与 HTTP 协议有着良好的兼容性。默认端口也是80和443，并且握手阶段采用 HTTP 协议，因此握手时不容易屏蔽，能通过各种 HTTP 代理服务器；
3. 数据格式比较轻量，性能开销小，通信高效；
4. 可以发送文本，也可以发送二进制数据；
5. 没有同源限制，客户端可以与任意服务器通信；
6. 协议标识符是ws（如果加密，则为wss），服务器网址就是 URL

## WebSocket客户端的API  
### WebSocket构造函数  
WebSocket 对象作为一个构造函数，用于新建 WebSocket 实例  
```js
var ws = new WebSocket('ws://localhost:3000');
```
执行上面语句之后，客户端就会与服务器进行连接。

实例对象的所有属性和方法清单，参见[这里](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)   
### webSocket.readyState  
| Constant             | Value | 说明                               |
|----------------------|-------|------------------------------------|
| WebSocket.CONNECTING | 0     | 表示正在连接                       |
| WebSocket.OPEN       | 1     | 表示连接成功，可以通信了           |
| WebSocket.CLOSING    | 2     | 表示连接正在关闭                   |
| WebSocket.CLOSED     | 3     | 表示连接已经关闭，或者打开连接失败 | 

### webSocket.onopen  
指定连接成功后的回调函数;  
当WebSocket 的连接状态readyState 变为1时调用; 这意味着当前连接已经准备好发送和接受数据。这个事件处理程序通过 事件（建立连接时）触发  
```js
ws.onopen = function () {
  ws.send('hello');
}
```
如果要指定多个回调函数，可以使用addEventListener方法  
```js
ws.addEventListener('open', function (event) {
  ws.send('hello');
});
```
### webSocket.onclose  
用于指定连接关闭后的回调函数; 这个事件监听器将在 WebSocket 连接的readyState 变为 CLOSED时被调用，它接收一个名字为“close”的 CloseEvent 事件  
```js
ws.onclose = function (event) {
  let { code, reason, wasClen } = event;
  // ...
  console.log('closed');
}
// 或者 
ws.addEventListener('close', function (event) {
  let { code, reason, wasClen } = event;
  // ...
  ws.send('closed');
});
```  
### webSocket.onmessage  
用于指定收到服务器数据后的回调函数  
```js
ws.onmessage = function (event) {
   
}
// 或者 
ws.addEventListener('message', function (event) {
  
});

```
注意，服务器数据可能是文本，也可能是二进制数据（`blob对象`或`Arraybuffer对象`）
### webSocket.binaryType
显式指定收到的二进制数据类型  
```js
// 收到的是 blob 数据
ws.binaryType = "blob";
ws.onmessage = function(e) {
  console.log(e.data.size);
};

// 收到的是 ArrayBuffer 数据
ws.binaryType = "arraybuffer";
ws.onmessage = function(e) {
  console.log(e.data.byteLength);
};
```
### webSocket.bufferedAmount  
实例对象的bufferedAmount属性，表示还有多少字节的二进制数据没有发送出去。它可以用来判断发送是否结束. 一旦所有数据被发送至网络，则该属性值将被重置为0。但是，若在发送过程中连接被关闭，则属性值不会重置为0。  
```js
var data = new ArrayBuffer(10000000);
ws.send(data);

if (ws.bufferedAmount === 0) {
  // 发送完毕
} else {
  // 发送还没结束
}
```
### webSocket.send()
实例对象的send()方法用于向服务器发送数据  
发送文本例子：   
```js
ws.send('hello');  
```  
发送ArrayBuffer对象例子： 
```js
var img = canvas_context.getImageData(0, 0, 400, 320);
var binary = new Uint8Array(img.data.length);
for (var i = 0; i < img.data.length; i++) {
  binary[i] = img.data[i];
}
ws.send(binary.buffer);
```
发送Blob对象的例子：   
```js
var file = document.querySelector('input[type="file"]').files[0];
ws.send(file);
``` 
### webSocket.onerror  
用于指定连接失败后的回调函数  

## 服务端实现  
在这里我们使用ws实现  

ws 是一个第三方的 websocket 通信模块，需要安装 npm i ws，websocket 的通信模型跟 HTTP 是一样的，服务端对应客户端模型  

## 实例  
### ws实例
server.js  
```js
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

// 创建 WebSocket 服务器 监听在 3000 端口
const wss = new WebSocketServer({port: 3000});

//如果有WebSocket请求接入，wss对象可以响应connection事件来处理这个WebSocket：
wss.on('connection', (ws) => { // 在connection事件中，回调函数会传入一个WebSocket的实例，表示这个WebSocket连接
  console.log('连接了');
    // 接收客户端信息并把信息返回发送
    ws.on('message', (message) => {
      // send 方法的第二个参数是一个错误回调函数
      ws.send(message.toString(), (err) => { 
        if (err) {
          console.log(`[SERVER] error: ${err}`);
        }
    })
  });
})
```
ws模块既包含了服务器端，又包含了客户端。ws的WebSocket就表示客户端，它其实就是WebSocketServer响应connection事件时回调函数传入的变量ws的类型  
```js
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000');

// 发送
ws.on('open', () => {
  ws.send('hello');
});

// 接收
ws.on('message', (message) => {
  console.log(message.toString()); // hello
});
```
我们利用curl测试WebSocket连接是否正常
```
curl -v -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Host: localhost:3000" -H "sec-websocket-key:8ZuOAG3PepR31z9HtJCkso==" -H "sec-websocket-version:13" localhost:3000
```
`注意这里不需要特定的密钥（Sec-WebSocket-Key），所以随便取一个都可以。该头文件的作用是防止缓存websocket请求`  
结果如下：  
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b2ba2d65af044131b9e3c4f52ab1619b~tplv-k3u1fbpfcp-zoom-1.image)  

通常 WS 的应用场景，更多时候面对的客户端是浏览器， 下面来实现一个浏览器客户端的页面用来测试： 
```html
<!DOCTYPE html>
<html>
<head>
  <title>websocket</title>
</head>
<body>

  <script type="text/javascript">
    // 浏览器提供 WebSocket 对象
    var ws = new WebSocket('ws://localhost:3000');

    // 发送
    ws.onopen = function() {
      ws.send('hello');
    }

    // 接收
    ws.onmessage = function(mes) { 
      if (mes.data === 'hello') {
	      ws.close();
      }
    }
  </script>

</body>
</html>
```
打开浏览器请求、响应报文结果如下：  
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/02c0f04eca914e989d810c30a391bc09~tplv-k3u1fbpfcp-zoom-1.image)   
请求报文：  
```
GET ws://localhost:3000/ HTTP/1.1
Connection: Upgrade
Host: localhost:3000
Origin: http://172.17.0.25:8000
Sec-WebSocket-Key: ABf0tYysxA0gJuHH5RZbxg==
Sec-WebSocket-Version: 13
Upgrade: websocket
```
该请求和普通的HTTP请求有几点不同：  
1. GET请求的地址不是类似`/path/`, 而是以`ws://`开头的地址；  
2. 请求头`Upgrade: websocket`和 `Connection: Upgrade`表示请求服务器端升级协议为WebSocket连接；  
3. `Sec-WebSocket-Key`是用于安全校验，用于标识这个连接，并非用于加密数据；
`Sec-WebSocket-Key`的值是随机生成的Base64编码的字符串。ws模块中实现方式(具体[websocket-server.js](https://github.com/websockets/ws/blob/master/lib/websocket-server.js))：   
![代码](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a9d9b56ac2284555ac60d1d9cb087c26~tplv-k3u1fbpfcp-zoom-1.image)  
解释：  服务器端接收到之后将其与字符串`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`相连，形成字符串8Zu0AG3PepR31z9HtJCKso==258EAFA5-E914-47DA-95CA-C5AB0DC85B11，然后通过sha1安全散列算法计算出结果后，再进行Base64编码，最后返回给客户端。算法如下所示：  
```js
const { randomBytes, createHash } = require('crypto');
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
// const key = randomBytes(16).toString('base64');
const key = '8ZuOAG3PepR31z9HtJCkso==';
let val = createHash('sha1').update(key + GUID).digest('base64');
console.log(val);   // vQCeyABRRt6oKfebHddaBNvaTR4=
```

4. `Sec-WebSocket-Version`指定了WebSocket的协议版本

随后，服务器如果接受该请求，就会返回如下响应：
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: vQCeyABRRt6oKfebHddaBNvaTR4=
```
该响应代码`101`表示本次连接的HTTP协议即将被更改，更改后的协议就是`Upgrade: websocket`指定的WebSocket协议。
客户端将会校验`Sec-WebSocket-Accept`的值，如果成功，将开始接下来的传输。
客户端校验(具体[websocket.js](https://github.com/websockets/ws/blob/master/lib/websocket.js))`sec-websocket-accept`代码：     
```js
const digest = createHash('sha1')
  .update(key + GUID)
  .digest('base64');

if (res.headers['sec-websocket-accept'] !== digest) {
  abortHandshake(websocket, socket, 'Invalid Sec-WebSocket-Accept header');
  return;
}
```
`Sec-WebSocket-Extensions字段说明`：  
Sec-WebSocket-Extensions 请求头字段来请求扩展，请求头字段遵守 HTTP 的规则，它的值是通过 ABNF 定义的。  
就像其他的 HTTP 请求头字段一样，这个请求头字段可以被切割成几行或者几行合并成一行。因此，下面这两段是等价的：
```
Sec-WebSocket-Extensions: foo
Sec-WebSocket-Extensions: bar; baz=2
```
是等价于：
```
Sec-WebSocket-Extensions: foo, bar; baz=2
```

现在，一个WebSocket连接就建立成功，浏览器和服务器就可以随时主动发送消息给对方。消息有两种，一种是文本，一种是二进制数据（blob对象或Arraybuffer对象）。通常，我们可以发送JSON格式的文本，这样，在浏览器处理起来就十分容易。

### wss例子 
wss例子与HTTPS基本类似，需要相应的证书，具体代码在 [Demos/wss](https://github.com/zxl925768661/Blog/tree/main/nodejs/%E7%BD%91%E7%BB%9C%E7%BC%96%E7%A8%8B/Demos/websocket/wss) 上。  
部分代码如下： 
client.js   
```js
// ...
const ws = new WebSocket('wss://localhost:8124', {
  rejectUnauthorized: false,
  key: fs.readFileSync("./keys/client.key"),
  cert: fs.readFileSync("./keys/client.crt"),
  ca: [fs.readFileSync("../ca/ca.crt")],
});
// ....
```
server.js   
```js
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const https = require("https");
const fs = require("fs");

const server = https.createServer({
  key: fs.readFileSync("./keys/server.key"),
  cert: fs.readFileSync("./keys/server.crt")
});
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});

server.listen(8124);
```

### 跳动检测  
主要目的是保障客户端 websocket 与服务端连接状态，该程序有心跳检测及自动重连机制，当网络断开或者后端服务问题造成客户端websocket断开，程序会自动尝试重新连接直到再次连接成功。

在使用原生websocket的时候，如果设备网络断开，不会触发任何函数，前端程序无法得知当前连接已经断开。这个时候如果调用 websocket.send 方法，浏览器就会发现消息发不出去，便会立刻或者一定短时间后（不同浏览器或者浏览器版本可能表现不同）触发 onclose 函数。

后端 websocket 服务也可能出现异常，连接断开后前端也并没有收到通知，因此需要前端定时发送心跳消息 ping，后端收到 ping 类型的消息，立马返回 pong 消息，告知前端连接正常。如果一定时间没收到pong消息，就说明连接不正常，前端便会执行重连。

为了解决以上两个问题，以前端作为主动方，定时发送 ping 消息，用于检测网络和前后端连接问题。当发现异常时，客户端可执行重连逻辑，直到重连成功。  

如以下例子， 服务器端close后，前端收到通知等待一段时间关闭连接。
server.js  
```js
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

function heartbeat() {
  this.isAlive = true;
}

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', function connection(ws) {
  console.log('连接了'); 
  ws.isAlive = true;
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
  ws.on('pong', heartbeat);
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', function close() {
  console.log('服务器端关闭了')
  clearInterval(interval);
});

// 以下代码模拟实现服务器端关闭
// setTimeout(function() {
//     console.log('服务器端关闭了0000')
//     wss.close();
// }, 61000);
```

client.js  
```js
const WebSocket = require('ws');

function heartbeat() {
  clearTimeout(this.pingTimeout);
 
  // terminate()立即销毁连接， close()可能会使套接字再保持30秒
  this.pingTimeout = setTimeout(() => {
    this.terminate();
  }, 30000 + 1000);
}

const client = new WebSocket('ws://localhost:3000');

client.on('open', heartbeat);
client.on('open', () => {
  client.send('hello');
});
client.on('ping', heartbeat);


// 接收
client.on('message', function message(data) {
  console.log('received: %s', data);
});

client.on('close', function clear() {
  clearTimeout(this.pingTimeout);
  console.log('客户端关闭了');
});
``` 

## WebSocket数据传输  
在握手顺利完成后，当前连接将不再进行HTTP的交互，而是开始WebSocket的数据帧协议，实现客户端与服务器端的数据交互。 下图为协议升级过程示意图：  
![协议升级](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bed7b8cc42014a7599cafc0717170aca~tplv-k3u1fbpfcp-zoom-1.image)  
握手完成后， 客户端的onopen()将会被触发执行。  
为了完成TCP套接字事件到WebSocket事件的封装，需要在接收数据时进行处理，WebSocket的数据帧协议即是在底层data事件上封装完成的，部分代码([websocket.js/setSocket](https://github.com/websockets/ws/blob/master/lib/websocket.js#L203))如下：
```js
class WebSocket extends EventEmitter {
  setSocket(socket, head, options) {
    const receiver = new Receiver(...);

    this._receiver = receiver;

    socket.on('close', socketOnClose);
    socket.on('data', socketOnData);
    socket.on('end', socketOnEnd);
    socket.on('error', socketOnError);

    this._readyState = WebSocket.OPEN;
    this.emit('open');
  }
}
```  
同样的数据发送时，也需要做封装操作，部分代码如下：  
```js
send(data, options, cb) {
  // ...
  this._sender.send(data || EMPTY_BUFFER, opts, cb);
}
```
当客户端调用`send()`发送数据时，服务器端触发`onmessage()`;当服务器端调用`send()`发送数据时，客户端的`onmessage()`触发。当我们调用send()发送一条数据时，协议可能将这个数据封装为一帧或多帧数据，然后逐帧发送。  
为了安全考虑，客户端需要对发送的数据帧进行掩码处理，服务器一旦收到无掩码帧（比如中间拦截破坏），连接将关闭。而服务器发送到客户端的数据帧则无须做掩码处理，同样，如果客户端收到待掩码的数据帧，连接也将关闭。  
## 帧协议  
[RFC](https://datatracker.ietf.org/doc/html/rfc6455#page-27): 
在RFC 指定的 WebSocket 版本中，每个包前面只有一个报头。然而，这是一个相当复杂的报头。以下是它的构建模块:  
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f66211713bbd480dbc3ffe97d537fd66~tplv-k3u1fbpfcp-zoom-1.image)   
- FIN ：1bit ，如果这个数据帧是最后一帧，这个fin位为1，其余情况为0。当一个数据没有被分为多帧时，它既是第一帧也是最后一帧。Firefox 在 32K 之后创建了第二个帧。
- RSV1，RSV2，RSV3：每个1bit，必须是0，除非扩展定义为非零。如果接受到的是非零值但是扩展没有定义，则需要关闭连接。
- opcode：4bit，可以用来表示0到15的值，用来解释当前数据帧。规定有以下不同的状态，如果是未知的，接收方必须马上关闭连接。状态如下：
  - 0x00: 附加数据帧
  - 0x01：文本数据帧
  - 0x02：二进制数据帧
  - 0x3-7：保留为之后非控制帧使用
  - 0x8：关闭连接帧
  - 0x9：ping数据帧
  - 0xA：pong数据帧
  - 0xB-F(保留为后面的控制帧使用)
ping数据帧和pong数据帧用于心跳坚持，当一端发送ping数据帧时，另一端必须发送pong数据帧作为响应，告知对方这一端仍然处于响应状态。   
- Mask：1bit，掩码，定义payload数据是否进行了掩码处理，如果是1表示进行了掩码处理。客户端发送给服务器端时为1，服务器端发送给客户端时为0.
- Masking-key:域的数据即是掩码密钥，用于解码PayloadData。客户端发出的数据帧需要进行掩码处理，所以此位是1。
- Payload_len：7位，7 + 16位，7+64位，payload数据的长度，如果是0-125，就是真实的payload长度，如果是126，那么接着后面的2个字节对应的16位无符号整数就是payload数据长度；如果是127，那么接着后面的8个字节对应的64位无符号整数就是payload数据的长度。
- Masking-key：0到4字节，如果MASK位设为1则有4个字节的掩码解密密钥，否则就没有。
- Payload data：任意长度数据。包含有扩展定义数据和应用数据，如果没有定义扩展则没有此项，仅含有应用数据。

客户端发送数据时，需要构造一个或多个数据帧协议报文。由于hello world!较短，不存在分割为多个数据帧情况，又由于hello world!会以文本的方式发送，它的payload length长度为96(12字节 * 8位/字节)，二进制表示为1100000。所以报文应当如下：  
```
fin(1) + res(000) + opcode(0001) + masked(1) + payload length(1100000) + masking key(32位) + payload data(hello world!加密后的二进制)
```
当以文本方式发送时，文本的编码为UTF-8，由于这里发送的不存在在中文，所以一个字符占一个字节，即8位。
客户端发送消息后，服务器端在data事件中接收到这些编码数据，然后解析为相应的数据帧， 再以数据帧的格式，通过掩码将真正的数据解密出来，然后触发onmessage()执行。
服务器端再回复hello world!的时候，剩下的事情就是无须掩码，其余相同，如下所示：  
```
fin(1) + res(000) + opcode(0001) + masked(1) + payload length(1100000) + masking key(32位) + payload data(hello world!加密后的二进制)
```

### ws解析数据帧源码解析 

#### Receiver
Receiver类, 用于处理数据帧的核心  
[receiver.js/getInfo方法](https://github.com/websockets/ws/blob/master/lib/receiver.js#L166), 它就是用于处理数据帧的核心  
```js
getInfo() {
  if (this._bufferedBytes < 2) {
    this._loop = false;
    return;
  }
  // consume方法： 消费已获取的Buffer
  // 如需要获得数据帧的第一个字节的数据(包含了 FIN + RSV + OPCODE), 只需要通过this.consume(1)即可
  const buf = this.consume(2);

  // 只保留了数据帧中的几个关键数据
  this._fin = (buf[0] & 0x80) === 0x80;
  this._opcode = buf[0] & 0x0f;
  this._payloadLength = buf[1] & 0x7f;
  this._masked = (buf[1] & 0x80) === 0x80;

  // 对应Payload Length的三种情况
  // 0-125: 载荷实际长度就是0-125之间的某个数
  // 126: 载荷实际长度为随后2个字节代表的一个16位的无符号整数的数值
  // 127: 载荷实际长度为随后8个字节代表的一个64位的无符号整数的数值
  if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
  else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
  else return this.haveLength();
}
```

构造帧 部分代码如下([sender.js/frame](https://github.com/websockets/ws/blob/master/lib/sender.js#L68))：   
以客户端发送'hello world!'进行解析：  
```js
// 此时data为'hello world!'，
// options: {
//   fin: true,
//   generateMask: undefined,
//   mask: false,
//   maskBuffer: undefined,
//   opcode: 1,
//   readOnly: false,
//   rsv1: false,
//   [Symbol(kByteLength)]: 12
// }

static frame(data, options) {
    let offset = 2;
    let skipMasking = false;

    let dataLength;

    if (typeof data === 'string') {
      if (
        (!options.mask || skipMasking) &&
        options[kByteLength] !== undefined
      ) {
        dataLength = options[kByteLength];
      } else {
        data = Buffer.from(data);
        dataLength = data.length;
      }
    } 

    let payloadLength = dataLength;

    const target = Buffer.allocUnsafe(offset);

    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) target[0] |= 0x40;

    target[1] = payloadLength;

    if (!options.mask) return [target, data];

    
  }

  // 发送帧
  sendFrame(list, cb) {
    if (list.length === 2) {
      this._socket.write(list[0]);
      this._socket.write(list[1], cb);
    } else {
      this._socket.write(list[0], cb);
    }
  }
```

# 参考资料
https://www.ruanyifeng.com/blog/2017/05/websocket.html  
https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket   
https://zhuanlan.zhihu.com/p/52822189  
https://github.com/websockets/ws  
