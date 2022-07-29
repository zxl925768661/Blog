# Content-Length是什么
> Content-Length 是一个实体消息首部，用来指明发送给接受方的消息主体的长度或 大小。Content-Length如果存在并且有效地话，则必须和消息内容的传输长度完全一致。否则就会导致异常 (特别地, HTTP1.0中这个字段可有可无) 

## HTTP1.0 测试
我们利用`curl`命令使用HTTP 1.0协议来试下：  
```js
const http = require('http');
http.createServer(function(req, res) {
    res.end("hello world!");
}).listen(3000);
```
启动服务后,我们利用`curl -v -0 localhost:3000`(-0是强制使用HTTP 1.0协议) 来查看结果：  
```
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to localhost (127.0.0.1) port 3000 (#0)
> GET / HTTP/1.0
> Host: localhost:3000
> User-Agent: curl/7.64.1
> Accept: */*
> 
< HTTP/1.1 200 OK
< Date: Tue, 28 Jun 2022 06:06:41 GMT
< Connection: close
< 
* Closing connection 0
hello world!% 
```
可以看出没有出现`Content-Length` 这个实体消息首部。  



Content-Length首部指示出报文中实体主体的字节大小。这个大小是包含了所有内容编码的， 比如，对文本文件进行了gzip压缩的话，Content-Length首部指的就是压缩后的大小而不是原始大小。 

## HTTP1.1  

`注意: 以下三种情况均在Connection: keep-alive下测试`

看下以下几种情况：  
### Content-Length == 实际长度  
```js
const http = require('http');
const server = http.createServer();
const http = require('http');
http.createServer(function(req, res) {
    const responseText = 'hello world!';
    res.writeHead(200, { 'Content-Type': 'text/plain',  'Content-Length': responseText.length});
    res.end(responseText);
}).listen(3000);
```
启动服务后， 浏览器结果如下：  
![执行结果](https://img-blog.csdnimg.cn/99555bebdf814857b414d7af9613dd1f.png)     

### Content-Length < 实际长度  
我们修改下Content-Length长度： 
```js
"Content-Length": 8
```
执行结果如下：  
![执行结果](https://img-blog.csdnimg.cn/3f2f764d88874cad94578f3eb69751db.png)  
此时输出结果为 `hello wo`

那后面的字符哪里去了？实际上是在http的响应体中直接被截取了。  

### Content-Length > 实际长度  
我们修改下Content-Length长度： 
```js
"Content-Length": 20
```
执行结果如下： 
![执行结果](https://img-blog.csdnimg.cn/20200611224550506.png)   
即如果`Content-Length` 比 实际长度大，服务端/客户端读取到消息结尾后，会等待下一个字节，自然会无响应直到超时。  

**小结**    
`Content-Length`如果存在并且有效的话，则必须和消息内容的传输长度完全一致。（经过测试，如果过短则会截断，过长则会导致超时。）   

**没有Content-Length是如何处理的？**  
我们修改下代码：  
```js
res.writeHead(200, { 'Content-Type': 'text/plain'});
```
执行结果如下：  
![执行结果](https://img-blog.csdnimg.cn/e3ab5631d94449cabc4343aecb75f5e3.png)  
可以看出多出来一个`Transfer-Encoding`消息首部, 值为`chunked`表示数据以一系列分块的形式进行发送。 


**Content-Length可以与Transfer-Encoding共存吗？**  
```js
res.writeHead(200, { 'Content-Type': 'text/plain',  'Content-Length': responseText.length, 'Transfer-Encoding': 'chunk'});
```
执行结果如下：  
![执行结果](https://img-blog.csdnimg.cn/02d4973b49f547ffb7108b1db11f4e8c.png)  
可以看出 `Content-Length`可以与`Transfer-Encoding`共存  

**Connection:close模式下**    
若客户端和服务器之间不是持久连接，客户端就不需要知道它正在读取的主体的长度，而只需要读到服务器关闭主体连接为止。 即`content-length`可有可无  
```js
const http = require("http");

http
  .createServer(function (req, res) {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      // "Content-Length": 12,
      // "Transfer-Encoding": "chunked",
    });
    res.write("第一次传输!");
    setTimeout(() => {
      res.write("第二次传输!");
    }, 1000);
    setTimeout(() => {
      res.end("第三次传输!");
    }, 2000);
  })
  .listen(3000);
```
启动服务后， 利用`curl -v -H 'Connection:close' localhost:3000`(`-H 'Connection:close'`添加关闭持久连接header头) 来查看结果： 
```
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to localhost (127.0.0.1) port 3000 (#0)
> GET / HTTP/1.1
> Host: localhost:3000
> User-Agent: curl/7.64.1
> Accept: */*
> Connection:close
> 
< HTTP/1.1 200 OK
< Content-Type: text/html; charset=utf-8
< Date: Tue, 28 Jun 2022 08:50:08 GMT
< Connection: close
< Transfer-Encoding: chunked
< 
* Closing connection 0
第一次传输!第二次传输!第三次传输!% 
``` 

**小结**  
在http1.1及之后版本，如果是keep alive，则`content-length`和`Transfer-Encoding: chunked`必然是二选一。若是非keep alive，则和http1.0版本一样 `content-length` 首部可有可无  


# 确定实体主体长度的规则  
## 1. 如果特定的HTTP报文类型中不允许带有主体，就忽略`Content-Length`首部  

举例：  HEAD响应。  
发送 HTTP HEAD 请求的工作方式类似于发送 GET 请求。不同之处在于服务器应该只返回请求页面的响应头，HEAD响应中不会有主体。  
利用`curl --head localhost:3000`来发送HTTP HEAD 请求： 
响应结果如下：  
```
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 8
Date: Tue, 28 Jun 2022 09:43:10 GMT
Connection: close
```  
1XX, 204以及304响应也可以有提示性的`Content-Length`首部，但是也都没有实体主体。  

## 2. 如果报文中含有描述传输编码的Transfer-Encoding首部



