# typeof 类型操作符  
先来看看JavaScript中typeof的用法：  
具体可参考 [MDN typeof](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/typeof)  

> typeof 操作符返回一个字符串，表示未经计算的操作数的类型。   

| 类型                          | 结果           |
|-------------------------------|----------------|
| Undefined                     | "undefined"    |
| Null                          | "object"       |
| Boolean                       | "boolean"      |
| Number                        | "number"       |
| BigInt(ECMAScript 2020 新增)  | "bigint"       |
| String                        | "string"       |
| Symbol (ECMAScript 2015 新增) | "symbol"       |
| 宿主对象（由 JS 环境提供）    | 取决于具体实现 |
| Function 对象                 | "function"     |
| 其他任何对象                  | "object"       |

```js
// Undefined
typeof undefined === 'undefined';   // true
typeof declaredButUndefinedVariable === 'undefined';  // true

typeof null === 'object'; // true 
```

TypeScript中的`typeof`常见用途是在类型上下文中获取变量或者属性的类型， 此外还可以配合`ReturnType`获取函数的返回值类型， 以及配合 `keyof` 使用。  
如：  
1. 获取变量类型  
```js
function fn (x: string | number) {
  if (typeof x === 'string') {
    x.toFixed(2);       // Property 'toFixed' does not exist on type 'string'.
    return x.split('');  
  }  
  // ...
}
``` 

2. 获取对象的类型  
```js
interface IPerson {
  name: string;
  age: number;  
}
let person: IPerson = {
  name: 'xman',
  age: 18  
};
type Person = typeof person;

let p: Person = {
  name: 'zxx',
  age: 20  
}
```
以上代码中通过typeof获取到person对象的类型，之后我们就可以使用Person类型。  
对于嵌套对象也是一样：  
```js
const userInfo = {
  name: 'xman',
  age: 18,
  address: {
    provice: '湖北',
    city: '武汉'
  }  
}

type UserInfo = typeof userInfo;
```
此时UserInfo类型如下：    
```js
type UserInfo = {
  name: string;
  age: number;
  address: {
    provice: string;
    city: string;
  };
}  
```  

对只读属性的数组：  
```js
let arr: readonly number[] = [1, 2, 3];

type Type = typeof arr;
// type Type = readonly number[]

let arr1: Type = [2, 100];
arr1.push(1);
// type Type = readonly number[]
```

3. 获取函数的类型 
```js
function add (x: number, y: number): number {
  return x + y;  
}
type Add = typeof add;
```
此时Add类型为
```js
type Add = (x: number, y: number) => number
```
看下如果没有显式的描述函数返回类型，typeof会不会显示出返回类型：     
```js
function fn(x: string | number) {
  if (typeof x === "string") {
    return x.split("");
  }
  return x;
}

type Fn = typeof fn;
```
此时`Fn`类型为：  
```js
type T = (x: string | number) => number | string[]
```
可以看出， 返回类型都推断出来了。  

4. 对 `enum` 使用 `typeof`  
enum 是一种新的数据类型，但在具体运行的时候，它会被编译成对象  
```js
enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}
```
编译成JS后代码： 
```js
"use strict";
var Direction;
(function (Direction) {
  Direction[(Direction["Up"] = 1)] = "Up";
  Direction[(Direction["Down"] = 2)] = "Down";
  Direction[(Direction["Left"] = 3)] = "Left";
  Direction[(Direction["Right"] = 4)] = "Right";
})(Direction || (Direction = {}));
```
`Direction`值为： 
```js
{
  1: "Up",
  2: "Down",
  3: "Left",
  4: "Right",
  Up: 1,
  Down: 2,
  Left: 3,
  Right: 4,
};
```
对Direction使用typeof
```js
type Result = typeof Direction;

let res: Result = {
  Up: 2,
  Down: 4,
  Left: 6,
  Right: 8,
};
```
此时Result类型类似于：
```js
{
  Up: number,
  Down: number,
  Left: number,
  Right: number,
}
```

5. 对`class` 使用 `typeof`  
```js
class Person {
  name: string;
  age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

let PersonClass: typeof Person;
// let PersonClass: new (name: string, age: number) => Person

let person = new PersonClass("xman", 18);
```
使用`typeof Person`，意思是取`Person`类的类型，而不是实例的类型。 或者更确切的说：获取`Person`标识符的类型，也就是构造函数的类型。 这个类型包含了类的所有静态成员和构造函数。 之后，我们在`PersonClass`上使用new，创建`PersonClass`的实例。  

6. 配合`ReturnType`获取函数的返回值类型

`ReturnType`定义：  
```js
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

infer在这里用于提取函数类型的返回值类型。ReturnType<T> 只是将 infer R 从参数位置移动到返回值位置，因此此时 R 即是表示待推断的返回值类型。   

使用：  
```js
type Predicate = (x: unknown) => boolean;
type K = ReturnType<Predicate>;
// type K = boolean
```
如果我们直接对一个函数名使用 `ReturnType` ，我们会看到这样一个报错：    
```js
function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<f>;
// 'f' refers to a value, but is being used as a type here.
```
这是因为值（values）和类型（types）并不是一种东西。为了获取值` f` 也就是函数 `f` 的类型，我们就需要使用 `typeof`：
```js
function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<typeof f>;
// type P = {
//   x: number;
//   y: number;
// };
```

7. 配合 `keyof` 使用   
在 TypeScript 中，`typeof` 操作符可以用来获取一个变量或对象的类型。而 `keyof` 操作符可以用于获取某种类型的所有键，其返回类型是联合类型。
结合在一起使用：  
```js
const obj = {
  name: "xman",
  age: 18,
};

let k1: keyof typeof obj;
// let k1: "name" | "age"


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

enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

type Result = keyof typeof Direction;
// type Result = "Up" | "Down" | "Left" | "Right"
```

8. 对 const 断言字面量使用  
```js
let str1 = 'hello';
// let str1: string

type T1 = typeof str;
// type T1 = string

let str2 = 'hello' as const;
// let str2 = 'hello' as const;

type T2 = typeof str2;
// type T2 = "hello"
```
数组字面量应用 `const` 断言后，它将变成 `readonly` 元组，通过 `typeof` 操作符获取元组中元素值的联合类型  
```js
let arr1 = [1, 2, 3];
// let arr1: number[]

type T1 = typeof arr1;
// type T1 = number[]

let arr2 = [1, 2, 3] as const;
// let arr2: readonly [1, 2, 3]

type T2 = typeof arr2;
// type T2 = readonly [1, 2, 3]

// 通过 `typeof` 操作符获取元组中元素值的联合类型
type T3 = typeof arr2[number];
// type T3 = 1 | 2 | 3
```
对象字面量应用 `const`断言后， 对象字面量的属性，将使用 readonly 修饰  
```js
let obj1 = { name: "xman", age: 18 };
// let obj1: {
//   name: string;
//   age: number;
// };

type T1 = typeof obj1;
// type T1 = {
//   name: string;
//   age: number;
// };

let obj2 = { name: "xman", age: 18 } as const;
// let obj2: {
//   readonly name: "xman";
//   readonly age: 18;
// };

type T2 = typeof obj2;
// type T2 = {
//   readonly name: "xman";
//   readonly age: 18;
// };
```
同样适用于包含引用类型的数组:  
```js
let arr1 = [
  { name: "xman", age: 18 },
  { name: "zxx", age: 22 },
];
// let arr1: {
//   name: string;
//   age: number;
// }[];

type T1 = typeof arr1;
// type T1 = {
//   name: string;
//   age: number;
// }[];

let arr2 = [
  { name: "xman", age: 18 },
  { name: "zxx", age: 22 },
] as const;
// let arr2: readonly [
//   {
//     readonly name: "xman";
//     readonly age: 18;
//   },
//   {
//     readonly name: "zxx";
//     readonly age: 22;
//   }
// ];

type T2 = typeof arr2;
// type T2 = readonly [
//   {
//     readonly name: "xman";
//     readonly age: 18;
//   },
//   {
//     readonly name: "zxx";
//     readonly age: 22;
//   }
// ];

type T3 = typeof arr2[number]['name'];
// type T3 = "xman" | "zxx"
```

以上ts代码均在 https://www.typescriptlang.org/play 上运行过，版本为4.7.2。  
最后， 如有错误，欢迎各位大佬指点！感谢！  


# 参考资料   
[https://www.typescriptlang.org/docs/handbook/2/typeof-types.html](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html)  
[https://github.com/mqyqingfeng/Blog/issues/224](https://github.com/mqyqingfeng/Blog/issues/224)
