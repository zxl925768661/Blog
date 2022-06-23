# keyof 类型操作符  
对一个对象类型使用 `keyof` 操作符，会返回该对象属性名组成的一个字符串或者数字字面量的联合类型。  
如：  
```js
type Point = { x: number; y: number };
type P = keyof Point;
// type P = "x" | "y"
```  
以上代码中， 类型P类型为`"x" | "y" `联合类型  
如果这个类型有一个 string 或者 number 类型的索引签名，keyof 则会直接返回这些类型：  
```js
type Arrayish = { [n: number]: unknown };
type A = keyof Arrayish;
// type A = number

type Mapish = { [k: string]: boolean };
type M = keyof Mapish;
// type M = string | number
```
以上代码中， 为什么`M 是 string | number类型呢？`  
这时因为JavaScript 对象的属性名会被强制转为一个字符串，所以 obj[0] 和 obj["0"] 是一样的。  

# 接口  
对接口使用 `keyof`  : 
```js
interface IPerson {
  name: string;
  age: number;
  height?: string;
}

type k1 = keyof IPerson;
// type k1 = "name" | "age" | "height"

type k2 = keyof IPerson[];
// type k2 = number | "length" | "toString" | "toLocaleString" | "pop" | "push" | "concat" | "join" | "reverse" | "shift" | "slice" | "sort" | "splice" | "unshift" | "indexOf" | "lastIndexOf" | ...
```
# 类 
对类使用 `keyof`: 
```js
class Person {
  name: string = 'xman';
  age: number = 18;
  height: string = '60kg';
  [1]: boolean = true;
}

let key1: keyof Person;
// let key1: "name" | "age" | "height" | 1
```
尝试修改下：  
```js
key1 = 'address';
// 不能将类型“"address"”分配给类型“"name" | "age" | "height"”
```
# 基本数据类型  
```js
let K1: keyof number;  
// let K1: "valueOf" | "toString" | "toFixed" | "toExponential" | "toPrecision" | "toLocaleString"

let K2: keyof string; 
// let K2: number | "toString" | "charAt" | "charCodeAt" | "concat" | "indexOf" | "lastIndexOf" | "localeCompare" | "match" | "replace" | "search" | "slice" | "split" | ...

let K3: keyof boolean; 
// let K3: "valueOf"

let k4: keyof bigint;
// let k4: never  

let K5: keyof symbol;  
// let K5: "toString" | "valueOf"  

let k6: keyof undefined;
// let k6: never

let k7: keyof null;
// let k7: never
```
# 其他  
对对象字面量使用`keyof`: 
```js
const obj = {
  name: "xman",
  age: 18,
};

let k1: keyof typeof obj;
// let k1: "name" | "age"
```

**数字字面量联合类型**  
```js
const obj = {
  1: 'one',
  2: 'two',
  3: 'three'
} 
type k1 = keyof typeof obj;
// typeof obj 的结果为 {
//   1: string;
//   2: string;
//   3: string;
// }
// type k1 = 1 | 2 | 3
```

**支持 symbol 类型的属性名**  
```js
const sym1 = Symbol();
const sym2 = Symbol();
const sym3 = Symbol();

const symbolToNumberMap = {
  [sym1]: 1,
  [sym2]: 2,
  [sym3]: 3,
};

type KS = keyof typeof symbolToNumberMap; 
// type KS = typeof sym1 | typeof sym2 | typeof sym3
```

# keyof作用 

## 例1: prop函数 
JavaScript 是一种高度动态的语言。有时在静态类型系统中捕获某些操作的语义可能会很棘手。以一个简单的prop 函数为例：
```js
function prop(obj, key) {
  return obj[key];
}
```
该函数接收 obj 和 key 两个参数，并返回对应属性的值。对象上的不同属性，可以具有完全不同的类型，我们甚至不知道 obj 对象长什么样。

那么在 TypeScript 中如何定义上面的 prop 函数呢？  
```js
function prop(obj: {}, key: string) {
  return obj[key];
}
```
obj设置为`{}`, key 设置为` string`, 然而TypeScript 编译器会输出以下错误信息：
```js
Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'. No index signature with a parameter of type 'string' was found on type '{}'.
```
元素隐式地拥有 any 类型，因为 string 类型不能被用于索引 {} 类型  .
在prop函数里我们期望用户输入的属性是对象上已存在的属性，那么如何限制属性名的范围呢？  
这时可以利用`keyof` 操作符：  
```js
function prop<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
```
以上代码中，我们使用了 TypeScript 的泛型和泛型约束。首先定义了 `T` 类型，然后使用 `keyof` 操作符获取 `T` 类型的所有键，其返回类型是联合类型，最后利用 `extends` 关键字约束 `K` 类型必须为 `keyof T` 联合类型的子类型。  
此时`key`的类型为 `string | number | symbol` 联合类型。    
测试下：  
```js
interface Todo {
  id: number;
  text: string;
  due: Date;
}
const todo: Todo = {
  id: 1,
  text: "Buy milk",
  due: new Date(2016, 11, 31),
};

const id = prop(todo, "id");  
// const id: number

const text = prop(todo, "text"); 
// const text: string

const due = prop(todo, "due"); 
// const due: Date


const str:string = "hello";
// 测试字符串
const s = prop(str, 0); 
// const s: string
```
如果访问 todo 对象上不存在的属性时，会出现什么情况？  
```js
const date = prop(todo, "date");
// 类型“"date"”的参数不能赋给类型“"id" | "text" | "due"”的参数。
```
这就阻止我们尝试读取不存在的属性。

## 例2: Object.getOwnPropertyDescriptors函数 
查看 TypeScript 编译器附带的 lib.es2017.object.d.ts 类型声明文件中 ` Object.getOwnPropertyDescriptors()` 方法：  
```js
interface ObjectConstructor {
  // ...
  getOwnPropertyDescriptors<T>(o: T): {[P in keyof T]: TypedPropertyDescriptor<T[P]>} & { [x: string]: PropertyDescriptor };
}
```
`getOwnPropertyDescriptors` 方法用来获取一个对象的所有自身属性的描述符， 如果没有任何自身属性，则返回空对象   
```js
let obj = {name: 'xman'};
let des = Object.getOwnPropertyDescriptors(obj);
// des 值: {
//   name: {
//     configurable: true,
//     enumerable: true,
//     value: "xman",
//     writable: true
//   }
// }


// des 类型: {
//     name: TypedPropertyDescriptor<string>;
// } & {
//     [x: string]: PropertyDescriptor;
// }
```
解释： 对泛型`T`使用 `keyof` 操作符，会返回该对象属性名组成的一个字符串或者数字字面量的联合类型， `in`操作符用于确定属性是否存在于某个对象上，   
其中`TypedPropertyDescriptor`、`PropertyDescriptor` 接口定义为： 
```js
interface TypedPropertyDescriptor<T> {
  enumerable?: boolean;
  configurable?: boolean;
  writable?: boolean;
  value?: T;
  get?: () => T;
  set?: (value: T) => void;
}

interface PropertyDescriptor {
  configurable?: boolean;
  enumerable?: boolean;
  value?: any;
  writable?: boolean;
  get?(): any;
  set?(v: any): void;
}
```

最后， 如有错误，欢迎各位大佬指点！感谢！   



# 参考资料 
[https://www.typescriptlang.org/docs/handbook/2/keyof-types.html](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)  
[https://mariusschulz.com/blog/keyof-and-lookup-types-in-typescript](https://mariusschulz.com/blog/keyof-and-lookup-types-in-typescript)    
[TypeScript 之 Keyof Type Operator --- mqyqingfeng](https://github.com/mqyqingfeng/Blog/issues/223)