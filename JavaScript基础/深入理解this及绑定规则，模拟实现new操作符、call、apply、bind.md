
# 关于this
this是一个很特别的关键字，被自动定义在所有函数的作用域中。

当一个函数被调用时，会创建一个活动记录(执行上下文)。这个记录会包含函数在哪里被调用(调用栈)、函数的调用方法、传入的参数等信息。this 就是记录的 其中一个属性，会在函数执行的过程中用到。

this 是在运行时进行绑定的，并不是在编写时绑定，它的上下文取决于函数调 用时的各种条件。this 的绑定和函数声明的位置没有任何关系，只取决于函数的调用方式。
# 绑定规则

## 默认绑定
默认绑定，在不能应用其它绑定规则时使用的默认规则，通常是**独立函数调用**。

```js
function foo () {
  console.log(this.a);
}
var a = 10;
foo();  // 10
```

可以看出当调用foo()时，this.a被解析成了全局变量a。因为foo()是直接使用`不带任何修饰的函数引用`进行调用的，只能使用默认绑定，无法应用其他规则，因此this指向全局对象。

在严格模式下，则不能将全局对象用于默认绑定，因此this会绑定到undefined：

```js
function foo () {
  "use strict";
  console.log(this.a);
}
var a = 10;
foo();  // TypeError: this is undefined
```

注意：

-   开启了严格模式，只是说使得函数内的`this`指向`undefined`，它并不会改变全局中`this`的指向。
-   另外，它也不会阻止`a`被绑定到`window`对象上。

还有以下情况也需要注意：
1. 定义在函数内部的函数,不带任何修饰的函数引用进行调用

```js
function foo () {
  var a = 100;
  console.log(this.a);
  function inner1 () {
    console.log('---inner1 start---');
    console.log(this);
    console.log(this.a);
  }
  var inner2 = function () {
    console.log('---inner2 start---');
    console.log(this);
    console.log(this.a);
  }
  inner1();
  inner2();
}
var a = 10;
foo();
```
inner1， inner2函数虽然是在foo内部定义的，但是它仍然是一个普通的函数，this仍然指向window。
输出结果为：


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/83f792c2003947cfabc6e50fb36fa396~tplv-k3u1fbpfcp-watermark.image?)

2. 赋值表达式
```js
function foo () {
  console.log(this.a);
}
var a = 2;
var o = {a: 3, foo: foo};
var p = {a: 4};

o.foo(); // 3
(p.foo = o.foo)();  // 2
```
赋值表达式p.foo = o.foo的返回值是目标函数的引用，因此调用位置是foo()而不是p.foo()或者o.foo()。此处也是应用默认绑定。

## 隐式绑定
如果函数作为对象的一个属性时，并且作为对象的一个属性被调用时，函数中的this指向该对象。

```js
function foo () {
  console.log(this.a);
};
var obj = {
  a: 100,
  foo: foo
};
var a = 10;
obj.foo();  // 100
```
当函数引用有上下文对象时， 隐式绑定规则会把函数调用中的this绑定到这个上下文对象。

对象属性引用链中只有上一层或者说最后一层在调用位置中起作用。

```js
function foo () {
  console.log(this.a);
};
var obj2 = {
  a: 200,
  foo: foo
};
var obj1 = {
  a: 100,
  obj2: obj2
};
var a = 10;
obj1.obj2.foo();  // 200
```

### 隐式丢失
1. 赋值表达式

```js
function foo () {
  console.log(this.a);
}
var obj1 = {
  a: 1,
  foo: foo
}
var a = 'global';
var fn = obj1.foo;  // 函数别名
var obj2 = {
  a: 2,
  foo: obj1.foo
}
obj1.foo();  // 1
fn();    // 'global'    this指的是window
obj2.foo();    // 2    this指得是obj2
```
2. 函数作为参数传递

```js
function foo () {
  console.log(this.a);
}
 
function doFoo (fn) {
  console.log(this);
  fn();
};
 
var obj = { a: 1, foo: foo };
var a = 'global';
doFoo(obj.foo);
 
// this -> window 所以this.a是global
```
函数传入内置的setTimeout中

```js
function foo () {
  console.log(this.a);
}

var obj1 = {
  a: 1,
  foo: function () {
    setTimeout(function () {
      console.log(this.a);
    }, 100)
  }
};
var a = 'global';
var obj2 = {
  a: 2,
  foo: foo
};
obj1.foo();    //  this -> window, 输出global

setTimeout(obj2.foo, 200);    //  this -> window, 输出global

setTimeout(function () {
  obj2.foo();
}, 300);
//  this -> obj2, 输出2
```
## 显式绑定
相对隐式绑定，this值在调用过程中会动态变化，可是我们就想绑定指定的对象，这时就用到了显式绑定。

显式绑定主要是通过改变对象的prototype关联对象，可以通过call()、apply()方法直接指定this的绑定对象

两者区别： call接收若干个参数，而apply接收的是一个数组

```js
function foo () {
  console.log(this.a);
}
var obj1 = { a: 1, foo: foo };
var a = 'global';
var obj2 = {a: 2, foo: foo};
 
var fn = obj2.foo;
 
foo();        // 'global'
foo.call(obj1);    // this指向obj1，  输出1
 
fn.apply(obj2);    // this指向obj2，  输出2
 
fn.call(undefined);    // this指向window，  输出global
    
obj2.foo.call(obj1);  // this指向obj1，  输出1
```

### 硬绑定
显式的强制绑定，一旦绑定this就确认

```js

function foo () {
  console.log(this.a);
}
var obj1 = { a: 1, foo: foo };
var a = 'global';
var obj2 = {a: 2, foo: foo};
var obj3 = {a: 3, foo: foo};
 
var test = function (fn) {
    fn();
}
 
var bar = function (fn) {
    fn.call(this);
}
 
test.call(obj1, foo);    // this指向window, 输出global;
bar.call(obj2, foo);    // this硬绑定为obj2, 输出2
 
 
obj1.foo.bind(obj2)();    // this硬绑定为obj2, 输出2
obj1.foo.bind(obj2).call(obj3);    // this硬绑定为obj2, 输出2
```
bind硬绑定，与apply，call区别：

-   使用`.call()`或者`.apply()`的函数是会直接执行的
-   `bind()`会返回一个硬编码的新函数，会把你指定的参数设置为this的上下文并调用原始函数，需要手动调用才会执行

## new 绑定
> ***js中的new操作符，和其他语言中（如JAVA）的new机制是不一样的。js中，它就是一个普通函数调用，只是被new修饰了而已。***

使用new来调用函数，会自动执行如下操作：

1. 创建一个空对象，构造函数中的this指向这个空对象
2. 这个新对象被执行 [[Prototype]] 连接
3. 执行构造函数方法，属性和方法被添加到this引用的对象中
4. 如果构造函数中没有返回其它对象，那么返回this，即创建的这个的新对象，否则，返回构造函数中返回的对象。


```js
function foo (a) {
  this.a = a;
  return 1;
}

function bar (a) {
  this.a = a;
  return {};
}

var a = 'global';
var f1 = new foo(100);
var b1 = new bar(2);
console.log(f1.a);    // 100
console.log(b1.a);    // undefined
```
使用new 来调用foo(...)时，我们会构造一个新对象并把它绑定到foo(...)调用中的this上。

# ES6 箭头函数
箭头函数不使用this的四种标准规则，**里面的`this`是由外层作用域来决定的（** 箭头函数中没有 this 绑定，必须通过查找作用域链来决定其值，如果箭头函数被非箭头函数包含，则 this 绑定的是最近一层非箭头函数的 this，否则，this 为 undefined。 **），且指向函数定义时的this而非执行时**。

```js
var a = 10;
var obj = {
  a: 100,
  foo1: () => {
    console.log(this.a);
  },
  foo2: function () {
    console.log(this.a);
    return () => {
      console.log(this.a);
    };
  },
  foo3: function () {
    setTimeout(() => {
      console.log(this.a);
    });
  },
};
obj.foo1(); // 10
obj.foo2()(); // 100 100
obj.foo3();  // 100
```
解析：

- 对于obj.foo1()函数的调用，它的外层作用域是window，输出10

- obj.foo2()()，首先会执行obj.foo2()，它里面的this是调用它的obj对象，因此this.a即是obj.a，输出100；而返回的匿名函数是一个箭头函数，它的this由外层作用域决定，那也就是函数foo2，那也就是它的this会和foo2函数里的this一样，也是obj.a，输出100
- obj.foo3()中箭头函数中this由外层作用域决定，那也就是函数foo3，输出100

箭头函数在使用时，需要注意以下几点:

1. 函数体内的this对象，继承的是外层代码块的this。

2. 不可以当作构造函数，也就是说，不可以使用new命令，否则会抛出一个错误。

3. 不可以使用arguments对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替。

4. 不可以使用yield命令，因此箭头函数不能用作 Generator 函数。

5. 箭头函数没有自己的this，所以不能用call()、apply()、bind()这些方法去改变this的指向.

# 优先级
判断this
1.  是否在new中调用(new绑定)？如果是的话this绑定的是新创建的对象；需要注意的是构造函数中没有返回其它对象，那么返回this，即创建的这个的新对象，否则，返回构造函数中返回的对象

2. 是否通过call、apply(显式绑定)或者硬绑定调用?如果是的话,this绑定的是 指定的对象；需要注意的是在显式绑定中，`对于null和undefined的绑定将不会生效，实际上会进行默认绑定`，导致函数中可能会使用到全局变量

3. 是否在某个上下文对象中调用(隐式绑定)？如果是的话，this绑定的是那个上下文对象；

4. 都不是的话，使用默认绑定。如果在严格模式下，就绑定到undefined, 否则绑定到全局对象；

5. 如果是箭头函数，箭头函数的this是定义时上层作用域中的this（`由外层作用域决定`）


# 模拟实现new操作符、call、apply、bind方法

## new操作符
先看使用：

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.sayName = function () {
  console.log(this.name);
}

var person = new Person("banana", 18);
console.log(person.name); // "banana"
console.log(person.age); // 18
person.sayName(); // "banana"
```
可以看出通过new创建的实例对象可以访问到构造函数里的属性以及使用原型上的方法；

模拟实现：
```js
function createObj() {
  // 先创建一个空对象
  var obj = new Object();
  // 获得构造函数
  var constructorFn = [].shift.call(arguments); // 利用数组的shift方法
  //链接到构造函数的原型
  obj.__proto__ = constructorFn.prototype; // obj可以访问到构造函数原型中的属性
  // Object.setPrototypeOf(obj, constructorFn.prototype);
  var result = constructorFn.apply(obj, arguments); // 改变this指向为新创建的obj， 这样可以访问到构造函数中的属性
  // 如果构造函数中没有返回其它对象，那么返回this，即创建的这个的新对象；
  // 否则，返回构造函数中返回的对象
  return typeof result == "object" && result != null ? result : obj;
}
```

测试

```js
// 测试返回非对象
function Person(name, age) {
  this.name = name;
  this.age = age;
  return "hello world"
}
Person.prototype.sayName = function () {
  console.log(this.name);
}

var person = createObj(Person, "banana", 18);
console.log(person.name); // "banana"
console.log(person.age); // 18
person.sayName(); // "banana"

// 测试返回空对象
function Person1(name, age) {
  this.name = name;
  this.age = age;
  return {}
}
Person1.prototype.sayName = function () {
  console.log(this.name);
}
var person1 = createObj(Person1, "xman", 22);
console.log(person1.name); // undefined
console.log(person1.age); // undefined
person1.sayName(); // Uncaught TypeError: person1.sayName is not a function
```

## call实现
```js
// 生成键名
function createUniqueKey (context) {
  var key = 'fn';
  while (obj.hasOwnProperty(key)) {
    key = 'fn' + new Date().getTime()
  }
  return key;
}

Function.prototype.myCall = function (context) {
  // 为null或undefined则指向window
  // 其它原始值会转换成它的对象形式(如 '5' => new String('5'), true => new Boolean(true)等),这就是“装箱”。
  context = context === null || context === undefined ? window : Object(context);
  // 首先要获取调用call的函数，用this可以获取
  // 考虑到context可能存在fn属性
  var key = createUniqueKey(context);
  var len = arguments.length, result;
  context[key] = this;
  // 判断除context外有无其他参数
  if (len <= 1) {
    result = context[key]();
  } else {
    var args = [];
    for (var i = 1, len = arguments.length; i < len; i++) {
      args.push("arguments[" + i + "]");
    }
    // 我们需要得到类似这种"obj.fn(args1,args2,args3)" 这样的 ，通过将所有参数拼成字符串然后eval执行
    result = eval("context[key](" + args + ")");
  }
  // 使用完就删除掉
  delete context[key];
  return result;
};
```

使用ES6语法实现：

```js
Function.prototype.myCall1 = function (context) {
  // 为null或undefined则指向window
  // 其它原始值会转换成它的对象形式(如 '5' => new String('5'), true => new Boolean(true)等),这就是“装箱”。
  context = context === null || context === undefined ? window : Object(context);
  var fn = Symbol('fn');
  context[fn] = this;
  var args = [...arguments].slice(1); 
  var result = context[fn](...args);
  // 使用完就删除掉
  delete context[fn];
  return result;
};
```
测试下

```js
// 测试
function foo (x) {
  let result = this.a + x;
  return result;
}
var obj = {
  a: 10,
  fn: function () {console.log('fn')}
};
foo.myCall(obj, 20);  // 30

foo.myCall1(obj, 20);  // 30
```
## apply实现
与call的区别：call接收若干个参数，而apply接收的是一个数组

```js
// 生成键名
function createUniqueKey (context) {
  var key = 'fn';
  while (obj.hasOwnProperty(key)) {
    key = 'fn' + new Date().getTime()
  }
  return key;
}

Function.prototype.myApply = function (context, arr) {
  // 为null或undefined则指向window
  // 其它原始值会转换成它的对象形式(如 '5' => new String('5'), true => new Boolean(true)等),这就是“装箱”。
  context = context === null || context === undefined ? window : Object(context);
  // 考虑到context可能存在fn属性
  var key = createUniqueKey(context);
  var len = arguments.length, result;
  context[key] = this;
  // 判断除context外有无其他参数
  if (len <= 1) {
    result = context[key]();
  } else {
    var args = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      args.push("arr[" + i + "]");
    }
    result = eval("context[key](" + args + ")");
  }
  // 使用完就删除掉
  delete context[key];
  return result;
};
```

使用ES6语法实现：

```js
Function.prototype.myApply1 = function (context, arr) {
  // 为null或undefined则指向window
  // 其它原始值会转换成它的对象形式(如 '5' => new String('5'), true => new Boolean(true)等),这就是“装箱”。
  context = context === null || context === undefined ? window : Object(context);
  var fn = Symbol('fn');
  context[fn] = this;
  var result = arr ? context[fn](...arr) : context[fn]();
  // 使用完就删除掉
  delete context[fn];
  return result;
};
```

测试：

```js
// 测试
function foo (x) {
  let result = this.a + x;
  return result;
}
var obj = {
  a: 10,
  fn: function () {console.log('fn')}
};
foo.myApply(obj, [20]);  // 30

foo.myApply1(obj, [20]);  // 30
```

## bind实现
使用：
1. 创建绑定函数
```js
var obj = {
  a: 10,
  foo: function() {
    console.log(this.a);
  }
}
var a = 'global';
var fn = obj.foo;
fn();  // 'global'
var bound = fn.bind(obj);
bound();  // 10
```
模拟实现：

```js
Function.prototype.myBind1 = function (context) {
  var self = this; // 保存this，即调用bind方法的目标函数
  return function () {
    return self.apply(context);
  };
};
```
测试：

```js
// 测试
var bound1 = fn.myBind1(obj);
bound1();  // 10
```
2. 偏函数，使一个函数拥有预设的初始参数

```js
function list() {
  return Array.prototype.slice.call(arguments);
}

var list1 = list(1, 2, 3); // [1, 2, 3]

// 创建一个函数，它拥有预设参数列表。
var bound = list.bind(null, 37);

var list2 = bound();
// [37]

var list3 = bound(1, 2, 3);
// [37, 1, 2, 3]

```
模拟实现：

```js
Function.prototype.myBind2 = function (context) {
  var self = this, // 保存this，即调用bind方法的目标函数
    args = Array.prototype.slice.call(arguments, 1); // 获取第二个参数到最后一个参数
  return function () {
    // 获取的是bind返回的函数传入的参数
    var bindArgs = Array.prototype.slice.call(arguments); 
    // 按照顺序拼接起来
    var finalArgs = args.concat(bindArgs); 
    return self.apply(context, finalArgs);
  };
};
```
测试：

```js
// 测试
var bound1 = list.myBind2(null, 37);

var list4 = bound1();
// [37]

var list5 = bound1(1, 2, 3);
// [37, 1, 2, 3]
```
3. 作为构造函数使用的绑定函数
注意： 绑定函数自动适应于使用 `new` 操作符去构造一个由目标函数创建的新实例。当一个绑定函数是用来构建一个值的，原来提供的 `this` 就会被忽略。不过提供的参数列表仍然会插入到构造函数调用时的参数列表之前。

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.sayName = function () {
  console.log(this.name);
}

var obj = {};
var Bound = Person.bind(obj, 'xman');
var bound = new Bound('22');

console.log(bound.name);  // 'xman'
console.log(bound.age);  // 22
bound.sayName();  // xman

bound instanceof Person;  // true
bound instanceof Bound;  // true
```
模拟实现：

```js
Function.prototype.myBind3 = function (context) {
  var self = this, // 保存this，即调用bind方法的目标函数
    args = Array.prototype.slice.call(arguments, 1); // 获取第二个参数到最后一个参数
  var fBound = function () {
    // 获取的是bind返回的函数传入的参数
    var bindArgs = Array.prototype.slice.call(arguments); 
    // 按照顺序拼接起来
    var finalArgs = args.concat(bindArgs); 
    // 当作为构造函数时，this 指向实例，此时结果为 true，将绑定函数的 this 指向该实例，可以让实例获得来自绑定函数的值
    return self.apply(this instanceof fBound ? this : context, finalArgs);
  };
  // 修改返回函数的 prototype 为绑定函数的 prototype，实例就可以继承绑定函数的原型中的值
  fBound.prototype = this.prototype;
  return fBound;
};
```
优化：
修改 fBound.prototype 的时候，也会直接修改绑定函数的 prototype。这个时候，我们可以通过一个空函数来进行中转：

```js
Function.prototype.myBind4 = function (context) {
  var self = this,  args = Array.prototype.slice.call(arguments, 1);
  // 作为中转
  var fNOP = function () {};
  var fBound = function () {
    var bindArgs = Array.prototype.slice.call(arguments); 
    var finalArgs = args.concat(bindArgs); 
    return self.apply(this instanceof fNOP ? this : context, finalArgs);
  };
  fNOP.prototype = this.prototype;
  fBound.prototype = new fNOP();
  return fBound;
};
```

测试：

```js
var obj = {};
var Bound1 = Person.myBind4(obj, 'xman');
var bound1 = new Bound1('22');

console.log(bound1.name);  // 'xman'
console.log(bound1.age);  // 22
bound1.sayName();  // xman

bound1 instanceof Person;  // true
bound1 instanceof Bound1;  // true
```
参考资料：

[你不知道的JavaScript（上卷） (豆瓣) (douban.com)](https://book.douban.com/subject/26351021/)

[JavaScript深入之bind的模拟实现](https://github.com/mqyqingfeng/Blog/issues/12)

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
