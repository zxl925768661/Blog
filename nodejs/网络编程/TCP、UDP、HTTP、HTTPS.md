# 构建TCP服务 
## TCP
TCP（Transmission Control Protocol），传输控制协议，在OSI模型（由七层组成，分别为物理层、数据链接层、网络层、传输层、会话层、表示层、应用层）中属于传输层协议，许多应用层协议基于TCP构建，典型的是HTTP、SMTP、IMAP等协议。七层协议示意图如下图所示：  
![OSI模型（七层协议）](https://img-blog.csdnimg.cn/5a9374cdb04846cda3b46e2c8a7b76a9.png)   

TCP是面向连接的协议，其显著的特征是在传输之前需要3次握手形成会话，如下图：  
![TCP在传输之前的3次握手](https://img-blog.csdnimg.cn/3efa52ab3e72412fa8d6af570c0798f9.png)   
只有会话形成之后，服务器端和客户端之间才能互相发送数据。在创建会话的过程中，服务器端和客户端分别提供一个套接字，这两个套接字共同形成一个连接。服务器端与客户端则通过套接字实现两者之间连接的操作。

### 创建TCP服务器端  
利用net.createServer(listener)创建一个TCP服务器 
```js
const net = require("net");
// 通过net.createServer(listeber)即可创建一个TCP服务器
const server = net.createServer(function (socket) {
  // 新的连接
  socket.on("data", function (data) {
    socket.write("你好");
  });
  socket.on("end", function () {
    console.log("连接断开");
  });
  socket.write("学习TCP");
});
// listener是连接事件connection的侦听器
server.listen(8124, function () {
  console.log("server bound");
});
```
我们可以利用Telnet工具作为客户端对刚才创建的简单服务器进行会话交流，相关代码如下：  
![](https://img-blog.csdnimg.cn/e1e28e0823304e0db89973f9ac9e997d.png)   

### 创建客户端测试  
通过net模块自行构造客户端进行会话，测试上面构建的TCP服务代码如下：  
```js
const net = require("net");
const client = net.connect({ port: 8124 }, function () {
  //'connect' listener
  console.log("client connected");
  client.write("world!\r\n");
});
client.on("data", function (data) {
  console.log(data.toString());
  client.end();
});
client.on("end", function () {
  console.log("client disconnected");
});

```
![测试结果](https://img-blog.csdnimg.cn/84e42c9bde8141b5ae87b26b157d1ffb.png)   

### TCP服务的事件
1. 服务器事件  
对于通过net.createServer()创建的服务器而言，它是一个EventEmitter实例，它的自定义事件有如下几种：  
- listening: 在调用server.listen()绑定端口或者Domain Socket后触发，简洁写法为 server.listen(port,listeningListener)，通过listen()方法的第二个参数传入；  
- connection: 每个客户端套接字连接到服务器端时触发，简洁写法为通过net.createServer()，最后一个参数传递；
- close: 当服务器关闭时触发，在调用server.close()后，服务器将停止接收新的套接字连接，但保持当前存在的连接，等待所有连接都断开后，会触发该事件；
- error: 当服务器发生异常时，将会触发该事件。比如侦听一个使用中的端􏳑，将会触发一个异常，如果不侦听error事件，服务器将会抛出异常。  

2. 连接事件  
服务器可以同时与多个客户端保持连接，对于每个连接而言是典型的可写可读Stream对􏰮。 Stream对象可以用于服务器端和客户端之间的通信，既可以通过data事件从一端读取另一端发来的数据，也可以通过write()方法从一端向另一端发送数据。它具有如下自定义事件： 
- data: 当一端调用write()发送数据时，另一端会触发data事件，事件传递的数据即是write()发送的数据。
- end: 当连接中的任意一端发送了FIN数据时，将会触发该事件。
- connect: 该事件用于客户端，当套接字与服务器端连接成功时会被触发。
- drain: 当任意一端调用write()发送数据时，当前这端会触发该事件。
- error: 当异常发生时，触发该事件。
- close: 当套接字完全关闭时，触发该事件。
- timeout: 当一定时间后连接不再活跃时，该事件将会被触发，通知用户当前该连接已经被闲置了。  

### Nagle算法  
TCP针对网络中的小数据包有一定的优化策略：Nagle算法。  
如果每次发送一个很小的数据包，比如一个字节内容的数据包而不优化，就会导致网络中只有极少数有效数据的数据包，这会导致浪费大量的网络资源。Nagle算法针对这种情况，要求缓存区的数据达到一定数据量或者一定时间后才将其发出，所以数据包将会被Nagle算法合并，以此来优化网络。这种优化虽然提高了网络带宽的效率，但有的数据可能会被延迟发送。

在Nodejs中，由于TCP默认启动Nagle算法，可以调用socket.setNoDelay(ture)去掉Nagle算法，使得write()可以立即发送数据到网络中。但需要注意的是，尽管在网络的一端调用write()会触发另一端的data事件，但是并不是每次write()都会触发另一端的data事件，再关闭Nagle算法后，接收端可能会将接收到的多个小数据包合并，然后只触发一次data事件。也就是说socket.setNoDelay(ture)只能`解决一端的数据粘包问题`。

### 数据粘包  
TCP 是面向连接的传输协议，TCP 传输的数据是以流的形式，而流数据是没有明确的开始结尾边界，所以 TCP 也没办法判断哪一段流属于一个消息。 

网络通信采用的套接字(socket)技术，其实现实际是由系统内核提供一片连续缓存(流缓冲)来实现应用层程序与网卡接口之间的中转功能。 多个数据包被连续存储于连续的缓存中，在对数据包进行读取时由于无法确定发生方的发送边界，而采用某一估测值大小来进行数据读出，若双方的size不一致时就会使指发送方发送的若干包数据到接收方接收时粘成一包，从接收缓冲区看，后一包数据的头紧接着前一包数据的尾。 而UDP不会出现粘包，因为它有消息边界.  

当发送端调用socket.write(data)时，系统并不会立刻把这个包发送出去，而是把它放到一个发送缓冲区里。具体需要发送多少数据（字节），什么时候发送，是由`TCP拥塞控制策略`来决定的。同样，在接收端有一个接收缓冲区，收到的数据会先放到接收缓冲区里，然后程序再从这里读取一部分数据（字节）进行消费。  
如： A 与 B 进行 TCP 通信，A 先后给 B 发送了一个 100 字节和 200 字节的数据包，那么 B 是如何收到呢？B 可能先收到 100 字节，再收到 200 字节；也可能先收到 50 字节，再收到 250 字节；或者先收到 100 字节，再收到 100 字节，再收到 100 字节；
即作为发送方的A来说， A是知道如何划分这两个数据包的界限的； 但对于B来说，如果不人为规定多少字节作为一个数据包，B 每次是不知道应该把收到的数据中多少字节作为一个有效的数据包的，而规定每次把多少数据当成一个包就是协议格式定义的内容之一；

出现粘包的原因  
发送方引起的粘包是由TCP协议本身造成的：  

TCP为提高传输效率，发送方往往要收集到足够多的数据后才发送一包数据。若连续几次发送的数据都很少，通常TCP会根据优化算法把这些数据合成一包后一次发送出去，这样接收方就收到了粘包数据。  
![](https://img-blog.csdnimg.cn/88fbf9da4cf4439bb4e6df4f6900a364.png)      
TCP协议规定有MSS，如果数据包过长就会被分开传输。这样接收方就收到了粘包数据。  
![](https://img-blog.csdnimg.cn/d50e5b07ec16426b9af19a206c8dcca9.png)    

接收方引起的粘包是由于接收方用户进程不及时接收数据，从而导致粘包现象。这是因为接收方先把收到的数据放在系统接收缓冲区，用户进程从该缓冲区取数据，若下一包数据到达时前一包数据尚未被用户进程取走，则下一包数据放到系统接收缓冲区时就接到前一包数据之后，而用户进程根据预先设定的缓冲区大小从系统接收缓冲区取数据，这样就一次取到了多包数据。

在代码中常见体现：

- 要发送的数据大于TCP发送缓冲区剩余空间大小，将会发生拆包。
- 要发送的数据大于MSS，TCP在传输前将进行拆包。
- 要发送的数据小于TCP发送缓冲区的大小，TCP将多次写入缓冲区的数据一次发送出去，将会发生粘包。
- 接收数据端的应用层没有及时读取接收缓冲区中的数据，将发生粘包。
- ...

举例：  
client.js  
```js
const net = require("net");
const msg = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const client = net.connect({ port: 8124 }, function () {
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
```
执行结果如下：  
![执行结果](https://img-blog.csdnimg.cn/b45e74b7b9134a0aa5c30658088dec41.png)



粘包的处理方式：
1. 当时短连接的情况下，不用考虑粘包的情况
2. 如果发送数据无结构，如文件传输，这样发送方只管发送，接收方只管接收存储就ok，也不用考虑粘包
3. 如果双方建立长连接，需要在连接后一段时间内发送不同结构数据
    1. 发送端将每个数据包封装为固定长度（不够的可以通过补0填充），这样接收端每次从接收缓冲区中读取固定长度的数据就自然而然的把每个数据包拆分开来;   
    2. 可以在数据包之间设置边界，如添加特殊符号，这样，接收端通过这个边界就可以将不同的数据包拆分开;     
    3. 发送端给每个数据包添加包首部，首部中应该至少包含数据包的长度，这样接收端在接收到数据后，通过读取包首部的长度字段，便知道每一个数据包的实际长度了;  
    4. ...


#### 解决方案1： 固定长度
通过固定缓冲区大小解决数据粘包问题 ，只需要控制服务器端和客户端发送和接收字节的（数组）长度相同即可。
server.js改造如下：  
```js
const net = require("net");
const bufferSize = 128;
const buf = Buffer.alloc(bufferSize);
// 通过net.createServer(listeber)即可创建一个TCP服务器
const server = net.createServer(function (socket) {
  // 新的连接
  socket.on("data", function (chunk) {
    // 空间不够，进行扩容
    buf = Buffer.alloc(chunk.length > bufferSize ? chunk.length: bufferSize);
    buf.write(chunk.toString());
    //通过Socket上的write方法回写响应数据
    while(buf.length >= bufferSize) {
      let _buf = Buffer.alloc(bufferSize)
      buf.copy(_buf, 0);
      socket.write(_buf);
      buf = buf.slice(bufferSize);
    }
  });
  socket.on("end", function () {
    console.log("连接断开");
  });
});
server.listen(8125, function () {
  console.log("server bound");
});

```

client.js如下：  
```js
const net = require("net");
const msg = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const bufferSize = 128;
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
  // 空间不够，进行扩容
  buf = Buffer.alloc(chunk.length > bufferSize ? chunk.length: bufferSize);
  buf.write(chunk.toString());

  while(buf.length >= 128) {
    console.log(buf.slice(0, 128).toString());
    buf = buf.slice(128)
  }
});
client.on("end", function () {
  console.log("client disconnected");
});
```
执行结果如下：  
![执行结果](https://img-blog.csdnimg.cn/b7b81fd107af44cca3e3c3f8cad228dd.png)    
缺点： 这种固定缓冲区大小的方式增加了不必要的数据传输，因为这种方式当发送的数据比较小时会使用0（`Buffer.alloc(size[, fill[, encoding]])， 如果没有设置 fill，则默认填满 0`）来弥补，所以这种方式就增加了网络传输的负担    

#### 解决方案2： 数据包之间设置边界    
应用层在发送消息前和发送消息后标记一个特殊的标记符，比如 ' \r\n '符号，当接收方读取消息时，根据'\r\n'符号的流码来截取消息的开始和结尾。
server.js改造如下：  
```js
const net = require("net");
// 标记符
const delimiter = '\r\n';
let rest;
// 通过net.createServer(listeber)即可创建一个TCP服务器
const server = net.createServer(function (socket) {
  // 新的连接
  socket.on("data", function (chunk) {
    let data = chunk;
    // 如果有剩余
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
```

client.js如下：  
```js
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
  // 如果有剩余
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
      data.length && (rest = data);
      break;
    }
  }
  
});
client.on("end", function () {
  console.log("client disconnected");
});
```
![执行结果](https://img-blog.csdnimg.cn/446f42cb560345729507b3d831a794bd.png)   
缺点： 在于发送的消息内容里面本身就包含用于切分消息的特殊符号，所以在定义消息切分符时候尽量用特殊的符号组合    

#### 解决方案3： 数据包添加包首部, 组合边界  
先是定义一个Header+Body格式， Body里面是消息内容, 那么如何设计Header呢？ 
可以在header消息头里面定义一个开始标记+一个内容的长度，这个内容长度就是Body的实际长度，Body里面是消息内容，当接收方接收到数据流时，先根据消息头里的特殊标记来区分消息的开始，获取到消息头里面的内容长度描述时，再根据内容长度描述来截取Body部分；    
借(chao)鉴(xi) https://www.cnblogs.com/ZheOneAndOnly/p/16141896.html 上解决方案：   
基于定长的消息头头和不定长的消息体，封包拆包实现数据在流中的标识：

消息头：也就是间隔数据的标识，采用定长的方式就可以实现有规律的获取这些数据标识。消息头中包括消息系列号、消息长度。  
消息体：要传输的数据本身。  
![](https://img-blog.csdnimg.cn/a20099170b0b42748ef730d416711198.png)  
 
transfer.js代码：  
```js
const transfer = function () {
    this.packageHeaderLen = 4;  //设置定长的消息头字节长度
    this.serialNum = 0;         //消息序列号
    this.serialLen = 2;         //消息头中每个数据占用的字节长度（序列号、消息长度值）
    
    this.encode = function (data, serialNum) {
        const body = Buffer.from(data); // 将要传输的数据转换成二进制
        // 先按照指定的长度来申请一片内存空间作为消息头header来使用
        const headerBuf = Buffer.alloc(this.packageHeaderLen);
        // 写入包的头部数据
        headerBuf.writeInt16BE(serialNum || this.serialNum);//将当前消息编号以16进制写入
        headerBuf.writeInt16BE(body.length, this.serialLen);//将当前write()写入的数据的二进制长度作为消息的长度写入
        // 如果没有传入指定的序列号，表示在初始化写入，消息序列号+1
        if(serialNum === undefined){
            this.serialNum++;  
        }
        // 将消息头和消息体合并成一个Buffer返回，交给TCP发送端
        return Buffer.concat([headerBuf, body]); 
    }
    // 解码
    this.decode = function (buffer) {
        const headerBuf = buffer.slice(0, this.packageHeaderLen);   // 获取消息头的二进制数据
        const bodyBuf = buffer.slice(this.packageHeaderLen);        // 获取消息体的二进制数据
        return {
            serialNum: headerBuf.readInt16BE(),
            bodyLength: headerBuf.readInt16BE(this.serialLen),
            body: bodyBuf.toString()
        };
    }
    // 获取数据包长度的方法
    this.getPackageLen = function (buffer) {
        // 当数据长度小于数据包头部的长度时，说明它的数据是不完整的，返回0表示数据还没有完全传输到接收端
        if (buffer.length < this.packageHeaderLen){
            return 0;   
        } else {
            //数据包头部长度+加上数据包消息体的长度(从数据包的头部数据中获取)，就是数据包的实际长度
            return this.packageHeaderLen + buffer.readInt16BE(this.serialLen);  
        }
    }
}
module.exports = transfer;
```

server.js代码：  
```js
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

```

client.js代码：  
```js
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
```
运行结果就不截图了，有兴趣可以自己试试。   

另外，让我们看下 https://github.com/lvgithub/stick 上的解决方案： 对要发送的数据按协议编码，把数据 data 分为 header +body 两部分，header 默认固定长度（2 byte），header描述的是 body 数据的长度。由于header定长，因此可以通过header，解析出 body 的内容。
部分代码如下：  
```js
const EventEmitter = require('events').EventEmitter;
const StackBuffer = function (bufferLength) {
    const _event = new EventEmitter();
    let _dataHeadLen = 2; 
    let _bufferLength = bufferLength || 512; // buffer默认长度
    let _buffer = Buffer.alloc(bufferLength || _bufferLength); // 申请内存
    let _dataLen = 0; // 已经接收数据的长度

    let _dataWritePosition = 0; // 数据存储起始位置
    let _dataReadPosition = 0; // 数据存储结束位置


    this.putData = function (data) {
        if (data == undefined) {
            return;
        }
    
        //要拷贝数据的起始位置
        let dataStart = 0;
        // 要拷贝数据的结束位置
        let dataLength = data.length;
        // 缓存剩余可用空间
        let availableLen = _bufferLength - _dataLen;

        // buffer剩余空间不足够存储本次数据
        if (availableLen < dataLength) {
            // 以512字节为基数扩展Buffer空间
            let exLength = Math.ceil((_dataLen + dataLength) / 512) * 512;
            let tempBuffer = Buffer.alloc(exLength);
            _bufferLength = exLength;

            // 需要重新打包

            // 数据存储在buffer的尾部+头部的顺序
            if (_dataWritePosition < _dataReadPosition) {
                let dataTailLen = _bufferLength - _dataReadPosition;

                // 将 `_buffer` 字节 _dataReadPosition 到 _bufferLength 复制到 `tempBuffer` 中，从 `tempBuffer` 的字节 0 开始
                _buffer.copy(tempBuffer, 0, _dataReadPosition, _bufferLength);

                // 将 `_buffer` 字节 0 到 _dataWritePosition 复制到 `tempBuffer` 中，从 `tempBuffer` 的字节 dataTailLen 开始
                _buffer.copy(tempBuffer, dataTailLen, 0, _dataWritePosition);
            } else {
                _buffer.copy(tempBuffer, 0, _dataReadPosition, _dataWritePosition);
            }
            _buffer = tempBuffer;
            tempBuffer = null;

            _dataReadPosition = 0;
            _dataWritePosition = _dataLen;
            data.copy(_buffer, _dataWritePosition, dataStart, dataStart + dataLength);

            _dataWritePosition += dataLength;
        } // 数据长度超出buffer空间
        else if (_dataWritePosition + dataLength > _bufferLength) {
            /*   分两次存储到buffer：
             *   1、存储在原数据尾部 
             *   2、存储在原数据头部
            */
            // buffer尾部剩余空间的长度
            let bufferTailLength = _bufferLength - _dataWritePosition;
             
            // 数据尾部位置
            let dataEndPosition = dataStart + bufferTailLength;
            data.copy(_buffer, _dataWritePosition, dataStart, dataEndPosition);

            _dataWritePosition = 0;
            dataStart = dataEndPosition;

            // data剩余未拷贝进缓存的长度
            let unDataCopyLen = dataLength - bufferTailLength;
            data.copy(_buffer, _dataWritePosition, dataStart, dataStart + unDataCopyLen);
            
            // 记录buffer可写位置
            _dataWritePosition = _dataWritePosition + unDataCopyLen;
        }
        // 剩余空间足够存储数据 
        else {
            // 拷贝数据到buffer
            data.copy(_buffer, _dataWritePosition, dataStart, dataStart + dataLength);
           
            // 记录buffer可写位置
            _dataWritePosition = _dataWritePosition + dataLength;
        }
        // 记录数据长度
        _dataLen = _dataLen + dataLength;
        // 读取数据
        getData();
    
    }

    // 获取数据
    function getData() {
        while (true) {
            // 没有数据可读,不够解析出包头
            if (getDataLen() <= _dataHeadLen) {
                break;
            }
            // 解析包头长度
            // 尾部最后剩余可读字节长度
            let buffLastCanReadLen = _bufferLength - _dataReadPosition;
            let dataLen = 0;
            let headBuffer = Buffer.alloc(_dataHeadLen);
            // 数据包为分段存储，不能直接解析出包头
            if (buffLastCanReadLen < _dataHeadLen) {
                // 取出第一部分头部字节
                _buffer.copy(headBuffer, 0, _dataReadPosition, _buffer.length);
                // 取出第二部分头部字节
                let unReadHeadLen = _dataHeadLen - buffLastCanReadLen;
                _buffer.copy(headBuffer, buffLastCanReadLen, 0, unReadHeadLen);
                
                dataLen = headBuffer.readInt16BE() + _dataHeadLen;
            }
            else {
                _buffer.copy(headBuffer, 0, _dataReadPosition, _dataReadPosition + _dataHeadLen);
                dataLen = headBuffer.readInt16BE();
                dataLen += _dataHeadLen;
            }
            // 数据长度不够读取，直接返回
            if (getDataLen() < dataLen) {
                break;
            }
            // 数据够读，读取数据包 
            else {
                let readData = Buffer.alloc(dataLen);
                // 数据是分段存储，需要分两次读取
                if (_bufferLength - _dataReadPosition < dataLen) {
                    let firstPartLen = _bufferLength - _dataReadPosition;
                    // 读取第一部分，直接到字符尾部的数据
                    _buffer.copy(readData, 0, _dataReadPosition, firstPartLen + _dataReadPosition);
                    // 读取第二部分，存储在开头的数据
                    let secondPartLen = dataLen - firstPartLen;
                    _buffer.copy(readData, firstPartLen, 0, secondPartLen);
                    _dataReadPosition = secondPartLen;
                }
                // 直接读取数据
                else {
                    _buffer.copy(readData, 0, _dataReadPosition, _dataReadPosition + dataLen);
                    _dataReadPosition += dataLen;
                }

                try {
                    // console.log('emit data');
                    _event.emit('data', readData);
                    _dataLen -= readData.length;
                    // 已经读取完所有数据
                    if (_dataReadPosition === _dataWritePosition) {
                        break;
                    }
                } catch (e) {
                    _event.emit('error', e);
                }
            }
        }
    }

    this.publishMsg = function (msg) {
        const bodyBuf = Buffer.from(msg);
        const headerBuf = Buffer.alloc(_dataHeadLen);
    
        headerBuf.writeInt16BE(bodyBuf.byteLength, 0);
    
        const msgBuf = Buffer.alloc(headerBuf.length + bodyBuf.length);
        // 拷贝缓冲区
        headerBuf.copy(msgBuf, 0, 0, headerBuf.length);
        bodyBuf.copy(msgBuf, headerBuf.length, 0, bodyBuf.length);
    
        return msgBuf;
    };

    // 获取缓存数据长度
    function getDataLen() {
        let dataLen = 0;
        // 缓存全满
        if (_dataLen === _bufferLength && _dataWritePosition >= _dataReadPosition) {
            dataLen = _bufferLength;
        }
        // 缓存全部数据读空
        else if (_dataWritePosition >= _dataReadPosition) {
            dataLen = _dataWritePosition - _dataReadPosition;
        }
        else {
            dataLen = _bufferLength - _dataReadPosition + _dataWritePosition;
        }

        return dataLen;
    }

    // 数据包接收完整后触发事件
    this.onMsgRecv = function (callback) {
        _event.on('data', (data) => {
            const headLen = _dataHeadLen;
            const head = Buffer.alloc(headLen);
            data.copy(head, 0, 0, headLen);

            const dataLen = head.readInt16BE();
            const body = Buffer.alloc(dataLen);
            data.copy(body, 0, headLen, headLen + dataLen);

            callback(body);
        });
    };
}
module.exports = exports = StackBuffer; 
```

server.js代码：   
```js
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
```

client.js代码：  
```js
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
```
效果就不截图了。    


参考资料：  
https://blog.csdn.net/qq_40571533/article/details/112761660  
https://zhuanlan.zhihu.com/p/342181747   
https://www.zhihu.com/question/20210025  

# 构建UDP服务 
UDP（User Datagram Protocol）又称用户数据包协议，与TCP一样同属于网络传输层。UDP与TCP最大的不同是UDP不是面向连接的。TCP中连接一旦建立，所有的会话都基于连接完成，客户端如果要与另一个TCP服务通信，需要另创造一个套接字来完成连接。但在UDP中，一个套接字可以与多个UDP服务通信，它虽然提供面向事务的简单不可靠信息传输服务，在网络差的情况下存在丢包严重的问题，但是由于它无须连接，资源消耗低，处理快速且灵活，所以常常应用在那种偶尔丢一两个数据包也不会产生重大影响的场景，比如音频、视频。UDP目前应用很广泛，DNS服务即是基于它实现的。

## 创建UDP套接字
UDP套接字一旦创建，既可以作为客户端发送数据，也可以作为服务器端接收数据  
```js
const dgram = require('dgram');
const socket = dgram.createSocket("udp4");
```

## 创建UDP服务器端 
```js
const dgram = require("dgram");
const server = dgram.createSocket("udp4");
server.on("message", function (msg, rinfo) {
  console.log( "server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
});
server.on("listening", function () {
  const address = server.address();
  console.log("server listening " + address.address + ":" + address.port);
});
server.bind(41234);
```
该套接字将接收所有网卡上41234端口上的消息。在绑定完成后，将触发listening事件。 

## 创建UDP客户端 
```js
const dgram = require("dgram");
const message = new Buffer.from("学习Node.js网络编程");
const client = dgram.createSocket("udp4");
client.send(message, 0, message.length, 41234, "localhost", function (err, bytes) {
  client.close();
});
```
运行器服务器端、客户端后，服务器端的命令行将会有以下输出：  
![](https://img-blog.csdnimg.cn/7efd8e08bec84ef2bd72fa9f937b04ff.png)  
当套接字对象用在客户端时，可以调用send()方法发送消息到网络中。send()方法的参数如下: 
socket.send(buf, offset, length, port, address, [callback])  
这些参数分别为要发送的Buffer、Buffer的偏移、Buffer的长度、目标端口、目标地址、发送完成后的回调。与TCP套接字的write()相比，send()方法的参数列表相对复杂，但是它更灵活的地方在于可以随意发送数据到网络中的服务器端，而TCP如果要发送数据给另一个服务器端，则需要重新通过套接字构造新的连接。 

## UDP套接字事件 
UDP套接字相对TCP套接字使用起来更简单，它只是一个EventEmitter的实例，而非Stream的实例。它具备如下自定义事件：
- message: 当UDP套接字监听网卡端口后，接收到消息时触发该事件，触发携带的数据为消息Buffer对象和一个远程地址消息。
- listening: 当UDP套接字开始监听时触发该事件。
- close: 调用close()方法时触发该事件，并不再触发message事件。如需再次触发message事件，重新绑定即可。
- error: 当异常发生时触发该事件，如果不监听，异常将直接抛出，使进程退出。

# 构建HTTP服务
以下代码就可以构建一个简单的HTTP服务：  
```js
const http = require('http'); 
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
```
## HTTP 
HTTP(HyperText Transfer Protocol)， 超文本传输协议。HTTP构建在TCP之上，属于应用层协议。在HTTP的两端是服务器和浏览器，即著名的B/S模式。  

### HTTP报文 
在启动以上服务器端代码后，我们使用curl命令显示这次网络通信的所有报文信息，如下所示：   
![结果](https://img-blog.csdnimg.cn/04d856b3f43145928482392cfdaab2db.png)  
从上述信息中我们可以看到这次网络通信的报文信息分为几个部分，第一部分内容为经典的TCP的3次握手过程，如下所示：   
```
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to 127.0.0.1 (127.0.0.1) port 1337 (#0)
```
第二部分是在完成握手之后，客户端向服务器端发送请求报文，如下所示：   
```
> GET / HTTP/1.1
> Host: 127.0.0.1:1337
> User-Agent: curl/7.64.1
> Accept: */*
> 
```
第三部分是服务器端完成处理后，向客户端发送响应内容，包括响应头和响应体，如下所示：  
```
< HTTP/1.1 200 OK
< Content-Type: text/plain
< Date: Sat, 07 May 2022 01:26:03 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
< Transfer-Encoding: chunked
< 
Hello World
``` 
最后部分是结束会话的信息，如下所示：  
```
* Connection #0 to host 127.0.0.1 left intact
* Closing connection 0
```
从上述报文信息中可以看出HTTP的特点，它是基于请求响应式的，以一问一答的方式实现服务，虽然基于TCP会话，但是本身却无会话的特点。 
无论是HTTP请求报文还是HTTP响应报文，报文内容都包含两个部分：报文头和报文体。
上面的报文代码中>和<部分属于报文的头部，由于是GET请求，请求报文中没有包含报文体，响应报文中的Hello World即是报文体。

### http模块
Node的http模块包含对HTTP处理的封装。在Node中，HTTP服务继承自TCP服务器(net模块)，它能够与多个客户端保持连接，由于其采用事件驱动的形式，并不为每一个连接创建额外的线程或进程，保持很低的内存占用，所以能实现高并发。HTTP服务与TCP服务模型有区别的地方在于，在开启keepalive后，一个TCP会话可以用于多次请求和响应。TCP服务以connection为单位进行服务，HTTP服务以request为单位进行服务。http模块即是将connection到request的过程进行了封装，示意图如下：  
![http模块将connection到request的过程进行了封装](https://img-blog.csdnimg.cn/209d1c45757a43afa0a6645c1e1194bf.png)  
除此之外，http模块将连接所用套接字的读写抽象为为ServerRequest和ServerResponse对象， 它们分别对应请求和响应操作。在请求产生的过程中，http模块拿到连接中传来的数据，调用二进制模块http_parser进行解析，在解析完请求报文的报头后，触发request事件，调用用户的业务逻辑。该流程的示意图如下所示：   
![http模块产生请求的流程](https://img-blog.csdnimg.cn/5294db437246416cb1a75612fddab13a.png)     
1. HTTP请求
对于TCP连接的读操作，http模块将其封装为ServerRequest对象。报文头部将会通过http_parser进行解析, 请求报文代码如下所示：  
```
> GET / HTTP/1.1
> Host: 127.0.0.1:1337
> User-Agent: curl/7.64.1
> Accept: */*
```
报文头第一行GET / HTTP/1.1被解析之后分解为以下属性：  
- req.method属性: 值为GET，是为请求方法，常见的请求方法有GET、POST、DELETE、PUT、CONNECT等几种；
- req.url属性: 值为/；
- req.httpVersion属性: 值为1.1。
其余报头是很规律的Key: Value格式，被解析后放置在req.headers属性上传递给业务逻辑以供使用，如下所示：   
```
headers: { 'User-Agent': 'curl/7.64.1', accept: '*/*' }
```
报文体部分则抽象为一个只读流对象，如果业务逻辑需要读取报文体中的数据，则要在这个数据流结束后才能进行操作，如下所示：  
```js
function (req, res) {
  // console.log(req.headers);
  const buffers = [];
  req.on('data', function (trunk) {
    buffers.push(trunk); 
  }).on('end', function () {
    const buffer = Buffer.concat(buffers); 
    // TODO
    res.end('Hello world');
  }); 
}
```
HTTP请求对象和HTTP响应对象是相对较底层的封装，Connect和Express都是在这两个对象的基础上进行封装完成的。  
2. HTTP响应  
HTTP响应封装了对底层连接的写操作，可以将其看出一个可写的流对象。它影响响应报文头部信息的API为res.setHeader()和res.writeHead()。  
```js
res.writeHead(200, {'Content-Type': 'text/plain'});
```
其分为setHeader()和writeHead()两个步骤。它在http模块的封装下，实际生成如下报文：   
```
< HTTP/1.1 200 OK
< Content-Type: text/plain
```
我们可以调用setHeader进行多次设置，但只有调用writeHead后，报头才会写入到连接中。此外，http模块会自动帮你设置一些头信息，如下所示：  
```
< Date: Sat, 07 May 2022 01:26:03 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
< Transfer-Encoding: chunked
```
#### setHeader   
`注意：`
- 只能一个一个设置属性；
- 重复设置一个属性会替换之前的设置；
- 设置包含无效字符的属性字段名称或值将导致抛出 TypeError  

例子：  
```js
const http = require("http");
http.createServer(function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    // 会替换之前的设置
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('X-Foo', 'bar');
    res.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']); 
    res.end("Hello World\n");
}).listen(1337, "127.0.0.1");
```
![](https://img-blog.csdnimg.cn/5edfcc8256644e9cab418ed0930a7ae7.png)  

#### writeHead  
```js
/**
 * statusCode http状态码
 * statusMessage 状态信息（可选）
 * headers 属性对象或数组（可选）
*/
response.writeHead(statusCode, [statusMessage], [headers])
```
例子：  
```js
const http = require("http");
http.createServer(function (req, res) {
    res.writeHead(200, 'success', { "Content-Type": "text/plain", "X-Foo": "bar" });
    res.end("Hello World\n");
}).listen(1337, "127.0.0.1");
```
![](https://img-blog.csdnimg.cn/1ff5290169454ac0adf833857b23955d.png)   
`注意:`  

- 可以设置多个属性，setHeader只能设置一个
- 只能调用一次
- 必须在response.end()之前调用
- 设置包含无效字符的属性字段名称或值将导致抛出 TypeError

因为writeHead返回的是一个ServerResponse对象，我们可以进行链式调用  
```js
let body = 'hello world';
response
  .writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/plain'
  })
  end(body);
```
这里的Content-Length是以字节为单位，而不是字符。Buffer.byteLength()就是来确定正文的长度。  

Nodejs不会检查Content-Length和已经传输的正文长度是否一致   

同时使用setHeader和writeHead例子：  
```js
// Returns content-type = text/plain
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});
```
writeHead 的优先级比 setHeader 高，并且writeHead只能调用一次，所以在调用时，先考虑好哪些头不常改变后，再调用writeHead.
如果已经调用了setHeader设置标头，那么它会传给writeHead合并；如果调用了此方法，且还没调用 response.setHeader()，则会直接将提供的标头值写入网络通道且内部不缓存。在标头上 response.getHeader()) 不会产生预期的结果。 如果需要逐步填充标头并在未来进行潜在的检索和修改，则改用 response.setHeader()。  

报文体部分则是调用res.write()和res.end()方法实现，后者与前者的区别在于res.end()会先用write()发送数据，然后发送信号告知服务器这次响应结束，响应结束如下所示：  
```
Hello World
```
响应结束后，HTTP服务器可能会将当前的连接用于下一个请求，或者关闭连接。值得注意的是，`报头是在报文体发送前发送的，一旦开始了数据的发送，writeHead()和setHeader()将不不再生效。这由协议的特性决定。`  
另外，无论服务器端在处理业务逻辑时是否发生异常，务必在结束时调用res.end()结束请求，否则客户端将一直处于等待的状态。当然，也可以通过延迟res.end()的方式实现客户端与服务器端之间的长连接，但结束时务必关闭连接。  

3. HTTP服务的事件  
- connection事件：在开始HTTP请求和响应前，客户端与服务器端需要建立TCP连接，这个连接可能因为开启了keep-alive，可以在多次请求响应之间使用；当这个连接建立时，服务器触发一次connection事件；  
- request事件： 建立TCP连接后，http模块底层将在数据流中抽象出HTTP请求和HTTP响应，当请求数据发送到服务器端，在解析出HTTP请求头后，将会触发该事件；在res.end() 后，TCP连接可能将用于下一次请求响应；  
- close事件：与TCP服务器的行为一制，调用server.close()方法停止接受新的连接，当已有的连接都断开时，触发该事件；可以给server.close()传递一个回调函数来快速注册该事件；
- checkContinue事件： 某些客户端在发送较大的数据时，并不会将数据直接发送，而是先发送一个头部带Expect: 100-continue的请求到服务器，服务器将会触发checkContinue事件；如果没有为服务器监听这个事件，服务器将会自动响应客户端100 Continue的状态码，表示接受数据上传；如果客户端应该继续发送请求正文，则处理此事件涉及调用 response.writeContinue()，或者如果客户端不应该继续发送请求正文，则生成适当的 HTTP 响应（例如 400 Bad Request）。两个事件之间互斥。当客户端收到100 Continue后重新发起请求时，才会触发request事件；
- connect事件：客户端发起CONNECT请􏰎时触发，而发起CONNECT请求通常在HTTP代理时出现；如果不监听该事件，发起该请求的连接将会关闭；
- upgrade事件：客户端要求升级连接接的协议时，需要和服务器端协商，客户端会在请求头中带上Upgrade字段，服务器端会在接收到这样的请求时触发该事件。如果不监听该事件，发起该请求的连接将会关闭；
- clientError事件：连接的客户端触发error事件时，这个错误会传递到服务器端，此时触发该事件。  

### HTTP客户端  
以下代码与上文中的curl命令大致相同：  
```js
const http = require("http");
const options = { hostname: "127.0.0.1", port: 1337, path: "/" };
const req = http.request(options, function (res) {
  console.log("STATUS: " + res.statusCode);
  console.log("HEADERS: " + JSON.stringify(res.headers));
  res.setEncoding("utf8");
  res.on("data", function (chunk) {
    console.log(chunk);
  });
});
req.end();
```
执行结果如下：  
```
$ node client.js
STATUS: 200
HEADERS: {"date":"Mon, 07 May 2022 07:46:01 GMT","connection":"close","content-length":"12"}
Hello World
```

其中options参数决定了这个HTTP请头中的内容，它的选项有如下这些：  
参考https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules__types_node_http_d_._http_.clientrequestargs.html  
> host: 服务器的域名或IP地址，默认为localhost；  
> hostname: 服务器名称；  
> localAddress: 建立网络连接的本地网卡；  
> port: 请求网站的端口，默认为 80；  
> socketPath: Domain套接字路径；  
> method: HTTP请求方法，默认为GET；  
> path: 请求路径，默认是'/'。QueryString应该包含在其中。例如：/index.html?keyword=test；  
> headers: 请求头对象；  
> auth: Basic认证（基本身份验证），这个值将被计算成请求头中的 Authorization 部分；  
> 此外还有_defaultAgent、agent、createConnection、defaultPort、family、maxHeaderSize、protocol、setHost、timeout等    
报文体的内容由请求对象的write()和end()方法实现：通过write()方法向连接中写入数据， 通过end()方法告知报文结束。它与浏览器中的Ajax调用几近相同，Ajax的实质就是一个异步的网络HTTP请求。  
1. HTTP响应  
HTTP客户端的响应对象与服务器端口较为类似，在ClientRequest对象中，它的事件叫做response。ClientRequest在解析响应报文时，一解析完响应头就触发response事件，同时传递一个响应对象以供操作ClientResponse。后续响应报文体以只读流的方式提供，如下所示：  
```js
function(res) {
  console.log('STATUS: ' + res.statusCode); 
  console.log('HEADERS: ' + JSON.stringify(res.headers)); 
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log(chunk); 
  });
}
```
2. HTTP代理  
http提供的ClientRequest对象也是基于TCP层实现的，在keepalive的情􏰸下，一个底层会话连接可以多次用于请求。为了重用TCP连接，http模块包含一个默认的客户端代理对象http.globalAgent。它对每个服务􏰍端(host + port)创建的连接进行了管理，默认情况下，通过ClientRequest对象对同一个服务器端发起的HTTP请求最多可以创建5个连接。它的实质是一个连接池，如下图所示：    
![](https://img-blog.csdnimg.cn/994172a058284f4184a9ac26d1444bac.png)  
调用HTTP客户端同时对一个服务器发起10次HTTP请求时，其实质只有5个请求处于并发状态，后续的请求需要等待某个请求完成服务后才真正发出。这与浏览器对同一个域名有下载连接数的限制是相同的行为。  
如果你在服务器端通过ClientRequest调用网络中的其他HTTP服务，记得关注代理对象对网络请求的限制。一旦请求量过大，连接限制将会限制服务性能。如需要改变，可以在options中传递agent选项。默认情况下，请求会调用全局的代理对象，默认连接数限制为5。
我们既可以自行构造代理对象，代码如下：  
```js
const http = require('http');
const agent = new http.Agent({
  maxSockets: 10
});
const option = {
	hostname: '127.0.0.1',
	port: 1337,
	method: 'get',
	path: '/',
	agent: agent
}
http.request(option, function(res) {
	// do something
});
```
也可以传agent为false来取消这个http请求的keep-alive的行为, 以脱离连接池的管理，使得请求不受并发的限制。
Agent对象的sockets和requests属性分别表示当前连接池中使用中的连接数和处于等待状态的请求数，在业务中监视这两个值有助于发现业务状态的繁忙程度。  
3. HTTP客户端事件  
- response：与服务器端的request事件对应的客户端在请求发出后得到服务器端响应时， 会触发该事件；  
- socket：当底层连接池中建立的连接分配给当前请求对象时，触发该事件；  
- connect：当客户端向服务器端发送CONNECT请求时，如果服务器端响应了200状态码，客户端将会触发改事件；  
- upgrade：客户端向服务器端发起Upgrade请求时，如果服务器端响应了101 Switching Protocols状态，客户端将会触发该事件；  
- continue：客户端向服务器端发起Expect: 100-continue头信息，以试图发送较大数据量， 如果服务器端响应100 Continue状态，客户端将触发该事件。  

# TLS/SSL
1. 密钥  
TLS/SSL是一个公钥/私钥的结构，它是一个非对称的结构，每个服务器端和客户端都有自己的公私钥。公钥用来加密要传输的数据，私钥用来解密接收到的数据。公钥和私钥是配对的，通过公钥加密的数据，只有通过私钥才能解密，所以在建立安全传输之前，客户端和服务器端之间需要互换公钥。客户端发送数据时要通过服务器端的公钥进行加密，服务器端发送数据时则需要客户端的公钥进行加密，如此才能完成加密解密的过程，如图所示：  
![客户端和服务器端交换密钥](https://img-blog.csdnimg.cn/47ac681b84ce42bc822a600f9b5bc346.png)  
Node在底层采用的是openssl实现TLS/SSL的，为此要生成公钥和私钥可以通过openssl完成。我们分别为服务器端和客户端生成私钥，如下所示：  
```
// 生成服务器端私钥   
openssl genrsa -out server/keys/server.key 1024   
// 生成客户端私钥  
openssl genrsa -out client/keys/client.key 1024
```
上述命令生成了两个1024位长的RSA私钥文件，我们可以通过它继续生成公钥，如下：  
```
openssl rsa -in server/keys/server.key -pubout -out server/keys/server.pem
openssl rsa -in client/keys/client.key -pubout -out client/keys/client.pem
```
中间人攻击  
客户端和服务器端在交换公钥的过程中，中间人对客户端扮演服务器端的角色，对服务器端扮演客户端的角色，因此客户端和服务器端几乎感受不到中间人的存在。为了解决这种问题，数据传输过程中还需要对得到的公钥进行认证，以确认得到的公钥是出自目标服务器。如果不能保证这种认证，中间人可能会将伪造的站点响应给用户，如下图：   
![](https://img-blog.csdnimg.cn/f0ed4abaa222451eb3081e811aec1cbe.png)    
为了解决这个问题，TLS/SSL引入了数字证书来进行认证。与直接用公钥不同，数字证书中包含了服务器的名称和主机名、服务器的公钥、签名颁发机构的名称、来自签名颁发机构的签名。 在连接建立前，会通过证书中的签名确认收到的公钥是来自目标服务器的，从而产生信任关系。
2. 数字证书  
为了确保我们的数据安全，现在我们引入了一个第三方：CA(Certificate Authority，数字证书认证中心)。CA的作用是为站点颁发证书，且这个证书中具有CA通过自己的公钥和私钥实现的签名。   
为了得到签名书，服务器端需要通过自己的私钥生成CSR(Certificate Signing Request，证书签名请求)文件。CA机构将通过这个文件颁发属于该服务器端的签名证书，只要通过CA机构就能验证证书是否合法。  
自签名证书  
所谓自签名证书，就是自己扮演CA机构，给自己得服务器端颁发签名证书。以下为生成私钥、生成CSR文件、通过私钥自签名生成证书得过程：
```
openssl genrsa -out ca/ca.key 1024
// 生成CSR文件
openssl req -new -key ca/ca.key -out ca/ca.csr
openssl x509 -req -in ca/ca.csr -signkey ca/ca.key -out ca/ca.crt

```
服务器端需要向CA机构申请签名证书。  
生成带有CA签名的证书  
```
// 生成CSR文件
openssl req -new -key server/keys/server.key -out server/keys/server.csr
// 签名过程需要CA的证书和私钥参与， 最终颁发一个带有CA签名的证书
openssl x509 -req -CA ca/ca.crt -CAkey ca/ca.key -CAcreateserial -in server/keys/server.csr -out server/keys/server.crt

// 客户端生成属于自己的签名
// 生成CSR文件
openssl req -new -key client/keys/client.key -out client/keys/client.csr
// 签名过程需要CA的证书和私钥参与， 最终颁发一个带有CA签名的证书
openssl x509 -req -CA ca/ca.crt -CAkey ca/ca.key -CAcreateserial -in client/keys/client.csr -out client/keys/client.crt
```
客户端在发起安全连接前会去获取服务器端的证书，并通过CA的证书验证服务器端证书的真伪。除了验证真伪外，还含有对服务器名称、IP地址等进行验证的过程。这个验证过程如下：  
![客户端通过CA验证服务器端证书的真伪过程示意图](https://img-blog.csdnimg.cn/6b823480bdef4c838b482d3cd2b11744.png)   
CA机构将证书颁发给服务器端后，证书在请求的过程中会被发送给客户端，客户端需要通过CA的证书验证真伪。如果是知名的CA机构，它们的证书一般预装在浏览器中。如果是自己扮演CA机构，颁发自有签名证书则不能享受这个福利，客户端需要获取到CA的证书才能进行验证。  
上述的过程中可以看出，签名证书是一环一环地颁发的，但是在CA那里的证书是不需要上级证书参与签名的，这个证书我们通常称为根证书。  

# TLS服务  
1. 创建服务器端  
通过以上代码准备好证书后，我们通过Node的tls模块来创建一个安全的TCP服务， 这个服务是一个简单的echo服务，代码如下：  
```js
const tls = require("tls");
const fs = require("fs");
const options = {
  key: fs.readFileSync("./keys/server.key"),
  cert: fs.readFileSync("./keys/server.crt"),
  requestCert: true,
  ca: [fs.readFileSync("../ca/ca.crt")],
};
const server = tls.createServer(options, function (stream) {
  console.log("server connected", stream.authorized ? "authorized" : "unauthorized");
  stream.write("welcome!\n");
  stream.setEncoding("utf8");
  stream.pipe(stream);
});
server.listen(8000, function () {
  console.log("server bound");
});

```
启动服务后，通过下面的命令可以测试证书是否正常：  
```
openssl s_client -connect 127.0.0.1:8000
```  
`注意：`  s_client为一个SSL/TLS客户端程序，与s_server对应，它不仅能与s_server进行通信，也能与任何使用ssl协议的其他服务程序进行通信    
结果如下：  
![openssl s_client结果](https://img-blog.csdnimg.cn/4becd1c5f946458dadb8da248c9ba1ce.png)  

2. TLS客户端  
`注意: 在生成CSR文件提示输入Common Name时， 可填写为 dev.test.com， 方便测试使用（需要绑定host） `   
客户端代码如下：    
```js
const fs = require("fs");
const tls = require("tls");
const options = {
  host: 'dev.test.com',
  key: fs.readFileSync("./keys/client.key"),
  cert: fs.readFileSync("./keys/client.crt"),
  ca: [fs.readFileSync("../ca/ca.crt")],
  rejectUnauthorized: true
};
const stream = tls.connect(8000, options, function () {
  console.log("client connected",stream.authorized ? "authorized" : "unauthorized");
  process.stdin.pipe(stream);
});
stream.setEncoding("utf8");
stream.on("data", function (data) {
  console.log(data);
});
stream.on("end", function () {
  server.close();
});

```

执行node client.js 结果如下：  
```
client connected authorized
welcome!
```
服务器端输出结果：   
```
server bound
server connected authorized
```
此时客户端启动后可以在输入流中输入数据，服务器端将会回应相同的数据。  

# HTTPS服务  
HTTPS服务就是工作在TLS/SSL上的HTTP。  
1. 准备证书  
过程见以上内容。  
2. 创建HTTPS服务  
```js
const https = require("https");
const fs = require("fs");

const options = {
  key: fs.readFileSync("./keys/server.key"),
  cert: fs.readFileSync("./keys/server.crt")
};


https
  .createServer(options, function (req, res) {
    res.writeHead(200);
    res.end("hello world\n");
  }).listen(8000);
```
启动后通过curl进行测试：  
```
$ curl https://localhost:8000 
curl: (60) SSL certificate problem: unable to get local issuer certificate
More details here: https://curl.haxx.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.
```
由于是自签名的证书，curl工具无法验证服务器端证书是否正确，所以出现了上述信息， 要解决上面问题有两种。一是加-k选项，让curl工具忽略掉证书的验证，这样的结果是数据依然会通过公钥加密传输，但是无法保证对方是可靠的，会存在中间人攻击的潜在风险，其结果如下所示：  
```
$ curl -k https://localhost:8000
hello world 
```
另一种解决的方式是给curl设置--cacert选项，告知CA证书使之完成对服务器证书的验证， 如下所示：  
```
$ curl --cacert ca/ca.crt https://dev.test.com:8000
hello world 
```
3. HTTPS客户端  
```js
const https = require("https");
const fs = require("fs");
const options = {
  hostname: "localhost",
  port: 8000,
  path: "/",
  method: "GET",
  // rejectUnauthorized: false,
  key: fs.readFileSync("./keys/client.key"),
  cert: fs.readFileSync("./keys/client.crt"),
  ca: [fs.readFileSync("../ca/ca.crt")],
};
options.agent = new https.Agent(options);
const req = https.request(options, function (res) {
  res.setEncoding("utf-8");
  res.on("data", function (d) {
    console.log(d);
  });
});
req.end();
req.on("error", function (e) {
  console.log(e);
});

```
执行结果：  
```
$ node client.js
hello world
```
若出现self signed certificate错误时， 可以加上属性rejectUnauthorized为false，效果与curl工具加-k一样，都会在数据传输过程中会加密，但是无法保证服务器端的证书不是伪造的。     

另外，关于WebSocket、http2等内容下一篇文章再写。  



# 参考资料
[深入浅出Node.js](https://book.douban.com/subject/25768396/)   
http://nodejs.cn/api/  
https://blog.csdn.net/qq_40571533/article/details/112761660    
https://zhuanlan.zhihu.com/p/342181747     
https://www.zhihu.com/question/20210025  
