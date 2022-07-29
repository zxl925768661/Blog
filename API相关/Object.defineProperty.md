 
# 前言 
对象是由多个名/值对组成的无序的集合。对象中每个属性对应任意类型的值。

定义对象可以使用构造函数或者对象字面量的形式：

```js
// 使用new操作符后跟Object构造函数
var person = new Object();
person.name = 'zxx';
person.say = function () {};

// 使用对象字面量
var person = {
  name: 'zxx',
  say: function () {}
}
```

除了上面添加属性的方式，还可以使用`Object.defineProperty`定义新属性或者修改原有的属性。

# Object.defineProperty()
**语法：**

> Object.defineProperty(obj, prop, descriptor);

**参数说明：**

- obj: 必需。要定义属性的对象；  

- prop: 必需。要定义或修改的属性的名称或Symbol；  

- descriptor: 必需。要定义或修改的属性描述符。  

**返回值：**  

返回被传递给函数的对象。即第一个参数obj

`注：通过赋值操作添加的普通属性是可枚举的（在枚举对象属性时会被枚举到（for...in或Object.keys方法）），可以改变这些属性的值，也可以删除这些属性。使用Object.defineProperty()添加的属性值是不可修改（immutable）的`。

对象里目前存在的属性描述符有两种主要形式：数据描述符和存取描述符。一个描述符只能是这两者其中之一，不能同时是两者。

两者共享以下可选键值（默认值是指在使用 Object.defineProperty() 定义属性时的默认值）

| 属性         | 默认值 | 说明                                                                                                                     |
|--------------|--------|--------------------------------------------------------------------------------------------------------------------------|
| configurable | false  | 当且仅当该属性的 configurable 键值为 true 时，该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除。           |
| enumerable   | false  | 当且仅当该属性的 enumerable 键值为 true 时，该属性才会出现在对象的枚举属性中。（即是否通过for-in循环或Object.k返回属性） |

## 数据（数据描述符）属性
数据描述符是一个具有值的属性，该值是可写的，也可以是不可写的。

还具有以下可选键值：

| 属性     | 默认值    | 说明                                                                                         |
|----------|-----------|----------------------------------------------------------------------------------------------|
| value    | undefined | 该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等）。                       |
| writable | false     | 当且仅当该属性的 writable 键值为 true 时，属性的值，也就是上面的 value，才能被赋值运算符改变 |

## 访问器（存取描述符）属性
存取描述符是由getter函数和setter函数所描述的属性。

| 属性 | 默认值    | 说明                                                                                                                                                                                                                 |
|------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| get  | undefined | 属性的 getter 函数，如果没有 getter，则为undefined。当访问该属性时，会调用此函数。执行时不传入任何参数，但是会传入 this 对象（由于继承关系，这里的this并不一定是定义该属性的对象）。该函数的返回值会被用作属性的值。 |
| set  | false     | 属性的 setter 函数，如果没有 setter，则为 undefined。当属性值被修改时，会调用此函数。该方法接受一个参数（也就是被赋予的新值），会传入赋值时的 this 对象。 

汇总下描述符默认值：

- 拥有布尔值的键 configurable、enumerable 和 writable 的默认值都是 false  

- 属性值和函数的键 value、get 和 set 字段的默认值为 undefined  

**数据描述：**
当修改或定义对象的某个属性时，给这个属性添加一些特性：

```js
var person = {};         // 创建一个新对象

// 在对象中添加一个属性与数据描述符的示例
// 在对象person中添加了一个属性name，值为zxx
Object.defineProperty(person, "name", {
  value : 'zxx',        // 可定义任意类型的值
  writable : true,
  enumerable : true,
  configurable : true
});

// 在对象中添加一个设置了存取描述符属性的示例
// 在对象person中设置age属性，值为18
var age = 18;
Object.defineProperty(person, "age", {
  // 使用了方法名称缩写（ES2015 特性）
  // 下面两个缩写等价于：
  // get : function() { return age; },
  // set : function(newValue) { age = newValue; },
  get() { return age; },
  set(newValue) { age = newValue; },
  enumerable : true,
  configurable : true
});



// 注：数据描述符和存取描述符不能混合使用
Object.defineProperty(person, "conflict", {
  value: 0x9f91102,
  get() { return 0xdeadbeef; } 
});

// Uncaught TypeError: Invalid property descriptor. Cannot both specify accessors and a value or writable attribute
```

## value  
属性对应的值，可以设置为任意类型的值，默认为undefined   

```js
var person = {};
// 不设置value属性默认为undefined
Object.defineProperty(person, "name", {});
console.log(person.name);        // undefined

// 设置value属性
Object.defineProperty(person, "name", {
    value: "zxx"
});
console.log(person.name);        // zxx
```

## writable
属性的值是否可以被重写，设置为true才可以被重写。默认为false
```js
var person = {};
// 设置writable为false，不能重写;
Object.defineProperty(person, "name", {
    value: "zxx",
    writable: false
});

// 修改name的值
person.name = "hello";
console.log(person.name);    // 结果依然是 zxx

// 设置writable的值为true, 可以被重写
Object.defineProperty(person, "name", {
    value: "zxx",
    writable: true
});
// 修改name的值
person.name = "hello";
console.log(person.name);    // 修改成功，输出 hello
```

## enumerable
此属性是否可以被枚举(使用`for...in`或`Object.keys()`)。设置为true才可以被枚举。默认为false。

```js
var person = {};
// 设置enumerable为false，不能被枚举;
Object.defineProperty(person, "name", {
    value: "zxx",
    enumerable: false
});
// 枚举对象的属性
for (var key in person) {
    console.log( key );
}

// 设置enumerable为true，能被枚举;
Object.defineProperty(person, "name", {
    value: "zxx",
    enumerable: true
});
// 枚举对象的属性
for (var key in person) {
    console.log( key );        // name
}
```


## configurable
是否可以删除目标属性或者是否可以再次修改属性的特性（`writable, configurable, enumerable`）,设置为true可以被删除或者可以重新设置特性；设置为false, 定义的属性不能被删除或者不可以重新设置特性。默认值为false。  


这个属性有两个作用：  

- 目标属性是否可以使用delete删除；  
- 目标属性是否可以被再次设置特性；  

```js
// 测试目标属性是否能被删除
var person = {};
// 设置configurable为false，不能被删除;
Object.defineProperty(person, "name", {
    value: "zxx",
    configurable: false
});
// 删除name属性
delete person.name;
console.log(person.name);     // zxx

// 设置configurable为true，能被删除;
Object.defineProperty(person, "name", {
    value: "zxx",
    configurable: true
});
// 删除name属性
delete person.name;
console.log(person.name);     // undefined

// 测试目标属性是否可以再次被修改特性
var person = {};
// 设置configurable为false，不能再次修改特性;
Object.defineProperty(person, "name", {
    value: "zxx",
    writable: false,
    enumerable: false,
    configurable: false
});

// 重新修改特性
Object.defineProperty(person, "name", {
    value: "zxx",
    writable: true,
    enumerable: true,
    configurable: true
});
console.log( person.name );    // Uncaught TypeError: Cannot redefine property: name

// 设置configurable为true，能再次修改特性;
Object.defineProperty(person, "name", {
    value: "zxx",
    writable: false,
    enumerable: false,
    configurable: true
});

// 重新修改特性
Object.defineProperty(person, "name", {
    value: "zxx",
    writable: true,
    enumerable: true,
    configurable: true
});
console.log( person.name );    // zxx
```

除了可以给新定义的属性设置特性，也可以给已有的属性设置特性：

```js
// 定义对象的时候添加的属性，是可删除、可重写、可枚举的
var person = {
    name: "zxx"
};

// 删除
delete person.name;
console.log(person.name);    // undefined

// 重写
person.name = "hello";
console.log(person.name);    // hello

// 枚举
console.log(Object.keys(person));    // ["name"]

// 设置name的writable属性为false
Object.defineProperty(person, "name", {
    writable: false
});

// 重写name
person.name = "hello";
console.log(person.name);    // 依然是 zxx
```

`注：一旦使用Object.defineProperty给对象添加属性，那么如果不设置属性的特性，那么configurable、enumerable 和 writable 的值都是默认的 false`

```js
var person = {}
// 不设置属性的特性，那么configurable、enumerable 和 writable 的值都是默认的 false
// 这样就导致name这个属性不能被重写、不能枚举、不能再次被设置特性
Object.defineProperty(person, "name", {});

// 设置值
person.name = "hello";
console.log(person.name);    // undefined

console.log(Object.keys(person));    // []
```

设置的特性总结为：  

- value: 设置属性的值；  

- writable: 值是否可以被重写。 true | false  

- enumerable: 目标属性是否可以被枚举。 true | false  

- configurable: 目标属性是否可以被删除或是否可以再次修改特性。 true | false  

## 存取器描述
当属性存取器描述属性特性的时候，允许设置以下特性属性：  

```js
var person = {};
Object.defineProperty(person, "newKey", {
    get: function () {} | undefined,
    set: function () {} | undefined,
    configurable: true | false,
    enumerable: true | false
});
```

`注：当使用了getter或setter方法，不允许使用writable和value这两个属性`

## getter/setter
当设置或获取对象的某个属性的值的时候，可以提供getter/setter方法

- getter 是一种获得属性值的方法
- setter 是一种设置属性值的方法

```js
var person = {};
var initValue = "zxx"
Object.defineProperty(person, "name", {
    get: function () {
        console.log("当获取值的时候触发的函数");
        return initValue; 
    },
    set: function (value) {
        console.log("当设置值的时候触发的函数，设置的新值通过参数value拿到");
        initValue = value;
    }
});

console.log(person.name);
// 当获取值的时候触发的函数
// zxx


// 修改name值
person.name = "hello";    // 当设置值的时候触发的函数，设置的新值通过参数value拿到
console.log(person.name);    
// 当获取值的时候触发的函数
// hello
```

`注： get或set不是必须成对出现，任写其一就可以，如果不设置方法，则get和set默认值为undefined`


## 兼容性
在ie8下只能在DOM对象上使用，尝试在原生的对象上使用`Object.defineProperty()`会报错。


## 实际使用  
如`vue2`中使用`Object.defineProperty` 进行收集依赖，侦听数据变化。  
部分代码 [defineReactive$$1](https://github.com/vuejs/vue/blob/v2.6.11/dist/vue.js#L1014) 如下：      
```js
Observer.prototype.walk = function walk(obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive$$1(obj, keys[i]);
  }
};

function defineReactive$$1(obj, key, val, customSetter, shallow) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  // 返回指定对象上一个自有属性对应的属性描述符

  if (property && property.configurable === false) {
    return;
  }

  var getter = property && property.get;
  var setter = property && property.set;
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }

  var childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }
      if (customSetter) {
        customSetter();
      }
      if (getter && !setter) {
        return;
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal);
      dep.notify();
    },
  });
}

```   


# 参考资料：

[MDN Object.defineProperty()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)  

[理解Object.defineProperty的作用 - SegmentFault 思否](https://segmentfault.com/a/1190000007434923)  

​