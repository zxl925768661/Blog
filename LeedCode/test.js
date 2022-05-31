









var difference = restArguments(function(array, rest) {
  rest = flatten$1(rest, true, true);
  return filter(array, function(value){
    return !contains(rest, value);
  });
});

/**
 * 遍历list中的每个值，返回所有通过predicate真值检测的元素所组成的数组
 * @param {object|array} obj 
 * @param {*} predicate 
 * @param {*} context 
 */
function filter(obj, predicate, context) {
  var results = [];
  // 根据 this 指向，返回 predicate 函数（判断函数）
  predicate = cb(predicate, context);
  each(obj, function(value, index, list) {
    // 遍历每个元素，如果符合条件则存入数组
    if (predicate(value, index, list)) results.push(value);
  });
  return results;
}

function each(obj, iteratee, context) {
  iteratee = optimizeCb(iteratee, context);
  var i, length;
  if (isArrayLike(obj)) {
    for (i = 0, length = obj.length; i < length; i++) {
      iteratee(obj[i], i, obj);
    }
  } else {
    var _keys = keys(obj);
    for (i = 0, length = _keys.length; i < length; i++) {
      iteratee(obj[_keys[i]], _keys[i], obj);
    }
  }
  return obj;
}



/**
 * 
 * @param {*} input 
 * @param {*} depth 
 * @param {*} strict 
 * @param {*} output 
 */
function flatten$1(input, depth, strict, output) {
  output = output || [];
  // depth为undefined、false
  if (!depth && depth !== 0) {
    depth = Infinity;
  } else if (depth <= 0) {
    return output.concat(input);
  }
  var idx = output.length;
  for (var i = 0, length = input.length; i < length; i++) {
    var value = input[i];
    // 数组 或者 arguments且length 属性值是不大于 Number.MAX_SAFE_INTEGER 的自然数
    if (isArrayLike(value) && (isArray(value) || isArguments$1(value))) {
      // Flatten current level of array or arguments object.
      if (depth > 1) {
        // 递归展开
        flatten$1(value, depth - 1, strict, output);
        idx = output.length;
      } else {
        var j = 0,
          len = value.length;
        // 将 value 数组的元素添加到 output 数组中
        while (j < len) output[idx++] = value[j++];
      }
    } else if (!strict) {
      output[idx++] = value;
    }
  }
  return output;
}

function flatten(array, depth) {
  return flatten$1(array, depth, false);
}



function values(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var values = Array(length);
  for (var i = 0; i < length; i++) {
    values[i] = obj[_keys[i]];
  }
  return values;
}
/**
 * 如果obj包含指定的item则返回true（使用===检测）。如果obj 是数组，内部使用indexOf判断。使用fromIndex来给定开始检索的索引位置。
 * @param {array|object} obj 
 * @param {*} item 包含项
 * @param {*} fromIndex  开始检索的索引位置
 * @param {*} guard 
 */
function contains(obj, item, fromIndex, guard) {
  // 如果是对象，返回 values 组成的数组
  if (!isArrayLike(obj)) obj = values(obj);
  // 如果没有指定该参数，则默认从头找起
  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
  // 使用indexOf寻找
  return indexOf(obj, item, fromIndex) >= 0;
}

function intersection(array) {
  var result = [];
  var argsLength = arguments.length;
  for (var i = 0, length = array.length; i < length; i++) {
    var item = array[i];
    // 返回的 result 是去重的
    if (contains(result, item)) continue;
    var j;
    // 判断其他参数数组中是否都有 item 这个元素
    for (j = 1; j < argsLength; j++) {
      if (!contains(arguments[j], item)) break;
    }
    if (j === argsLength) result.push(item);
  }
  return result;
}

/**
 * 返回 array去重后的副本, 使用 === 做相等测试. 
 * 如果 array 已经排序, 那么给 isSorted 参数传递 true值, 此函数将运行的更快的算法. 
 * 如果要处理对象元素, 传递 iteratee函数来获取要对比的属性
 * @param {array} array 
 * @param {*} isSorted 
 * @param {*} iteratee 
 * @param {*} context 
 */
function uniq(array, isSorted, iteratee, context) {
  if (!isBoolean(isSorted)) {
    context = iteratee;
    iteratee = isSorted;
    isSorted = false;
  }
  if (iteratee != null) iteratee = cb(iteratee, context);
  var result = [];
  var seen = [];
  for (var i = 0, length = array.length; i < length; i++) {
    var value = array[i],
        computed = iteratee ? iteratee(value, i, array) : value;
    if (isSorted && !iteratee) {
      if (!i || seen !== computed) result.push(value);
      seen = computed;
    } else if (iteratee) {
      if (!contains(seen, computed)) {
        seen.push(computed);
        result.push(value);
      }
    } else if (!contains(result, value)) {
      result.push(value);
    }
  }
  return result;
}


/**
 * 缓存某函数的计算结果
 * @param {*} func 
 * @param {?function} hasher 返回值作为key存储函数的计算结果
 */
function memoize(func, hasher) {
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!has$1(cache, address)) cache[address] = func.apply(this, arguments);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
}

var fibonacci = function(n) {
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
};

fibonacci = _.memoize(fibonacci);


var nativeCreate = Object.create;

function ctor() {
  return function(){};
}

function baseCreate(prototype) {
  // 如果 prototype 参数不是对象
  if (!isObject(prototype)) return {};
  // 如果浏览器支持 ES5 Object.create
  if (nativeCreate) return nativeCreate(prototype);
  var Ctor = ctor();
  Ctor.prototype = prototype;
  var result = new Ctor;
  Ctor.prototype = null;
  return result;
}

function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
  var self = baseCreate(sourceFunc.prototype);
  // 用 new 生成一个构造函数的实例
  // 正常情况下是没有返回值的，即 result 值为 undefined
  // 如果构造函数有返回值
  // 如果返回值是对象（非 null），则 new 的结果返回这个对象
  // 否则返回实例
  var result = sourceFunc.apply(self, args);
  // 如果构造函数返回了对象
  // 则 new 的结果是这个对象
  // 返回这个对象
  if (isObject(result)) return result;
  return self;
}

var bind = restArguments(function(func, context, args) {
  // 如果传入的参数 func 不是方法，则抛出错误
  if (!isFunction$1(func)) throw new TypeError('Bind must be called on a function');
  var bound = restArguments(function(callArgs) {
    return executeBound(func, bound, context, this, args.concat(callArgs));
  });
  return bound;
});


var bindAll = restArguments(function(obj, keys) {
  keys = flatten$1(keys, false, false);
  var index = keys.length;
  if (index < 1) throw new Error('bindAll must be passed function names');
  while (index--) {
    var key = keys[index];
    obj[key] = bind(obj[key], obj);
  }
  return obj;
});


/**
 * 局部应用一个函数填充在任意个数的 arguments，不改变其动态this值
 */
var partial = restArguments(function(func, boundArgs) {
  var placeholder = partial.placeholder;
  var bound = function() {
    var position = 0, length = boundArgs.length;
    var args = Array(length);
    for (var i = 0; i < length; i++) {
      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
    }
    while (position < arguments.length) args.push(arguments[position++]);
    return executeBound(func, bound, this, this, args);
  };
  return bound;
});

partial.placeholder = _$1;

/**
 * 类似setTimeout，等待wait毫秒后调用function。
 */
var delay = restArguments(function(func, wait, args) {
  return setTimeout(function() {
    return func.apply(null, args);
  }, wait);
});

/**
 * 延迟调用function直到当前调用栈清空为止，类似使用延时为0的setTimeout方法
 */
var defer = partial(delay, _$1, 1);

/**
 * 创建一个函数, 只有在运行了 count 次之后才有效果. 
 * 在处理同组异步请求返回结果时, 如果你要确保同组里所有异步请求完成之后才 执行这个函数，这将非常有用
 * @param {*} times 
 * @param {*} func 
 */
function after(times, func) {
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
}

/**
 * 创建一个函数,调用不超过count 次。 
 * 当count已经达到时，最后一个函数调用的结果将被记住并返回
 * @param {*} times 
 * @param {*} func 
 */
function before(times, func) {
  var memo;
  return function() {
    if (--times > 0) {
      memo = func.apply(this, arguments);
    }
    if (times <= 1) func = null;
    return memo;
  };
}


/**
 * 创建一个只能调用一次的函数
 */
var once = partial(before, 2);

/**
 * 将第一个函数 function 封装到函数 wrapper 里面, 并把函数 function 作为第一个参数传给 wrapper. 
 * 这样可以让 wrapper 在 function 运行之前和之后 执行代码, 调整参数然后附有条件地执行
 * @param {*} func 
 * @param {*} wrapper 
 */
function wrap(func, wrapper) {
  return partial(wrapper, func);
}


var testBefore = function(beforeAmount, timesCalled) {
  var beforeCalled = 0;
  var before = _.before(beforeAmount, function() { beforeCalled++; });
  while (timesCalled--) before();
  return beforeCalled;
};

function add (a, b) {
  return a + b;
}
// 执行 add 函数，一次传入两个参数即可
add(1, 2) // 3

// 假设有一个 partial 函数可以做到局部应用
var addOne = partial(add, 1);
addOne(2);  // 3



function chainResult(instance, obj) {
  return instance._chain ? _$1(obj).chain() : obj;
}





var defaults = function (obj) {
  var length = arguments.length, obj = Object(obj);
  if (length < 2 || obj == null) return obj;
    for (var index = 1; index < length; index++) {
      var source = arguments[index],
          keys = allKeys(source),
          l = keys.length;
      for (var i = 0; i < l; i++) {
        var key = keys[i];
        if (obj[key] === void 0) obj[key] = source[key];
      }
    }
    return obj;
}

function tagTester(name) {
  var tag = '[object ' + name + ']';
  return function(obj) {
    return toString.call(obj) === tag;
  };
}

var isString = tagTester('String');

var isNumber = tagTester('Number');

var isDate = tagTester('Date');

var isRegExp = tagTester('RegExp');

var isError = tagTester('Error');

var isSymbol = tagTester('Symbol');

var isArrayBuffer = tagTester('ArrayBuffer');

var isFunction = tagTester('Function');


