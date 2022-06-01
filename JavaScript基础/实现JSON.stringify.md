# 前言 
[JSON](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON)（JavaScript Object Notation）是一种语法，可用来序列化对象、数组、数值、字符串、布尔值和 null 。它基于 JavaScript 语法，但与之不同：JavaScript不是JSON，JSON也不是JavaScript。

JSON对象包括两个方法： parse和stringify方法。除了这两个方法，JSON这个对象本身并没有其他作用，也不能被调用或作为构造函数调用。


# JSON.parse(text[, reviver])

**方法说明**： 用来解析JSON字符串，构造由字符串描述的JavaScript值或对象。提供可选的reviver函数用以在返回之前对所得到的对象执行变换(操作)。  
**参数**： text， 要被解析成JavaScript值的字符串； reviver （可选），转换器, 如果传入该参数(函数)，可以用来修改解析生成的原始值，调用时机在parse函数返回之前。  
**返回值**： Object类型, 对应给定JSON文本的对象/值。  
异常： 若传入的字符串不符合 JSON 规范，则会抛出 SyntaxError 异常。  

```javascript
var json = '{"result":true, "count":42}';
obj = JSON.parse(json);

console.log(obj.count);
//  42

console.log(obj.result);
// true
```

# JSON.stringify(value[, replacer [, space]])

**方法说明**：将一个JavaScript值(对象或者数组)转换为一个 JSON字符串，如果指定了replacer是一个函数，则可以替换值，或者如果指定了replacer是一个数组，可选的仅包括指定的属性。  
**参数**：  

 - value

   将要序列化成一个JSON字符串的值   

 - replacer  可选

1. 如果该参数是一个函数，则在序列化过程中，被序列化的值的每个属性都会经过该函数的转换和处理；  
2. 如果该参数是一个数组，则只有包含在这个数组中的属性名才会被序列化到最终的 JSON 字符串中；  
3. 如果该参数为 null 或者未提供，则对象所有的属性都会被序列化；  
   
 - space 可选   
  1. 指定缩进用的空白字符串，用于美化输出（pretty-print）；
  2. 如果参数是个数字，它代表有多少的空格；上限为10；
  3. 该值若小于1，则意味着没有空格；
  4. 如果该参数为字符串（当字符串长度超过10个字母，取其前10个字母），该字符串将被作为空格；
  5. 如果该参数没有提供（或者为 null），将没有空格

**返回值**
  一个表示给定值的JSON字符串
  
  **异常**  

 - 当在循环引用时会抛出异常TypeError ("cyclic object value")（循环对象值）
 - 当尝试去转换 BigInt 类型的值会抛出TypeError ("BigInt value can't be serialized in JSON")（BigInt值不能JSON序列化）.

**JSON.stringify()将值转换为相应的JSON格式：**  
1. 转换值如果有 toJSON() 方法，该方法定义什么值将被序列化。
2. 非数组对象的属性不能保证以特定的顺序出现在序列化后的字符串中。
3. 布尔值、数字、字符串的包装对象在序列化过程中会自动转换成对应的原始值。
4. undefined、任意的函数以及 symbol 值，在序列化过程中会5. 被忽略（出现在非数组对象的属性值中时）或者被转换成 null（出现在数组中时）。函数、undefined 被单独转换时，会返回 undefined，如JSON.stringify(function(){}) or JSON.stringify(undefined).
5. 对包含循环引用的对象（对象之间相互引用，形成无限循环）执行此方法，会抛出错误。
6. 所有以 symbol 为属性键的属性都会被完全忽略掉，即便 replacer 参数中强制指定包含了它们。
7. Date 日期调用了 toJSON() 将其转换为了 string 字符串（同Date.toISOString()），因此会被当做字符串处理。
8. NaN 和 Infinity 格式的数值及 null 都会被当做 null。
9. 其他类型的对象，包括 Map/Set/WeakMap/WeakSet，仅会序列化可枚举的属性。

## **基本使用**

 
**1. 转换值如果有 toJSON() 方法，该方法定义什么值将被序列化**  
如果一个被序列化的对象拥有 toJSON 方法，那么该 toJSON 方法就会覆盖该对象默认的序列化行为：不是该对象被序列化，而是调用 toJSON 方法后的返回值会被序列化，例如：

```javascript
var obj = {
  foo: 'foo',
  toJSON: function () {
    return 'bar';
  }
};
JSON.stringify(obj);      // '"bar"'
JSON.stringify({x: obj}); // '{"x":"bar"}'
```
**2.非数组对象的属性不能保证以特定的顺序出现在序列化后的字符串中**  

```javascript
var obj = {
  a: function () {
    return "xxx";
  },
  b: 1,
  c: undefined
};
JSON.stringify(obj); // '{"b":1}'
```
**3.布尔值、数字、字符串的包装对象在序列化过程中会自动转换成对应的原始值**  

```javascript
JSON.stringify([new Number(1), new String("false"), new Boolean(false)]);
// '[1,"false",false]'
```
**4.undefined、函数、symbol转化**  
作为对象属性值时， undefined、任意的函数以及 symbol 值，在序列化过程中会被忽略

```javascript
JSON.stringify({x: undefined, y: Object, z: Symbol(""), fn: function () {}});
// '{}'
```
作为数组元素值时， undefined、任意的函数以及 symbol 值，在序列化过程中会被转换成null

```javascript
JSON.stringify([undefined, Object, Symbol(""), function fn() {}]);
// '[null,null,null,null]'
```
undefined、任意的函数以及 symbol 值单独转换时会返回undefined

```javascript
JSON.stringify(undefined);   // undefined
JSON.stringify(Symbol(""));   // undefined
JSON.stringify(function fn() {});   // undefined
```
**5.对象之间相互引用，形成无限循环，会抛出错误**   

```javascript
var obj = {};
obj.a = obj;
JSON.stringify(obj);
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/f88802f1c62f4506a5c9399a7f49dfc0.png)  

利用这个可判断有对象里有无循环引用;  如： [LeedCode 141. 环形链表](https://leetcode-cn.com/problems/linked-list-cycle/)     
```js
var hasCycle = function (head) {
  try {
    JSON.stringify(head);
    return false;
  } catch (error) {
    return true;
  }
}
```
**6.symbol 为属性键的属性都会被完全忽略掉**     

```javascript

JSON.stringify({[Symbol("foo")]: "foo"});
// '{}'

JSON.stringify({[Symbol.for("foo")]: "foo"}, [Symbol.for("foo")]);
// '{}'

// 指定第二个参数replacer
JSON.stringify({ [Symbol.for("foo")]: "foo" }, function (k, v) {
  if (typeof k === "symbol") {
    return "a symbol";
  }
});
// undefined

// toJSON
JSON.stringify({
  [Symbol("foo")]: "foo",
  toJSON: function () {
    return "to JSON";
  },
});
// '"to JSON"'
```
**7.Date 日期调用了 toJSON() 将其转换为了 string 字符串（同Date.toISOString()），因此会被当做字符串处理**

```javascript
var date = new Date();
console.log(date.toISOString());	// 2019-04-03T14:50:20.573Z
console.log(date.toJSON());		// 2019-04-03T14:50:20.573Z
JSON.stringify(date);		// '"2019-04-03T14:50:20.573Z"'
JSON.stringify({date: date});	// '{"date": "2019-04-03T14:50:20.573Z"}'
```
**8.NaN 和 Infinity 格式的数值及 null 都会被当做 null**

```javascript
JSON.stringify(NaN);  // "null"
JSON.stringify(Infinity);  // "null"
JSON.stringify(null);  // "null"
```
**9. 其他类型的对象，包括 Map/Set/WeakMap/WeakSet，仅会序列化可枚举的属性**

```javascript
var map = new Map();
map.set('a', 100);

var weakMap = new WeakMap();
weakMap.set({a:1}, 100);

var set = new Set();
set.add(100);

var weakSet = new WeakSet();
weakSet.add({a: 100});

JSON.stringify(map);	// '{}'
JSON.stringify(weakMap); // '{}'
JSON.stringify(set);	// '{}'
JSON.stringify(weakSet);	// '{}'


// 不可枚举的属性默认会被忽略：
JSON.stringify(
    Object.create(
        null,
        {
            x: { value: 'x', enumerable: false },
            y: { value: 'y', enumerable: true }
        }
    )
);

// "{"y":"y"}"
```


## **指定replacer参数基本用法**

 
**1. replacer作为函数时**

```javascript
JSON.stringify({name: 'zxx', sex: 'male', age: 18}, function (key, value) {
	if (typeof value === "string") {
    	return undefined;
    }
  	return value;
});
// '{"age":18}'
```
**2.replacer为数组，数组的值代表将被序列化成 JSON 字符串的属性名**

```javascript
JSON.stringify({name: 'zxx', sex: 'male', age: 18}, ['name']);  // '{"name":"zxx"}'
```

## 指定space参数 

```javascript
JSON.stringify({name: 'zxx', sex: 'male', age: 18}, null, 2); 
/*
{
  "name": "zxx",
  "sex": "male",
  "age": 18
}
*/
```

# 实现一个简单的JSON.stringify   

[json3.js](https://bestiejs.github.io/json3)中精简代码：  
```javascript
var objectProto = Object.prototype,
  getClass = objectProto.toString,
  isProperty = objectProto.hasOwnProperty,
  objectTypes = {
    function: true,
    object: true,
  };

var functionClass = "[object Function]",
  dateClass = "[object Date]",
  numberClass = "[object Number]",
  stringClass = "[object String]",
  arrayClass = "[object Array]",
  booleanClass = "[object Boolean]";

var simpleStringify = function (source, filter, width) {
  var whitespace, callback, properties, className;
  // 排除null
  if (objectTypes[typeof filter] && filter) {
    className = getClass.call(filter);
    if (className == functionClass) {
      callback = filter;
    } else if (className == arrayClass) {
      properties = {};
      for (var index = 0, length = filter.length, value; index < length; ) {
        value = filter[index++];
        className = getClass.call(value);
        if (className == "[object String]" || className == "[object Number]") {
          properties[value] = 1;
        }
      }
    }
  }
  if (width) {
    className = getClass.call(width);
    if (className == numberClass) {
      // 将'width'转换为整数
      if ((width -= width % 1) > 0) {
        if (width > 10) {
          width = 10;
        }
        for (whitespace = ""; whitespace.length < width; ) {
          whitespace += " ";
        }
      }
    } else if (className == stringClass) {
      whitespace = width.length <= 10 ? width : width.slice(0, 10);
    }
  }
  return serialize(
    "",
    ((value = {}), (value[""] = source), value),
    callback,
    properties,
    whitespace,
    "",
    []
  );
};

var forOwn = function (object, callback) {
  var isFunction = getClass.call(object) == functionClass,
    property;
  // for...in语句以任意顺序迭代一个对象的除Symbol以外的可枚举属性，包括继承的可枚举属性
  for (property in object) {
    if (!isFunction && isProperty.call(object, property)) {
      callback(property);
    }
  }
};

var quote = function (value) {
  return '"' + value + '"';
};

var serialize = function (
  property,
  object,
  callback,
  properties,
  whitespace,
  indentation,
  stack
) {
  var value = object[property],
    type,
    className,
    results,
    element,
    index,
    length,
    prefix,
    result;

  if (typeof value == "object" && value) {
    // 转换值如果有 toJSON() 方法，调用
    // 处理Date
    if (
      value.getUTCFullYear &&
      getClass.call(value) == dateClass &&
      value.toJSON === Date.prototype.toJSON
    ) {
      value = value.toJSON();
    } else if (typeof value.toJSON == "function") {
      value = value.toJSON(property);
    }
  }
  if (callback) {
    // 如果提供了替换函数，则调用它以获取值用于序列化
    value = callback.call(object, property, value);
  }
  // 如果 value 是 `undefined` or `null`就直接返回
  if (value == undefined) {
    return value === undefined ? value : "null";
  }
  type = typeof value;
  if (type == "object") {
    className = getClass.call(value);
  }
  switch (className || type) {
    case "boolean":
    case booleanClass:
      return "" + value;
    case "number":
    case numberClass:
      // `Infinity'和NaN'序列化为`“空”`。
      return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
    case "string":
    case stringClass:
      return quote("" + value);
  }
  // 递归序列化对象和数组.
  if (typeof value == "object") {
    // 检查循环结构
    for (length = stack.length; length--; ) {
      if (stack[length] === value) {
        // 循环结构不能由“JSON.stringify”序列化
        throw TypeError("Converting circular structure to JSON");
      }
    }
    // 将对象添加到遍历对象的堆栈中
    stack.push(value);
    results = [];
    // 缩进
    prefix = indentation;
    indentation += whitespace;
    if (className == arrayClass) {
      // 递归序列化数组元素
      for (index = 0, length = value.length; index < length; index++) {
        element = serialize(
          index,
          value,
          callback,
          properties,
          whitespace,
          indentation,
          stack
        );
        results.push(element === undefined ? "null" : element);
      }
      result = results.length
        ? whitespace
          ? "[\n" +
            indentation +
            results.join(",\n" + indentation) +
            "\n" +
            prefix +
            "]"
          : "[" + results.join(",") + "]"
        : "[]";
    } else {
      // 递归序列化对象成员
      forOwn(properties || value, function (property) {
        var element = serialize(
          property,
          value,
          callback,
          properties,
          whitespace,
          indentation,
          stack
        );
        if (element !== undefined) {
          results.push(
            quote(property) + ":" + (whitespace ? " " : "") + element
          );
        }
      });
      result = results.length
        ? whitespace
          ? "{\n" +
            indentation +
            results.join(",\n" + indentation) +
            "\n" +
            prefix +
            "}"
          : "{" + results.join(",") + "}"
        : "{}";
    }
    // 从遍历的对象堆栈中删除对象
    stack.pop();
    return result;
  }
};
```
测试：

```javascript
var obj = {
  foo: 'foo',
  toJSON: function () {
    return 'bar';
  }
};
simpleStringify(obj);      // '"bar"'
simpleStringify({x: obj}); // '{"x":"bar"}'


var obj1 = {
  a: function () {
    return 'xxx'
  },
  b: 1,
  c: undefined 
}
simpleStringify(obj1); // '{"b":1}'

simpleStringify({x: undefined, y: Object, z: Symbol(""), fn: function () {}});
// '{}'

simpleStringify([undefined, Object, Symbol(""), function fn() {}]);
// '[null,null,null,null]'

simpleStringify(undefined);   // undefined
simpleStringify(Symbol(""));   // undefined
simpleStringify(function fn() {});   // undefined

var circularObj = {};
circularObj.a = circularObj;
simpleStringify(circularObj); 
// 报错 Uncaught TypeError: Converting circular structure to JSON


simpleStringify({[Symbol("foo")]: "foo"});
// '{}'

simpleStringify({[Symbol.for("foo")]: "foo"}, [Symbol.for("foo")]);
// '{}'

// 指定第二个参数replacer
simpleStringify(
  {[Symbol.for("foo")]: "foo"},
  function (k, v) {
    if (typeof k === "symbol") {
      return "a symbol";
    }
  }
);
// undefined

// 指定第三个参数
simpleStringify({name: 'xman', age:18}, null, 2);
// '{\n  "name": "xman",\n  "age": 18\n}'

simpleStringify({
  [Symbol("foo")]: "foo",
  toJSON: function () {
    return "to JSON";
  },
});
// '"to JSON"'


simpleStringify(new Date());		// '"2022-06-01T09:18:54.216Z"'

simpleStringify(NaN);  // "null"
simpleStringify(Infinity);  // "null"
simpleStringify(null);  // "null"

var map = new Map();
map.set('a', 100);

var weakMap = new WeakMap();
weakMap.set({a:1}, 100);

var set = new Set();
set.add(100);

var weakSet = new WeakSet();
weakSet.add({a: 100});

simpleStringify(map);	// '{}'
simpleStringify(weakMap); // '{}'
simpleStringify(set);	// '{}'
simpleStringify(weakSet);	// '{}'


// 不可枚举的属性默认会被忽略：
simpleStringify(
  Object.create(null, {
    x: { value: "x", enumerable: false },
    y: { value: "y", enumerable: true },
  })
);

// "{"y":"y"}"


```

# 参考资料 
[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)  
[https://bestiejs.github.io/json3](https://bestiejs.github.io/json3)  
