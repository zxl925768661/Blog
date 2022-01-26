## 什么是函数组合?
> 函数式组合可以理解为将一系列简单基础函数组合成能完成复杂任务函数的过程；
这些基础函数都需要接受一个参数并且返回数据，这数据应该是另一个尚未可知的程序的输入；


## 应用compose 函数
先来看一个只接收两个参数的`compose` 函数， 后面再完善`compose`函数

```js
var compose = function(f,g) {
  return function(x) {
    return f(g(x));
  };
};
```
这就是函数组合（compose），f 和 g 都是函数， x是在它们之间通过“管道”传输的值。

我们可以通过组合函数使之产出一个崭新的函数：

```js
var toUpperCase = function(str) { return str.toUpperCase(); };
var exclaim = function(str) { return str + '!'; };
var shout = compose(exclaim, toUpperCase);
 
shout('hello world');
// HELLO WORLD!
```
让代码从右向左运行，而不是由内而外运行
```js
// 取列表中的第一个元素
var head = function(arr) { return arr[0]; };
// 反转列表
var reverse = function (arr) {
    return arr.reduce(function(cur, next){ return [next].concat(cur); }, []);
}
var last = compose(head, reverse);
 
last(['apple', 'banana', 'orange']); // orange
```

可以看出compose的数据流是从右往左的，且从右向左执行更加能够反映数学上组合的含义；


## 组合满足结合律

```js
// 结合律（associativity）
var associative = compose(f, compose(g, h)) == compose(compose(f, g), h);
// true
```
这个特性就是结合律，符合结合律意味着不管你是把 `g` 和 `h` 分到一组，还是把 `f` 和 `g` 分到一组都不重要。所以，如果我们想把字符串变为大写，可以这么写：

```js
compose(toUpperCase, compose(head, reverse));
 
// 或者
compose(compose(toUpperCase, head), reverse);
```

## 如何使用组合
假设我们有这样一个需求：给你一个数组，实现扁平化，并且去重

```js
var arr = [1, 2, [2, 10, 0, [5, 6, 4, [7, 1]]]];
var flattenAndUnique = function (arr) {
    while(arr.some(Array.isArray)){
        arr = [].concat(...arr)
    }
    return Array.from(new Set(arr));
}
flattenAndUnique(arr); // [1, 2, 10, 0, 5, 6, 4, 7]
```

这段代码实现起来没什么问题，但现在加了新需求，需要排序
为了实现这个目标，我们需要更改我们之前封装的函数，这其实就破坏了设计模式中的开闭原则。
> 开闭原则：软件中的对象（类，模块，函数等等）应该对于扩展是开放的，但是对于修改是封闭的。

那么在需求未变更，依然是数组扁平化且去重，应用组合的思想来怎么写呢？

原需求，我们可以这样实现：

```js
var arr = [1, 2, [2, 10, 0, [5, 6, 4, [7, 1]]]];
var flatten = function (arr) {
    while(arr.some(Array.isArray)){
        arr = [].concat(...arr)
    }
    return arr;
};
var unique = function (arr) { return Array.from(new Set(arr)); };
var flattenAndUnique = compose(unique, flatten);
var result = flattenAndUnique(arr) // [1, 2, 10, 0, 5, 6, 4, 7]
```
那么当我们新增需求排序时，我们根本不需要修改之前封装过的函数：

```js
// ...
// 新增一个数组排序方法
var sort = function (arr) { return arr.sort(function(a, b) {
    return  a - b;
}) };
var flattenAndUniqueAndSort = compose(sort, unique, flatten);
var result = flattenAndUniqueAndSort(arr) //  [0, 1, 2, 4, 5, 6, 7, 10]
```
可以看到当变更需求的时候，我们没有打破以前封装的代码，只是新增了函数功能，然后把函数进行重新组合。
我们假设，现在又变更了需求，需要求和，那么我们可以这样实现：

```js
// 新增
var getSum = function (arr){ return arr.reduce(function (cur, next) {
    return cur + next
}, 0); };
var flattenAndUniqueAndSum = compose(getSum, unique, flatten);
var result = flattenAndUniqueAndSum(arr) // 35
```
从这个例子，我们可以看出，通过将一些单一功能的函数通过组合起来，然后再组成复杂功能，不仅代码逻辑更加清晰，也给维护带来巨大的方便。

## 实现组合
从以上可以看出compose就是接收若干个函数作为参数，返回一个新函数。新函数执行时，按照`由右向左`的顺序依次执行传入`compose`中的函数，每个函数的执行结果作为为下一个函数的输入，直至最后一个函数的输出作为最终的输出结果

```js
var compose = function(f,g) {
  return function(x) {
    return f(g(x));
  };
};
```
这个只能接受两个参数

但显然我们需要考虑的是`compose`接收的参数个数是不确定的，所以我们可以利用`reduceRight`写一个通用版的
```js
// reduceRight实现
const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value)
```

如果我们要让最左侧的函数最先执行，那我们需要改变数据流的方向；从左至右处理数据流的过程称为`管道(pipeline)`或`序列(sequence)`

## 实现管道

```js
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value)
```

## compose实际用例

### lodash 
[flowRight.js]([lodash/flowRight.js at master · lodash/lodash (github.com)](https://github.com/lodash/lodash/blob/master/flowRight.js))

```js
function flowRight(...funcs) {
  return flow(...funcs.reverse());
}

// flow.js
function flow(...funcs) {
  const length = funcs.length
  let index = length
  while (index--) {
    if (typeof funcs[index] !== 'function') {
      throw new TypeError('Expected a function')
    }
  }
  return function(...args) {
    let index = 0
    let result = length ? funcs[index].apply(this, args) : args[0]
    while (++index < length) {
      result = funcs[index].call(this, result)
    }
    return result
  }
}
```

### underscore.js
[underscore.js]([underscore/underscore.js at master · jashkenas/underscore · GitHub](https://github.com/jashkenas/underscore/blob/master/underscore.js#L1194))
```js
function compose(){
    var args = arguments;
    var start = args.length - 1;
    return function(){
        var i = start;
        var result = args[i].apply(this,arguments);
        while(i--) result = args[i].call(this,result);
        return result;
    }  
}
```

### Koa2中间件
koa2 使用的异步方案是 `async/await`


```js
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
    ctx.body = 'Hello World';
    console.log(1);
    next();
    console.log(4);
});

app.use(async (ctx, next) => {
    console.log(2);
    next();
    console.log(3);
});

app.listen(3000);

```
运行`http://127.0.0.1:3000/` 会输出 `1 2 3 4`

原理

1. koa通过use函数，把所有的中间件push到一个内部数组队列this.middlewares中

```js
use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    // 判断是不是中间件函数是不是生成器 generators
    if (isGeneratorFunction(fn)) {
      deprecate('Support for generators will be removed in v3. ' +
                'See the documentation for examples of how to convert old middleware ' +
                'https://github.com/koajs/koa/blob/master/docs/migration.md');
      // 如果是 generators 函数，会转换成 async/await
      fn = convert(fn);
    }
    debug('use %s', fn._name || fn.name || '-');
    // 使用 middleware 数组存放中间件
    this.middleware.push(fn);
    return this;
}
```
2. Koa中间件的执行流程主要通过koa-compose中的compose函数完成

> **洋葱模型原理**： 所有的中间件依次执行，每次执行一个中间件，遇到next()就会将控制权传递到下一个中间件，下一个中间件的next参数，当执行到最后一个中间件的时候，控制权发生反转，开始回头去执行之前所有中间件中剩下未执行的代码； 当最终所有中间件全部执行完后，会返回一个Promise对象，因为我们的compose函数返回的是一个async的函数，async函数执行完后会返回一个Promise，这样我们就能将所有的中间件异步执行同步化，通过then就可以执行响应函数和错误处理函数

[koa-compose](https://github.com/koajs/compose/blob/master/index.js)

```js
function compose (middleware) {
  // 
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}  
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    // 计数器，用于判断中间是否执行到最后一个
    let index = -1
    // 从第一个中间件方法开始执行
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        // 递归调用下一个中间件
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

`以下图是网上找的`

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f42ae0a4fdec49c98c8ea8081a4f78f5~tplv-k3u1fbpfcp-watermark.image?)

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6351c242aaae48a7afa41b894d2789fd~tplv-k3u1fbpfcp-watermark.image?)

### redux中间件

[redux compose](https://github.com/reduxjs/redux/blob/master/src/compose.ts)

```js
export default function compose(...funcs: Function[]) {
  if (funcs.length === 0) {
    // infer the argument type so it is usable in inference down the line
    return <T>(arg: T) => arg
  }
 
  if (funcs.length === 1) {
    return funcs[0]
  }
 
  return funcs.reduce(
    (a, b) =>
      (...args: any) =>
        a(b(...args))
  )
}
```

参考资料：
[JS 函数式编程指南](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/ "JS 函数式编程指南")

https://juejin.cn/post/6844903910834962446