# 前言
学习的[underscore.js](https://github.com/jashkenas/underscore) 源码版本为1.13.1

# _.extend   
_.extend(destination, *sources)   
将source对象中的所有属性简单地覆盖到destination对象上，并且返回 destination 对象. 复制是按顺序的, 所以后面的对象属性会把前面的对象属性覆盖掉(如果有重复)   
```js
_.extend(void 0, {a: 1});   // undefined
_.extend(null, {a: 1});  // null

_.extend({}, {a: 'b'});   // {a: 'b'}
_.extend({a: 'x'}, {a: 'b'});   // {a: 'b'}

_.extend({x: 'x'}, {a: 'a', x: 2}, {a: 'b'});   // {x: 2, a: 'b'}

var F = function() {};
F.prototype = {a: 'b'};
var subObj = new F();
subObj.c = 'd';

_.extend({}, subObj);   // {c: 'd', a: 'b'}
```
如何实现？   
```js
// 获取obj拥有的和继承的所有属性的名称
function allKeys(obj) {
  if (!isObject(obj)) return [];
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

/**
 * 
 * @param {object} obj 
 */
function extend (obj) {
  var length = arguments.length;
  // 只有一个参数或者 obj 为 null 、 undefined 直接返回
  if (length < 2 || obj == null) return obj;
  // 从第二个参数开始遍历
  // 其实也可以对参数进行过滤一遍（过滤掉非对象的参数）
  for (var index = 1; index < length; index++) {
    var source = arguments[index],
        keys = allKeys(source),
        l = keys.length;
    for (var i = 0; i < l; i++) {
      var key = keys[i];
      obj[key] = source[key];
    }
  }
  return obj;
}
```
# _.extendOwn
_.extendOwn(destination, *sources)   
与extend区别是只复制自己的属性覆盖到目标对象   
```js
// 与extend不一样, 只复制subObj自身属性覆盖到目标对象{}
_.extendOwn({}, subObj);    // {c: 'd'}
```
有了上面的extend，实现起来就容易了   
```js
// 判断对象自身属性中是否具有指定的属性
function has$1(obj, key) {
  return obj != null && hasOwnProperty.call(obj, key);
}
var nativeKeys = Object.keys;
// 获取obj上所有可枚举属性的名称
function keys(obj) {
  if (!isObject(obj)) return [];
  if (nativeKeys) return nativeKeys(obj);
  var keys = [];
  for (var key in obj) if (has$1(obj, key)) keys.push(key);
  return keys;
}

/**
 * 
 * @param {object} obj 
 */
function extendOwn (obj) {
  var length = arguments.length;
  // 只有一个参数或者 obj 为 null 、 undefined 直接返回
  if (length < 2 || obj == null) return obj;
  // 从第二个参数开始遍历
  // 其实也可以对参数进行过滤一遍（过滤掉非对象的参数）
  for (var index = 1; index < length; index++) {
    var source = arguments[index],
        // 就是此处与extend不一样
        keys = keys(source),
        l = keys.length;
    for (var i = 0; i < l; i++) {
      var key = keys[i];
      obj[key] = source[key];
    }
  }
  return obj;
}
```
既然两者如此接近，那么可以直接使用`高阶函数（是一个接收函数作为参数或将函数作为输出返回的函数）`来进行复用。在实现该高阶函数前再看一个_.defaults函数

# _.defaults 
_.defaults(object, *defaults)   
用defaults对象填充object 中的undefined属性。 并且返回这个object。一旦这个属性被填充，再使用defaults方法将不会有任何效果。   
```js
// 与extend区别一是会对object 中的undefined属性或不存在的属性进行填充
_.defaults({name: undefined, age: 18}, null, void 0, {name: 'zxx', age: 20, sex: 'male'});   // {name: 'zxx', age: 18, sex: 'male'}

// 区别二 是可以传null
_.defaults(null, {a: 1});   // {a: 1}
```
由上可以看出这三个函数其实很相似，看下如何实现利用传参的不同，返回不同的函数的高阶函数

# createAssigner
```js
/**
 * 利用传参的不同，返回不同的函数
 * @param {function} keysFunc 处理obj上属性名称的函数
 * @param {?boolean} defaults 是否是defaults函数
 */
function createAssigner(keysFunc, defaults) {
  return function(obj) {
    var length = arguments.length;
    // 对defaults 函数 obj可以为null，通过Object 构造函数为给定的参数创建一个包装类对象
    if (defaults) obj = Object(obj);
    if (length < 2 || obj == null) return obj;
    for (var index = 1; index < length; index++) {
      var source = arguments[index],
          keys = keysFunc(source),
          l = keys.length;
      for (var i = 0; i < l; i++) {
        var key = keys[i];
        // 兼容性处理
        // 对extend、extendOwn来说!defaults为true
        // 对defaults函数来说 obj 中的不存在该属性或属性值为undefined
        if (!defaults || obj[key] === void 0) obj[key] = source[key];
      }
    }
    return obj;
  };
}

var extend = createAssigner(allKeys);

var extendOwn = createAssigner(keys);

var defaults = createAssigner(allKeys, true);
```

# _.map
_.map(list, iteratee, [context])  
通过对 list 里的每个元素调用转换函数(iteratee迭代器)生成一个与之相对应的数组。iteratee传递三个参数：value，然后是迭代 index(或 key )，最后一个是引用指向整个list  
使用：  
```js
var arr = [1, 2, 3];
// 只有一个对象, 返回一个值组成的数组
_.map(arr);   // [1, 2, 3]

_.map({1: 'one', 2: 'two', 3: 'three'});    // ['one', 'two', 'three']

_.map(undefined);   // []

// 当 iteratee 为一个函数，正常处理
_.map(arr, function(num){ return num * 3; });   // [3, 6, 9]


var obj = [{name:'xman', age: 20}, {name: 'zxx', age: 18}];
// 当 iteratee 为一个对象，返回元素是否匹配指定的对象
_.map(obj, {name: 'zxx', age: 18});   // [false, true]


// 当 iteratee 为字符串或数组，返回元素对应的属性值的集合
_.map(obj, 'name');     // ['xman', 'zxx']
_.map(obj, ['age']);    // [20, 18]

var obj1 = {
  name: 'zxx',
  info: {
    age: 18
  }
};
// // 会取出深层次的值
_.map(obj1, ['age']);    // [undefined, 18]


// 传入context
_.map([1, 2, 3], function(item){
    return item + this.value;
}, {value: 100});     // [101, 102, 103]
```
看起来这功能真的是丧心病狂，下面自己来写一版   
## 实现第一版
```js
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
// 判断是否是类数组
var isArrayLike = function (obj) {
  let length = obj == null ? void 0 : obj.length;
  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
}

function isFunction (func) {
  return Object.prototype.toString.call(func) === '[object Function]'
};
var nativeIsArray = Array.isArray;
var isArray = nativeIsArray || function(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
}

function map (obj, iteratee, context) {
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length,
      results = Array(length), iterateeFn;
  // iteratee不存在
  if (iteratee == null) {
    // 迭代时直接返回原值
    iterateeFn = function (value) {
      return value;
    }
  } else if (isFunction(iteratee)) {  // iteratee为函数情况
    iterateeFn = function () {
      return iteratee.apply(context, arguments);
    }
  } else if (isObject(iteratee) && !isArray(iteratee)) {  // iteratee为对象且不是数组
    iterateeFn = (function () {
      var _keys = keys(iteratee), length = _keys.length;
      return function (obj) {
        for (var i = 0; i < length; i++) {
          var key = _keys[i];
          if (iteratee[key] !== obj[key] || !(key in obj)) return false;
        }
        return true;
      }
    })()
  } else {  // iteratee是数组或字符串、数字等
    iterateeFn = (function () {
      var path = isArray(iteratee) ? iteratee: [iteratee], length = path.length;
      return function (obj) {
        for (var i = 0; i < length; i++) {
          if (obj == null) return void 0;
          // 根据路径取出深层次的值
          obj = obj[path[i]];
        }
        return length ? obj : void 0;
      }
    })()
  }

  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    
    results[index] = iterateeFn(obj[currentKey], currentKey, obj);
  }
  return results;
}
```
以上代码基本上可以满足使用，接下来我们来看下源码：   

```js
function map(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length,
      results = Array(length);
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    results[index] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}
```



## cb   
cb 函数使用了 _.iteratee 函数，如果你修改这个函数，其实会影响多个函数，这些函数基本都属于集合函数，具体包括 map、find、filter、reject、every、some、max、min、sortBy、groupBy、indexBy、countBy、sortedIndex、partition、和 unique等   
```js
function cb(value, context, argCount) {
  // 修改了 _.iteratee 函数, 就使用我们自定义的 _.iteratee 函数来处理 value 和 context
  if (_$1.iteratee !== iteratee) return _$1.iteratee(value, context);
  return baseIteratee(value, context, argCount);
}
```

### iteratee
```js
function iteratee(value, context) {
  return baseIteratee(value, context, Infinity);
}
```

### baseIteratee
```js
function baseIteratee(value, context, argCount) {
  // 处理map函数中只传入一个参数的情况
  if (value == null) return identity;
  // 处理函数
  if (isFunction(value)) return optimizeCb(value, context, argCount);
  // 处理对象且不是数组
  if (isObject(value) && !isArray(value)) return matcher(value);
  return property(value);
}
```

###  identity
```js
// 返回传入的参数
function identity(value) {
  return value;
}
```
该函数直接看可能感觉没什么用，使用在迭代函数中就比较容易理解   


## optimizeCb     
```js
/**
 * underscore 内部方法
 * 根据 this 指向（context 参数）、 argCount 参数二次操作返回一些回调、迭代方法
 * @param {function} func 
 * @param {?*} context 
 * @param {?number} argCount 
 */
function optimizeCb(func, context, argCount) {
  // 如果没有指定 this 指向，则返回原函数
  if (context === void 0) return func;
  switch (argCount == null ? 3 : argCount) {
    case 1: return function(value) {
      return func.call(context, value);
    };
    // 如果有指定 this，但没有传入 argCount 参数
    // _.each、_.map等方法会走这里
    case 3: return function(value, index, collection) {
      return func.call(context, value, index, collection);
    };
    // _.reduce、_.reduceRight等方法会走这里
    case 4: return function(accumulator, value, index, collection) {
      return func.call(context, accumulator, value, index, collection);
    };
  }
  return function() {
    return func.apply(context, arguments);
  };
}
```

## matcher
返回一个断言函数，这个函数会给你一个断言可以用来辨别给定的对象是否匹配attrs指定键/值属性   
```js 
function matcher(attrs) {
  attrs = extendOwn({}, attrs);
  return function (obj) {
    return isMatch(obj, attrs);
  };
}
```

### isMatch
_.isMatch(object, properties)     
告诉你properties中的键和值是否包含在object中    
```js
/**
 * 判断properties中的键和值是否包含在object中
 * @param {object} object 
 * @param {?object} attrs 
 */
function isMatch(object, attrs) {
  var _keys = keys(attrs), length = _keys.length;
  if (object == null) return !length;
  var obj = Object(object);
  for (var i = 0; i < length; i++) {
    var key = _keys[i];
    if (attrs[key] !== obj[key] || !(key in obj)) return false;
  }
  return true;
}

var moe = {name: 'Moe Howard', hair: true};
var curly = {name: 'Curly Howard', hair: false};

isMatch(moe, {hair: true});   // true
isMatch(curly, {name: 'zxx'});  // false
isMatch(null, {});    // true

function Prototest() {}
Prototest.prototype.x = 1;
var specObj = new Prototest;

isMatch({x: 2}, specObj);  // true

```


## property
返回一个函数，该函数将返回任何传入对象的指定属性。 path 可以指定为简单 key（键），或者指定为对象键或数组索引的数组，用于深度属性提取   
```js 
function toPath$1(path) {
  return isArray(path) ? path : [path];
}
_$1.toPath = toPath$1;

/**
 * 内部方法，深层次获取对象中属性值
 * @param {object} obj 
 * @param {array|string|number} path 对象键或数组索引的数组或简单 key
 */
function deepGet(obj, path) {
  var length = path.length;
  for (var i = 0; i < length; i++) {
    if (obj == null) return void 0;
    obj = obj[path[i]];
  }
  return length ? obj : void 0;
}

function toPath(path) {
  return _$1.toPath(path);
}


function property(path) {
  path = toPath(path);
  return function(obj) {
    return deepGet(obj, path);
  };
}
```

# 总结
要学习 underscore 的源码，在分析集合相关的函数时一定会接触 cb 和 optimizeCb 函数，先掌握这两个函数，会帮助你更好更快的解读源码   

参考资料：    
https://github.com/mqyqingfeng/Blog/issues/58