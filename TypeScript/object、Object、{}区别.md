
# 前言  
对于JavaScript而言， 有`Object`（首字母大写），`{}`对象,  没有`object`（首字母小写）,`object` 只是`typeof`返回的一个字符串 
```js
typeof null === 'object';   // true
typeof [] === 'object';   // true
```

# object 
[TypeScript2.2](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#object-type) 引入了被称为`object`类型的新类型， 它用于表示非原始类型。    
在 `JavaScript` 中以下类型被视为原始类型：
- string 
- boolean 
- number 
- bigint
- symbol
- null
- undefined  

除了以上原始类型外， 其他类型均被视为非基本类型。新的 `object` 类型表示如下：  
```js
// All primitive types
type Primitive = string | boolean | number | bigint | symbol | null | undefined;

// All non-primitive types
type NonPrimitive = object;
```
当对`object`类型的变量赋予原始值时， TS编译器会报错：  
```js
let obj: object;

obj = {};       // 没毛病
obj = [1, 2];   // 没毛病
obj = () => {}; // 没毛病

obj = 1;     // 不能将类型“1”分配给类型“object”
```

## 使用object类型进行类型声明  
着 TypeScript 2.2 ()的发布，[lib.es5.d.ts标准库的类型声明](https://github.com/microsoft/TypeScript/blob/main/lib/lib.es5.d.ts)已经更新，以使用新的对象类型。     
以下是 `Object.create()` 方法，现在需要为它们的原型参数指定 `object | null` 类型：  
```js
interface ObjectConstructor {
  create(o: object | null): any;

  create(o: object | null, properties: PropertyDescriptorMap & ThisType<any>): any;
}
```

对比下[lib.es5.d.ts 2.1版本](https://github.com/microsoft/TypeScript/blob/release-2.1/lib/lib.es5.d.ts)：  
```js
interface ObjectConstructor {
  create(o: null): any;

  create<T>(o: T): T;

  create(o: any, properties: PropertyDescriptorMap): any;
}
```
如果将原始类型作为原型传递给`Object.create()` 则会运行时抛出类型错误。TypeScript 现在能够捕获这些错误，并在编译时提示相应的错误：  
```js
const proto = {};

Object.create(proto);   // 没毛病
Object.create(null);   // 没毛病
Object.create(undefined);   // 类型“undefined”的参数不能赋给类型“object | null”的参数
Object.create(1);   // 类型“1”的参数不能赋给类型“object | null”的参数
Object.create(true);   // 类型“true”的参数不能赋给类型“object | null”的参数
Object.create("hello");   // 类型“"hello"”的参数不能赋给类型“object | null”的参数
```
此外还有`setPrototypeOf`方法：  
```js
// lib/lib.es2015.core.d.ts
setPrototypeOf(o: any, proto: object | null): any;
```

`object` 类型的另一个用例是作为 ES2015 的一部分引入的 `WeakMap、 WeakSet` 等数据结构。其中`WeakMap`它的键必须是对象，不能是原始值。[类型定义](https://github.com/microsoft/TypeScript/blob/main/lib/lib.es2015.collection.d.ts)如下： 
```js
// lib/lib.es2015.collection.d.ts

interface WeakMap<K extends object, V> {
  delete(key: K): boolean;
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): this;
}

interface WeakSet<T extends object> {
  add(value: T): this;
  delete(value: T): boolean;
  has(value: T): boolean;
}
```

# Object   
`Object`类型是所有`Object`类的实例的类型。 由以下两个接口来定义：  
- `Object` 接口定义了 `Object.prototype` 原型对象上的属性；  
- `ObjectConstructor` 接口定义了 Object 类的属性， 如上面提到的 `Object.create()`。


1. [`Object` 接口定义](https://github.com/microsoft/TypeScript/blob/main/lib/lib.es5.d.ts#L120)如下：  
```js
// lib/lib.es5.d.ts
interface Object {
  constructor: Function;
  toString(): string;
  toLocaleString(): string;
  valueOf(): Object;
  hasOwnProperty(v: PropertyKey): boolean;
  isPrototypeOf(v: Object): boolean;
  propertyIsEnumerable(v: PropertyKey): boolean;
}
```

2. [`ObjectConstructor` 接口定义](https://github.com/microsoft/TypeScript/blob/main/lib/lib.es5.d.ts#L152)    
```js
interface ObjectConstructor {
  new(value?: any): Object;
  (): any;
  (value: any): any;
  // ...
}
declare var Object: ObjectConstructor;
```

`Object` 类型的所有实例都继承了 `Object` 接口中的所有属性/方法。      
如果我们创建一个返回其参数的函数： 传入一个 Object 对象的实例，它总是会满足该函数的返回类型 —— 即要求返回值包含一个 toString() 方法  
```js
function f(x: Object): { toString(): string } {
  return x;   // 没毛病
}
``` 

# {}  
`{}`描述了一个没有成员的对象。当你试图访问这样一个对象的任意属性时，TypeScript 会产生一个编译时错误：  
```js
let obj = {};
// const obj: {}

obj.name = 'zxx';
// 类型“{}”上不存在属性“name”
```
但是，它在运行时与`Object`基本相同， 你可以使用在 `Object` 类型上定义的所有属性和方法，这些属性和方法可通过 `JavaScript` 的原型链隐式地使用（访问Object.prototype原型对象上的属性）：
```js
let obj = {};
// const obj: {}

let str = obj.toString();   // 没毛病
// let str: string
``` 

# Object 、 object、 {} 三者区别 
1. 所有原始类型（严格模式下，null 和 undefined 除外）、非原始类型都可以赋给 Object, {}类型;  
  `object` 类型，它用于表示非原始类型（undefined, null, boolean, number, bigint, string, symbol）  
```js
let upperCaseObject: Object;
let lowerCaseObject: object;
let ObjectLiteral: {};

let num = 1;
let bool = false;
let str = 'hello';
let big = 10n;
let sym = Symbol('foo');
let n = null;
let u = undefined;


upperCaseObject = num;      // 没毛病
upperCaseObject = bool;     // 没毛病
upperCaseObject = str;      // 没毛病
upperCaseObject = big;      // 没毛病
upperCaseObject = sym;      // 没毛病
upperCaseObject = n;        // 不能将类型“null”分配给类型“Object”
upperCaseObject = u;        // 不能将类型“undefined”分配给类型“Object”
upperCaseObject = [1, 2];   // 没毛病
upperCaseObject = { name: 'zxx'};   // 没毛病


lowerCaseObject = num;    // 不能将类型“number”分配给类型“object”
lowerCaseObject = [1, 2];    // 没毛病
lowerCaseObject = { name: 'zxx'};   // 没毛病


ObjectLiteral = num;      // 没毛病
ObjectLiteral = bool;     // 没毛病
ObjectLiteral = str;      // 没毛病
ObjectLiteral = big;      // 没毛病
ObjectLiteral = sym;      // 没毛病
ObjectLiteral = n;        // 不能将类型“null”分配给类型“Object”
ObjectLiteral = u;        // 不能将类型“undefined”分配给类型“Object”
ObjectLiteral = [1, 2];   // 没毛病
ObjectLiteral = { name: 'zxx'};   // 没毛病

```

`注意：` 
1. 在严格模式下，null 和 undefined 类型不能赋给 Object, object, {} 类型;
2. `{}` 与 `Object` 的效果几乎一样，即 `{}` == `Object`，但 `Object` 更规范

因此， 我们在约束类型为非原始值类型时， 应该使用`object`类型。  



2. 三者都可以使用 `Object` 类型上定义的所有属性和方法  
```js
let obj: object = {};
obj.toString();     // 没毛病
obj.hasOwnProperty('name');     // 没毛病
```

3. `Object`可以通过`new`来定义类型  
```js
let o = new Object();
// let o: Object
``` 

4. `Object` 是 `object` 的父类型，也是 `object` 的子类型  
```js
type bool0 = object extends Object ? true : false; 
// type bool0 = true

type bool1 = Object extends object ? true : false; 
// type bool1 = true

type bool2 = Object extends {} ? true : false; 
// type bool2 = true

type bool3 = {} extends Object ? true : false; 
// type bool3 = true

type bool4 = {} extends object ? true : false; 
// type bool4 = true

type bool5 = object extends {} ? true : false; 
// type bool5 = true

```

5. `{}`、 `Object` 类型更宽泛  
```js
let foo: { [key: string]: string } = {};
let bar: object = {};

bar = foo; // 没毛病

foo = bar; // 不能将类型“object”分配给类型“{ [key: string]: string; }”
```

以上ts代码均在 https://www.typescriptlang.org/play 上运行过，版本为4.7.2。  
最后， 如有错误，欢迎各位大佬指点！感谢！    




# 参考资料  
https://mariusschulz.com/blog/the-object-type-in-typescript  
https://2ality.com/2020/01/typing-objects-typescript.html   
https://www.jianshu.com/p/8d7cfc4b912c    