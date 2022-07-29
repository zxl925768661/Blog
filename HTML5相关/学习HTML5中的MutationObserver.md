# 前言    
文中内容参考[MutationObserver - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver) 以及 [https://segmentfault.com/a/1190000012787829](https://segmentfault.com/a/1190000012787829)和
[监听DOM加载完成及改变——MutationObserver应用 - 掘金](https://juejin.cn/post/6844903933631184903)内容。仅做学习记录使用。


# 一、什么是MutationObserver

> [MDN---MutationObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)：**MutationObserver**接口提供了监视对DOM树所做更改的能力。它被设计为旧的Mutation Events功能的替代品，该功能是DOM3 Events规范的一部分。

可以使用这个接口来监听新增或者删除节点，属性更改，或者文本节点的内容更改。

那么，被代替的`MutationEvents`是什么？ 

# 二、MutationEvent

虽然MutationEvent已经被弃用，但是我们还是需要了解它，可能你会为了浏览器兼容性的问题而遇到它。

MutationEvent有以下事件：

-   `DOMAttrModified`
-   `DOMAttributeNameChanged`
-   `DOMCharacterDataModified`
-   `DOMElementNameChanged`
-   `DOMNodeInserted`
-   `DOMNodeInsertedIntoDocument`
-   `DOMNodeRemoved`
-   `DOMNodeRemovedFromDocument`
-   `DOMSubtreeModified`

MutationEvent的兼容性：

1.  MutationEvent在IE浏览器中最低支持到IE9
2.  在webkit内核的浏览器中，不支持**DOMAttrModified**事件
3.  IE，Edge以及Firefox浏览器下不支持**DOMNodeInsertedIntoDocument**和**DOMNodeRemovedFromDocument**事件

MutationEvent中的所有事件都被设计成无法取消，如果可以取消MutationEvent事件则会导致现有的DOM接口无法对文档进行改变，比如appendChild，remove等添加和删除节点的DOM操作。\
MutationEvent中最令人诟病的就是性能以及安全性的问题，比如下面这个例子：

```js
document.addEventListener('DOMNodeInserted', function() {
    var newEl = document.createElement('div');
    document.body.appendChild(newEl);
});
```

document下的所有DOM添加操作都会触发`DOMNodeInserted`方法，这时就会出现循环调用`DOMNodeInserted`方法，导致浏览器崩溃。还有就是MutationEvent是事件机制，因此会有一般事件都存在的捕获和冒泡阶段，此时如果在捕获和冒泡阶段又对DOM进行了操作会拖慢浏览器的运行。

另一点就是`MutationEvent`事件机制是同步的，也就是说每次DOM修改就会触发，修改几次就触发几次,严重降低浏览器的运行，严重时甚至导致线程崩溃

```html
<div id='block'></div>
<script>
    var i = 0;
    block.addEventListener('DOMNodeInserted', function (e) {
        i++;
    });
    block.appendChild(document.createTextNode('1'));
    console.log(i);  // 1
    block.appendChild(document.createTextNode('2'));
    console.log(i);  // 2
    block.appendChild(document.createTextNode('3'));
    console.log(i);  // 3
</script>
```

# 三、MutationObserver基础使用

先来看看浏览器兼容问题

![浏览器兼容问题](https://img-blog.csdnimg.cn/18d7ad74f07c4dd2a432be7119a0c3c9.png)  

可以看出IE中最低是IE11才能支持  

`MutationObserver`是一个构造器，接受一个`callback`参数，用来处理节点变化的回调函数，返回两个固定参数`mutations`和`observer`

-   mutations：节点变化记录列表（sequence<MutationRecord>）
-   observer：构造MutationObserver对象。

```js
var observer = new MutationObserver(function (mutations, observer) {
  console.log(observer);  // 观察者实例
  console.log(mutations);  // 变动数组
  mutations.forEach(function(mutation) {
    console.log(mutation);
  });
});
```

MutationObserver对象有三个方法，分别如下：

1.  **observe**：设置观察目标，接受两个参数，target：观察目标，options：通过对象成员来设置观察选项
2.  **disconnect**：阻止观察者观察任何改变
3.  **takeRecords**：清空记录队列并返回里面的内容

关于observe方法中options参数有已下几个选项：

1.  **childList**：设置true，表示观察目标子节点的变化，比如添加或者删除目标子节点，不包括修改子节点以及子节点后代的变化
2.  **attributes**：设置true，表示观察目标属性的改变
3.  **characterData**：设置true，表示观察目标数据的改变
4.  **subtree**：设置为true，目标以及目标的后代改变都会观察
5.  **attributeOldValue**：如果属性为true或者省略，则相当于设置为true，表示需要记录改变前的目标属性值，设置了attributeOldValue可以省略attributes设置
6.  **characterDataOldValue**：如果characterData为true或省略，则相当于设置为true,表示需要记录改变之前的目标数据，设置了characterDataOldValue可以省略characterData设置
7.  **attributeFilter**：如果不是所有的属性改变都需要被观察，并且attributes设置为true或者被忽略，那么设置一个需要观察的属性本地名称（不需要命名空间）的列表

**注：**

1.  `attributeFilter/attributeOldValue` 优先级高于 `attributes`
2.  `characterDataOldValue` 优先级高于 `characterData`
3.  `attributes/characterData/childList`（或更高级特定项）至少有一项为`true`；
4.  特定项存在, 对应选项可以`忽略`或必须为`true`

**附：**[开发API原文](https://dom.spec.whatwg.org/#dom-mutationobserver-observe) 

下表描述了MutationObserver选项与MutationEvent名称之间的对应关系：

| MutationEvent            | MutationObserver options               |
| ------------------------ | -------------------------------------- |
| DOMNodeInserted          | { childList: true, subtree: true }     |
| DOMNodeRemoved           | { childList: true, subtree: true }     |
| DOMSubtreeModified       | { childList: true, subtree: true }     |
| DOMAttrModified          | { attributes: true, subtree: true }    |
| DOMCharacterDataModified | { characterData: true, subtree: true } |

从上表我们也可以看出相比与`MutationEvent`而言`MutationObserver`极大地增加了灵活性，可以设置各种各样的选项来满足程序员对目标的观察。

## observe(dom, options)

启动监听，接收两个参数

html

```html
<div id='target'>
    target的第一个子节点
    <p>
        <span>target的后代</span>
    </p>
</div>
```

1. options 只设置{ childList: true}时,表示观察目标子节点的变化

```js
var target = document.getElementById('target');
var i = 0;
// MutationObserver的callback回调函数是异步的，只有在全部DOM操作完成之后才会调用callback
var observe = new MutationObserver(function (mutations, observe) {
    i++;
    console.log(mutations);
    console.log(i); // 1
});
observe.observe(target, { childList: true });
target.appendChild(document.createTextNode('1'));
target.appendChild(document.createTextNode('2'));
target.appendChild(document.createTextNode('3'));

target.childNodes[0].remove(); // 删除节点，可以观察到
// 只设置{ childList: true}时,表示观察目标子节点的变化
// 想要观察到子节点以及后代的变化需设置{childList: true, subtree: true}
target.childNodes[0].textContent='改变子节点的后代';
```


2. options 设置attributeFilter, 这个选项主要是用来筛选要观察的属性，比如你只想观察目标style属性的变化，这时可以如下设置

```js
observe.observe(target,{ attributeFilter: ['style'], subtree: true});
target.style='color:red';       // 可以观察到
target.removeAttribute('name');   // 删除name属性，无法观察到
```


## disconnect()

停止观察。调用后不再触发观察器，解除订阅  

**注：当完成监听后，尽可量记得解除订阅**

## takeRecords()

清除变动记录。即不再处理未处理的变动。该方法返回变动记录的数组，注意，该方法**立即生效**。

*附：takeRecords变更记录字段内容`MutationRecord`对象*

**MutationRecord**  
变动记录中的属性如下：

1.  **type**：如果是属性变化，返回"attributes"，如果是一个CharacterData节点（Text节点、Comment节点）变化，返回"characterData"，节点树变化返回"childList"
2.  **target**：返回影响改变的节点
3.  **addedNodes**：返回添加的节点列表
4.  **removedNodes**：返回删除的节点列表
5.  **previousSibling**：返回分别添加或删除的节点的上一个兄弟节点，否则返回null
6.  **nextSibling**：返回分别添加或删除的节点的下一个兄弟节点，否则返回null
7.  **attributeName**：返回已更改属性的本地名称，否则返回null
8.  **attributeNamespace**：返回已更改属性的名称空间，否则返回null
9.  **oldValue**：返回值取决于type。对于"attributes"，它是更改之前的属性的值。对于"characterData"，它是改变之前节点的数据。对于"childList"，它是null

其中 **type**、**target**这两个属性不管是哪种观察方式都会有返回值，其他属性返回值与观察方式有关，比如只有当attributeOldValue或者characterDataOldValue为true时oldValue才有返回值，只有改变属性时，attributeName才有返回值等。

```js
var target = document.getElementById('target');
var i = 0;
// MutationObserver的callback回调函数是异步的，只有在全部DOM操作完成之后才会调用callback
var observe=new MutationObserver(function (mutations, observe) {
    i++;
    console.log(mutations);
    console.log(i);  
});
observe.observe(target,{ childList: true});
target.appendChild(document.createTextNode('新增Text节点'));
// 当调用takeRecords方法时，记录队列被清空因此不会触发MutationObserver中的callback回调方法。
var record = observe.takeRecords();              
// 此时record保存了改变记录列表  
console.log(record);
target.appendChild(document.createElement('span'));
observe.disconnect();    // 停止对target的观察。
// MutationObserver中的回调函数只有一个记录，只记录了新增span元素
```

执行结果如下：  
![执行结果](https://img-blog.csdnimg.cn/c45e8362b4454b23a22d65824b002034.png)     

# 四、MutationObserver的进阶应用 

## 1. 监听JS脚本创建的DOM渲染完成

```html
<div id="content">content</div>
<script>
    // js
    let time = 4;
    let arr = new Array(time);
    let content = document.getElementById('content');
    let mutationObserver = new MutationObserver(function obsCallback(mutations, observer) {
        console.log(`创建完成!`);
        console.log(observer); // 观察者实例
        console.log(mutations); // 变动数组
    }); // 创建实例
    mutationObserver.observe(content, {childList: true, subtree: true}); // 绑定被观察者
    obstruct(); // 执行阻塞

    function obstruct() {
        for (let i = 0; i < arr.length; i++) {
            arr[i] = `<div>${i}</div>`;
        }

        arr.forEach((item, idx) => {
            for (let i = 0; i < 3000; i++) console.log(1)
            content.innerHTML += item;
        });
    }

</script>
```
执行结果如下：  

![执行结果](https://img-blog.csdnimg.cn/1fc081f322e44edda576b50d786f7fa4.png)  

## 2. 监听图片/富文本编辑器/节点内容变化及处理

设置options中attributeFilter

如筛选要观察的属性contenteditable，禁止编辑：

```js
let mutationObserver = new MutationObserver(function obsCallback(mutations, observer) {
  mutations.forEach(mutation => {
    if (mutation.target.contentEditable === 'true') {
        mutation.target.setAttribute('contenteditable', 'false');
    }
  })
});

mutationObserver.observe(content, {attributeFilter: ['contenteditable'], ...});
```

具体可以看 [https://segmentfault.com/a/1190000014808628](https://segmentfault.com/a/1190000014808628)  这篇实际使用  

## 3. vue中nextTick实现

以下代码是[vue.js at v2.6.11 · vuejs/nextTick](https://github.com/vuejs/vue/blob/v2.6.11/dist/vue.js#L1932)实现  
可以看到`nextTick`优先使用`Promise.resolve().then()`，其次使用`MutationObserver`实现。

```js
var timerFunc;

// 首选 Promise.resolve().then()
if (typeof Promise !== "undefined" && isNative(Promise)) {
  var p = Promise.resolve();
  timerFunc = function () {
    p.then(flushCallbacks);
    // 一个兼容性BUG
    // 对于iOS UIWebView，页面运行一段时间会中断，
    // 在这种状态下，回调被推入微任务队列，但队列没有被刷新，直到浏览器需要执行其他工作，例如处理一个计时器。
    // 因此，我们可以通过添加空计时器来“强制”刷新微任务队列。
    if (isIOS) {
      setTimeout(noop);
    }
  };
  isUsingMicroTask = true;
} else if (
  !isIE &&
  typeof MutationObserver !== "undefined" &&
  (isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === "[object MutationObserverConstructor]")
) {
  // 其次使用MutationObserver
  var counter = 1;
  var observer = new MutationObserver(flushCallbacks);
  var textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = function () {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;
} else if (typeof setImmediate !== "undefined" && isNative(setImmediate)) {
  // 再就是 setImmediate，它其实已经是一个宏任务了，但仍然比 setTimeout 要好
  timerFunc = function () {
    setImmediate(flushCallbacks);
  };
} else {
  // 最后才考虑使用setTimeout.
  timerFunc = function () {
    setTimeout(flushCallbacks, 0);
  };
}
```



# 参考资料

[MutationObserver - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)

[MutationEvent - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationEvent)

[https://segmentfault.com/a/1190000012787829](https://segmentfault.com/a/1190000012787829)

[监听DOM加载完成及改变——MutationObserver应用 - 掘金](https://juejin.cn/post/6844903933631184903)