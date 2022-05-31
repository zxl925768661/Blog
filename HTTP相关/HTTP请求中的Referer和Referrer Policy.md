​
# Referer
> Referer请求头包含了当前请求页面的来源页面的地址，即表示当前页面是通过此来源页面里的链接进入的。服务端一般使用Referer（注：`正确英语拼写应该是referrer，由于早期HTTP规范的拼写错误，为了保持向后兼容就一直延续下来`）请求头识别访问来源，可能会以此统计分析、日志记录以及缓存优化等。   

![](https://img-blog.csdnimg.cn/20201012205022107.png)   

 `注： Referer请求头可能会暴露用户的浏览历史、涉及到用户的隐私问题。`   

# Referrer-policy   
Referrer-policy作用就是为了控制请求头中referer的内容   

包含以下值：  

- no-referrer : 整个referee首部会被移除，访问来源信息不随着请求一起发送。  
- no-referrer-when-downgrade : 在没有指定任何策略的情况下用户代理的默认行为。在同等安全级别的情况下，引用页面的地址会被发送(HTTPS->HTTPS)，但是在降级的情况下不会被发送 (HTTPS->HTTP).  
- origin: 在任何情况下，仅发送文件的源作为引用地址。例如  https://example.com/page.html 会将 https://example.com/ 作为引用地址。  
- origin-when-cross-origin: 对于同源的请求，会发送完整的URL作为引用地址，但是对于非同源请求仅发送文件的源。  
- same-origin: 对于同源的请求会发送引用地址，但是对于非同源请求则不发送引用地址信息。  
- strict-origin： 在同等安全级别的情况下，发送文件的源作为引用地址(HTTPS->HTTPS)，但是在降级的情况下不会发送 (HTTPS->HTTP)。  
- strict-origin-when-cross-origin： 对于同源的请求，会发送完整的URL作为引用地址；在同等安全级别的情况下，发送文件的源作为引用地址(HTTPS->HTTPS)；在降级的情况下不发送此首部 (HTTPS->HTTP)。  
- unsafe-url： 无论是同源请求还是非同源请求，都发送完整的 URL（移除参数信息之后）作为引用地址。（最不安全了） 

浏览器兼容性(https://caniuse.com/?search=referer-policy)：  
![](https://img-blog.csdnimg.cn/47a579c7fe6e4eb691d3a2fd7b7552c7.png)    

# 如何设置referer

1. 在HTML里设置meta   
```html
<meta name="referrer" content="origin">
```
如下图：   
![](https://img-blog.csdnimg.cn/20201012221206108.png)   

2. 或者用\<a>、\<area>、\<img>、\<iframe>、\<script> 或者 \<link> 元素上的 referrerpolicy 属性为其设置独立的请求策略。   
     
如：

```js
<script src='/javascripts/test.js' referrerpolicy="no-referrer"></script>
```

![](https://img-blog.csdnimg.cn/20201012221740534.png)    
![](https://img-blog.csdnimg.cn/20201012222008996.png)   
 

未加referrerpolicy属性的link元素：   

![](https://img-blog.csdnimg.cn/20201012221931863.png)   


# 盗链  
> 盗链是指在自己的页面上展示一些并不在自己服务器上的一些内容， 获取别人的资源地址，绕过别人的资源展示页面，直接在自己的页面上向最终用户提供此内容。 一般被盗链的都是`图片、 可执行文件、 音视频文件、压缩文件`等资源。通过盗链的手段可以减轻自己服务器的负担  

比如在自己页面里引入百度贴吧里的一张照片：  
```html
<body>
    <img src="https://tiebapic.baidu.com/forum/w%3D580%3B/sign=f88eb0f2cf82b9013dadc33b43b6ab77/562c11dfa9ec8a135455cc35b203918fa1ecc09c.jpg"> 
</body>
```
但实际上是无法展示的(如下图)，之所以无法展示是因为百度的图片做过防盗链处理   
![](https://img-blog.csdnimg.cn/d5762b593cb046c99cbf4ce34b85b4eb.png)   

# 防盗链的工作原理  
通过Referer或者签名，网站可以检测目标网页访问的来源网页，如果是资源文件，则可以追踪到显示它的网页地址 一旦检测到来源不是本站，即进行阻止或者返回指定的页面     

# 绕过图片防盗链
那么现在的很多网站是如何利用referer来进行防图片盗链的呢？   
三种情况下允许引用图片：   

1. 本网站。
2. 无referer信息的情况。（服务器认为是从浏览器直接访问的图片URL，所以这种情况下能正常访问）
3. 授权的网址。

我们只能从情况2入手，通过设置referer为空进行绕过防盗链。  

## 利用https网站盗链http资源网站，refer不会发送  
先利用openssl生成自签名证书（具体可看https://github.com/zxl925768661/Blog/tree/main/HTTP%E7%9B%B8%E5%85%B3/Demos/referer/demo03）   
client.js   

```js
let https = require("https");
let fs = require("fs");
let url = require("url");
let path = require("path");


var options = {
  hostname: "localhost",
  port: 8000,
  path: "/",
  method: "GET",
  rejectUnauthorized: false,
  key: fs.readFileSync("./keys/client.key"),
  cert: fs.readFileSync("./keys/client.crt"),
  ca: [fs.readFileSync("../ca/ca.crt")],
};

// 创建服务器
https.createServer(options, function (req, res) {

  let staticPath = path.join(__dirname, "src");
  let pathObj = url.parse(req.url, true);

  if (pathObj.pathname === "/") {
    pathObj.pathname += "index.html";
  }
  //  读取静态目录里面的文件，然后发送出去
  let filePath = path.join(staticPath, pathObj.pathname);
  fs.readFile(filePath, "binary", function (err, content) {
    if (err) {
      res.writeHead(404, "Not Found");
      res.end("<h1>404 Not Found</h1>");
    } else {
      res.writeHead(200, "Not Found");
      res.write(content, "binary");
      res.end();
    }
  });

}).listen(8080);

```
index.html  
```html
<div id="container">
    <img src="http://localhost:9999">
</div>
```
启动结果如下：  
`提示： 由于我们使用了自签名的证书，访问页面时可能会看到浏览器的证书警告，可能需要手动点击信任当前证书，或者手动点击链接确认访问该页面。例如Chrome 提醒“您的连接不是私密连接”，并禁止你访问。你可以直接在当前页面输入 thisisunsafe，不是在地址栏输入，而是直接敲击键盘输入，页面会自动刷新进入网页。`   
![](https://img-blog.csdnimg.cn/a091bbed2bc14a06aba83dcaa726bad3.png)   
## 设置meta 
```html
<meta name="referrer" content="no-referrer" />
```

## 设置referrerpolicy="no-referrer" 
以上已验证过，只是存在部分兼容性问题。   

## https://images.weserv.nl/?url=`${你的图片地址}`

因为网址是国外的速度有点慢效果还行，目的就是返回一个不受限制的图片，但是 GIF 格式会返回jpg也就是没有了动画效果。  

## 利用iframe伪造请求referer 
内容参考 https://juejin.cn/post/6844903892170309640  
```js
function showImg(src, wrapper ) {
    let url = new URL(src);
    let frameid = 'frameimg' + Math.random();
    window.img = `<img id="tmpImg" width=400 src="${url}" alt="图片加载失败，请稍后再试"/> `;

    // 构造一个iframe
    iframe = document.createElement('iframe')
    iframe.id = frameid
    iframe.src = "javascript:parent.img;" // 通过内联的javascript，设置iframe的src
    // 校正iframe的尺寸，完整展示图片
    iframe.onload = function () {
        var img = iframe.contentDocument.getElementById("tmpImg")
        if (img) {
            iframe.height = img.height + 'px'
            iframe.width = img.width + 'px'
        }
    }
    iframe.width = 10
    iframe.height = 10
    iframe.scrolling = "no"
    iframe.frameBorder = "0"
    wrapper.appendChild(iframe)
}

showImg('https://tiebapic.baidu.com/forum/w%3D580%3B/sign=f88eb0f2cf82b9013dadc33b43b6ab77/562c11dfa9ec8a135455cc35b203918fa1ecc09c.jpg', document.querySelector('#container'))
```
结果如下：  
![](https://img-blog.csdnimg.cn/1a07e6fc989a41a3ae85a5af286e074f.png)  

## 客户端在请求时修改header头部  
内容参考 https://juejin.cn/post/6844903892170309640   
### 利用XMLHttpRequest 
XMLHttpRequest中[setRequestHeader](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/setRequestHeader)方法，用于向请求头添加或修改字段。我们能不能手动将修改 referer字段呢？
```js
// 通过ajax下载图片
function loadImage(uri) {
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest();
        xhr.responseType = "blob";
        xhr.onload = function() {
            resolve(xhr.response);
        };

        xhr.open("GET", uri, true);
        // 通过setRequestHeader设置header不会生效
        // 会提示 Refused to set unsafe header "Referer"
        xhr.setRequestHeader("Referer", ""); 
        xhr.send();
    });
}
  

// 将下载下来的二进制大对象数据转换成base64，然后展示在页面上
function handleBlob(blob) {
    let reader = new FileReader();
    reader.onload = function(evt) {
        let img = document.createElement('img');
        img.src = evt.target.result;
        document.getElementById('container').appendChild(img)
    };
    reader.readAsDataURL(blob);
}

const imgSrc = "https://tiebapic.baidu.com/forum/w%3D580%3B/sign=f88eb0f2cf82b9013dadc33b43b6ab77/562c11dfa9ec8a135455cc35b203918fa1ecc09c.jpg";

loadImage(imgSrc).then(blob => {
    handleBlob(blob);
});

```
上述代码运行时会发现控制台提示错误:  
> Refused to set unsafe header "Referer"   

可以看见setRequestHeader设置referer响应头是无效的，这是由于浏览器为了安全起见，无法手动设置部分保留字段，不幸的是Referer恰好就是保留字段之一，详情列表参考[Forbidden header name](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name)。  

### 利用fetch
```js
// 将下载下来的二进制大对象数据转换成base64，然后展示在页面上
function handleBlob(blob) {
    let reader = new FileReader();
    reader.onload = function(evt) {
        let img = document.createElement('img');
        img.src = evt.target.result;
        document.getElementById('container').appendChild(img)
    };
    reader.readAsDataURL(blob);
}

const imgSrc = "https://tiebapic.baidu.com/forum/w%3D580%3B/sign=f88eb0f2cf82b9013dadc33b43b6ab77/562c11dfa9ec8a135455cc35b203918fa1ecc09c.jpg";


function fetchImage(url) {
    return fetch(url, {
        headers: {
            // "Referer": "", // 这里设置无效
        },
        method: "GET",  
        referrer: "", // 将referer置空
        // referrerPolicy: 'no-referrer', 
    }).then(response => response.blob());
}

fetchImage(imgSrc).then(blob => {
    handleBlob(blob);
});
```  
通过将配置参数referrer置空，可以看见本次请求已经不带referer了  
![](https://img-blog.csdnimg.cn/3a621b500fb0442c834241ee009a90a5.png)  

或者设置 referrerPolicy为"no-referrer"  

![](https://img-blog.csdnimg.cn/289dca09d1aa4e29aa8301804c517a79.png)  


## 服务器作防盗链图片中转  

这里我们使用express  
index.js  
```js
const express = require('express');
const app = express();

app.use('/img', require('./routers/index.js'))

app.listen(3000);
```

routers/index.js  
```js
var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/', function(req, res, next) {
    var options = {
        method: 'GET',
        url: 'https://tiebapic.baidu.com/forum/w%3D580%3B/sign=f88eb0f2cf82b9013dadc33b43b6ab77/562c11dfa9ec8a135455cc35b203918fa1ecc09c.jpg',
        headers: {
            'Referer': '',
        }
    };
    request(options).pipe(res)
    
});

module.exports = router;
```

# 常见防盗链方法   
防盗链一般有下面几种方式：  
1. 动态文件名，或者定期修改文件名称或路径  
2. 判定引用地址，一般是判断浏览器请求时HTTP头的Referer字段的值
3. 使用登录验证，cookie
4. 图片加水印  
5. ... 

## 利用nginx
ngx_http_referer_module用于阻挡来源非法域名的请求 nginx指令valid_refers，全局变量$invalid_refer 对资源的防盗链nginx配置为
```js
location ~.*\.(gif|jpg|png|bmp|flv|swf|rar|zip)$
{
    valid_referers none blocked test.com *.test.com;   // 加none的目的是确保浏览器可以直接访问资源
    if($invalid_referer)
    {
        #return 403;  // 直接返回403
        rewrite ^/ http://www.test.com/403.jpg; // 返回指定提示图片
    }
}
```
这种方法是在server或者location段中加入：`valid_referers`。这个指令在referer头的基础上为 `$invalid_referer` 变量赋值，其值为0或1。如果`valid_referers`列表中没有Referer头的值， `$invalid_referer`将被设置为1。  
如果 `$invalid_referer`等于 1，在if语句中返回一个 403 给用户，这样用户便会看到一个 403 的页面, 如果使用下面的rewrite，那么盗链的图片都会显示 403.jpg。  
该指令支持none和blocked:  

- 其中none表示空的来路，也就是直接访问，比如直接在浏览器打开一个文件  
- blocked表示被防火墙标记过的来路，*..com表示所有子域名   

但是传统的防盗链也会存在一些问题，因为refer是可以伪造的， 所以可以使用加密签名的方式来解决这个问题。 什么是加密签名？就是当我们请求一个图片的时候，我要给它带一些签名过去，然后返回图片的时候我们判断下签名是否正确，相当于对一个暗号。  
更多内容请参考 https://zhuanlan.zhihu.com/p/362650878  

## 服务器端判断referer  
我们能通过对比req.headers['referer']和req.url中的host来确认资源请求是否是别的站点发来的。
接着，当我们知道了资源请求的来源，我们就能通过一系列手段来决定是否响应请求以及怎样响应。
通常的做法是设置一个白名单，在白名单内的请求我们就响应，否则就不响应。  
```js
let http = require("http");
let fs = require("fs");
let url = require("url");
let path = require("path");
// 白名单
const whiteList = ["localhost:8080"];

/**
 * 三种情况下允许引用图片：
 * 1. 本网站
 * 2. 无referer信息的情况。（服务器认为是从浏览器直接访问的图片URL，所以这种情况下能正常访问）
 * 3. 授权的网址。(配置白名单)
 */

http
  .createServer(function (req, res) {

    let refer = req.headers["referer"] || req.headers["refer"];
    console.log('refer----', refer, req.url);
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (refer) {
      let referHostName = url.parse(refer, true).host;
      let currentHostName = url.parse(req.url, true).host;
      console.log(referHostName, currentHostName, '--==')
      // 当referer不为空, 但host未能命中目标网站且不在白名单内时, 返回错误的图
      if (
        referHostName != currentHostName &&
        whiteList.indexOf(referHostName) == -1
      ) {
        res.setHeader("Content-Type", "image/jpeg");
        fs.createReadStream(path.join(__dirname, "/src/img/403.jpg")).pipe(res);
        return;
      }
    }
    // 当referer为空时, 返回正确的图
    res.setHeader("Content-Type", "image/jpeg");
    fs.createReadStream(path.join(__dirname, "/src/img/1.jpg")).pipe(res);
    
  })
  .listen(9999);

```   

利用http启动一个客户端：  
client.js   
```js
let http = require("http");
let fs = require("fs");
let url = require("url");
let path = require("path");

// 创建服务器
http.createServer(function (req, res) {
  let staticPath = path.join(__dirname, "src");
  let pathObj = url.parse(req.url, true);

  if (pathObj.pathname === "/") {
    pathObj.pathname += "index.html";
  }
  //  读取静态目录里面的文件，然后发送出去
  let filePath = path.join(staticPath, pathObj.pathname);
  fs.readFile(filePath, "binary", function (err, content) {
    if (err) {
      res.writeHead(404, "Not Found");
      res.end("<h1>404 Not Found</h1>");
    } else {
      res.writeHead(200, "Not Found");
      res.write(content, "binary");
      res.end();
    }
  });
}).listen(8080);

```
index.html   
```js
<div id="container">
    <img src="http://localhost:9999">
</div>
```
分别启动客户端和服务器：  
![](https://img-blog.csdnimg.cn/700534209d2c4bdf92ffc220adf573a4.png)   

如果我们修改下服务器端whiteList：  
```js
// 白名单
const whiteList = [];
```
重启服务器端，访问客户端后 我们发现响应结果变成了403图片：   
![](https://img-blog.csdnimg.cn/65db1f3023d4436882fbb05374bed274.png)  

## 防止网址被 iframe 
在页面底部或其它公用部位加入如下代码：
```js
// 用js方法检测地址栏域名是不是当前网站绑定的域名，如果不是，则跳转到绑定的域名上来，这样就不怕网站被别人iframe了
if(window!=parent) {
    window.top.location.href = window.location.href; 
}
```

注：   
以上代码地址： https://github.com/zxl925768661/Blog/tree/main/HTTP%E7%9B%B8%E5%85%B3/Demos/referer  


参考资料：

https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Referrer-Policy   

https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Referer  

https://juejin.cn/post/6844903892170309640   

https://juejin.cn/post/6844903567434711053  

https://www.cnblogs.com/wangyongsong/p/8204698.html  


​