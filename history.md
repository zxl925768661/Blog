# history对象
history对象保存着用户上网的历史记录，从窗口被打开的那一刻算起。history作为window对象的属性，因此每个浏览器窗口、每个标签页乃至每个框架，都有自己的history对象与特定的window对象关联。

能使用的属性及方法如下：

## history.length
history.length属性，保存着历史记录的数量，这个数量包括所有历史记录，即所有向后和向前的记录。对于加载到窗口、标签页或框架中的第一个页面而言，history.length等于0。 
```js
if(history.length == 0){
    //这应该是用户打开窗口后的第一个页面
}
```

## history.go()  
> history.go()方法，在用户的历史记录中任意跳转，接受一个参数，表示向前或向后跳转的页面数的一个整数值。负数表示向后跳转（类似于浏览器后退按钮），正数向前（对应浏览器前进按钮）  

```js
// 后退一页
history.go(-1);
 
// 前进一页
history.go(1);
 
// 前进两页
history.go(2);
```

也可以给go()方法传递一个字符串参数，此时浏览器会跳转到历史记录中包含该字符串的第一个位置（可能前进，也可能后退，具体要看哪个位置最近）。如果历史记录中不包含该字符串，那么这个方法什么也不做。  

```js
// 跳转到最近的xx.com
history.go('xx.com');
```

## history.back() 
> 前往上一页；等价于history.go(-1)

## history.forward()
> 前往下一页；等价于history.go(1)

下面来看html5中新增的方法：

## history.pushState(state, title, [, url]) 

状态对象state是一个JavaScript对象，通过pushState () 创建新的历史记录条目。无论什么时候用户导航到新的状态，popstate事件就会被触发，且该事件的state属性包含该历史记录条目状态对象的副本。 
标题目前被忽略，可以直接传null

url 该参数定义了新的历史URL记录。注意，调用 pushState() 后浏览器并不会立即加载这个URL，但可能会在稍后某些情况下加载这个URL，比如在用户重新打开浏览器时。新URL不必须为绝对路径。如果新URL是相对路径，那么它将被作为相对于当前URL处理。新URL必须与当前URL同源，否则 pushState() 会抛出一个异常。该参数是可选的，缺省为当前URL。 

## history.replaceState(state, title, [, url])   
使用与 history.pushState() 非常相似，区别在于  replaceState()  是修改了当前的历史记录项而不是新建一个。 注意这并不会阻止其在全局浏览器历史记录中创建一个新的历史记录项。


popstate 事件
每当处于激活状态的历史记录条目发生变化时,popstate事件就会在对应window对象上触发. 如果当前处于激活状态的历史记录条目是由history.pushState()方法创建,或者由history.replaceState()方法修改过的, 则popstate事件对象的state属性包含了这个历史记录条目的state对象的一个拷贝.

调用history.pushState()或者history.replaceState()不会触发popstate事件. popstate事件只会在浏览器某些行为下触发, 比如点击后退、前进按钮(或者在JavaScript中调用history.back()、history.forward()、history.go()方法). 

```js
window.onpopstate = function(event) {
  alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
};
```