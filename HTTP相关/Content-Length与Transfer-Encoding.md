# Content-Length是什么
> Content-Length 是一个实体消息首部，用来指明发送给接受方的消息主体的大小。Content-Length如果存在并且有效地话，则必须和消息内容的传输长度完全一致。否则就会导致异常 (特别地, HTTP1.0中这个字段可有可无)  

Content-Length首部指示出报文中实体主体的字节大小。这个大小是包含了所有内容编码的， 比如，对文本文件进行了gzip压缩的话，Content-Length首部指的就是压缩后的大小而不是原始大小。 

看下以下几种情况：  
## Content-Length == 实际长度  
```js
const http = require('http');
const server = http.createServer();
const http = require('http');
http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain',  'Content-Length': 10});
    res.end("hello world!");
}).listen(3000);
```