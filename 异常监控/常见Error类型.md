# 前言  
由于JavaScript本身是一个弱类型语言，加上浏览器环境的复杂性，网络问题等等，很容易发生各种错误。因此做好网页错误监控，优化代码，提供代码健壮性很重要。以下就先介绍一些常见的错误。  

# JavaScript中的Error  

## Error
我们先来看看Error.prototype里面有哪些东西：  
![](https://img-blog.csdnimg.cn/20201015223038445.png)    
两个重要属性message和name分别表示错误信息和错误名称。 

除了通用的Error构造函数外,还有以下种类：     
- EvalError：eval函数的错误  
- InternalError(非标准)：出现在JavaScript引擎内部的错误  
- RangeError：范围错误，当一个值不在其所允许的范围或者集合中  
- ReferenceError：引用错误，当一个不存在的变量被引用时发生的错误  
- SyntaxError：语法错误  
- TypeError：类型错误  
- URIError：URI错误  

Error是基类型，其他类型的错误类型都是继承该类型，所以所有的错误类型共享了一套相同的属性;
```js
EvalError.prototype.__proto__ === Error.prototype;           // true
RangeError.prototype.__proto__ === Error.prototype;          // true
ReferenceError.prototype.__proto__ === Error.prototype;      // true
SyntaxError.prototype.__proto__ === Error.prototype;         // true
TypeError.prototype.__proto__ === Error.prototype;           // true
URIError.prototype.__proto__ === Error.prototype;            // true
```

但Error错误类型很少见，主要用于开发者自定义错误。

自定义异常类型：
```js
function MyError (message) {
    this.name = 'MyError';
    this.message = message || 'Default Message';
    this.stack = (new Error()).stack;
}
MyError.prototype = Object.create(Error.prototype);
MyError.prototype.constructor = MyError;

try {
    throw new MyError();
} catch (e) {
    console.log(e.name);    // 'MyError'
    console.log(e.message); // 'Default Message'
}
```
## EvalError 
在ES5以下的Javascript中，当eval函数没有被正确执行时就会抛出evalError错误

如：
```js
var myEval = eval;
myEval("alert('call eval')");
```
但ES5以上的JavaScript中已经不再抛出该错误，但依然可以通过new关键字来自定义该类型的错误提示。 
## RangeError
当一个值超出有效范围时发生的错误。  


1. 数组长度为负数或超长  
```js
var arr = new Array(-1);    // Uncaught RangeError: Invalid array length
var arr = new Array(Math.pow(2,32));   // Uncaught RangeError: Invalid array length
```
![](https://img-blog.csdnimg.cn/20201019214658145.png)    
2. 将值传递给超出范围的函数，此类函数包括toFixed、toExponential、toPrecision等  
```js
var num=12.34
num.toFixed(-1);   // Uncaught RangeError: toFixed() digits argument must be between 0 and 100
num.toExponential(-1);  // Uncaught RangeError: toExponential() argument must be between 0 and 100
num.toPrecision(-1);    // Uncaught RangeError: toPrecision() argument must be between 1 and 100
```  
![](https://img-blog.csdnimg.cn/20201020193234680.png)  
3. 函数堆栈超过最大值  
```js
var num = 0;
function foo() {
  num++;
  foo();
}
foo();  // Uncaught RangeError: Maximum call stack size exceeded
```  
![](https://img-blog.csdnimg.cn/2020102019345158.png)  

## ReferenceError
引用错误    
1. 引用了一个不存在的变量  
```js
console.log(obj);   // Uncaught ReferenceError: obj is not defined
```  
![](https://img-blog.csdnimg.cn/20201020200404496.png)    
2. 将一个值赋值给一个无法被赋值的对象  
```js
console.log() = 1;  // Uncaught ReferenceError: Invalid left-hand side in assignment
```
![](https://img-blog.csdnimg.cn/20201020200801444.png)  
## SyntaxError  
语法错误  
1. 变量名不合规范  
```js
var 1s;   // Uncaught SyntaxError: Invalid or unexpected token
var 1;    // Uncaught SyntaxError: Unexpected number
```  
![](https://img-blog.csdnimg.cn/20201020201002482.png)    
`tips`: JavaScript标识符(变量、函数、函数参数、属性的名字)命名规范需要遵循以下规则：  

- 首字母必须是字母、下划线（-）或者美元符号（$）；
- 其他字母可以是下划线（_）、美元符号（$）、字母或者数字；
- 一般采用驼峰法：第一个字母小写，其余有意义的单词首字母大写；
- 变量名是区分大小写的，不能是关键字或保留字。 

2. 给关键字赋值  
```js
function = 2;   // Uncaught SyntaxError: Unexpected token '='
break = 2;      // Uncaught SyntaxError: Unexpected token '='
```
`注意： 不能把关键字、保留字、true、false和null用作标识符`  

`tips`: [ECMAScript规范](https://262.ecma-international.org/12.0/#sec-keywords-and-reserved-words) 中的保留关键字  

await, break, case, catch, class, const, continue, debugger, default, delete, do, else, enum, export, extends, false, finally, for, function, if, import, in, instanceof, new, null, return, super, switch, this, throw, true, try, typeof, var, void, while, with, yield  

![](https://img-blog.csdnimg.cn/20201020201105332.png)  
3. 缺少'"}等  
```js
var s = {;  // Uncaught SyntaxError: Unexpected token ';'
var q = '"; // Uncaught SyntaxError: Invalid or unexpected token
```
![](https://img-blog.csdnimg.cn/20201020201249176.png)  
4. JSON.parse解析内容不合法  
```js
JSON.parse(function() {});   // Uncaught SyntaxError: Unexpected token u in JSON at position 1  
```
![](https://img-blog.csdnimg.cn/20201020201403112.png)  
## TypeError  
运行时最常见的异常，表示变量或参数不是预期类型。  
1. 访问未定义对象中的属性或方法时：  
```js
var obj;
obj.name  // Uncaught TypeError: Cannot read properties of undefined (reading 'name')  
```
![](https://img-blog.csdnimg.cn/20201020194635864.png)  
2. TypeError: "undefined"不是对象，"null"不是对象   
这错误发生在`safari`上  
```js
var obj = undefined;
obj.length
```
![](https://img-blog.csdnimg.cn/2020102019514933.png)  
![](https://img-blog.csdnimg.cn/20201020195209516.png)  
在chrome浏览器下报`Uncaught TypeError: Cannot read properties of undefined (reading 'length')` 
3. TypeError: 对象不支持xx属性或方法  
```js
this.guun();
```
这是在IE上发生的错误  
![](https://img-blog.csdnimg.cn/20201020195800146.png)  
4. TypeError："xxx"  不是函数  
```js
var obj = {};
obj.test();   // Uncaught TypeError: obj.test is not a function
```
![](https://img-blog.csdnimg.cn/20201020200047241.png)  
## URIError
URI错误，主要是相关函数的参数不正确。  

主要涉及encodeURI、decodeURI、encodeURIComponent、decodeURIComponent、escape、unescape这些函数中  
```js
decodeURL('%1');    // Uncaught URIError: URI malformed
decodeURIComponent('%1');   // Uncaught URIError: URI malformed
```
![](https://img-blog.csdnimg.cn/2020102020203694.png)   

# DOMException
DOMException 接口代表调用方法或访问 Web API 属性时发生的异常事件。[Web API](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Client-side_web_APIs/Introduction)包括操作文档的API（最明显的时DOM API）、从服务器获取数据的API（如XMLHttpRequest和Fetch API）、用于绘制和操作图形的API、音频和视频API、客户端存储API（如localStorage、sessionStorage、indexedDB等）,...等
```html
<body>
    <div id="app"></div><p></p>
    <script>
        var node = document.querySelector('#app');
        var refnode = node.nextSibling;
        var newnode = document.createElement('div');
        node.insertBefore(newnode, refnode);    
        // Uncaught DOMException: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.
    </script>
</body>
```
以上代码的操作不符合DOM的规则。会报错`Uncaught DOMException: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.`  
**语法**
```js
// message 可选 对异常的描述.如果不存在, 使用空字符串 ''
// name 可选 错误名称 具体可看https://developer.mozilla.org/zh-CN/docs/Web/API/DOMException  
var domException = new DOMException([message[, name]]);
```

# Promise产生的异常（unhandledrejection）
以下两种情况会导致Promise被reject： 
1. 调用Promise.reject  
```js
Promise.reject('hello');    // Uncaught (in promise) hello
```
2. Promise中代码出错
```js
new Promise((resolve, reject) => {
    throw new Error('hello');
});
// Uncaught (in promise) Error: hello
```
# 资源加载错误  
由于网络，安全等原因， 网页中静态文件(js, css, jpg...)加载错误，比如404，还有接口请求404，都是很常见的一种错误
```html
<body>
    <img src="img.jpg">
    <script>
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.responseText)
            }
        }
        xhr.open("GET", "data.json", false);
        xhr.send(null);
        
    </script>
</body>
```
加载一个不存在的静态资源，就会出现404  
![](https://img-blog.csdnimg.cn/636a7e158a4c43bd998f83ccde482183.png)  
# 前端框架错误  
三大框架Vue.js、React、Angular    

下一篇将介绍如何捕获异常。  

# 参考资料
[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error)  
[https://juejin.cn/post/6844903751271055374](https://juejin.cn/post/6844903751271055374)
