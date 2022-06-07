# 元组 
我们知道数组中元素的数据类型都一般是相同的（any[] 类型的数组可以不同），如果存储的元素数据类型不同，则需要使用元组。

元组是一种数据类型，可以像任何其他变量一样使用。它表示值的异构集合，也可以作为函数调用中的参数传递。
在抽象数学中，术语元组用于表示多维坐标系。JavaScript 没有元组作为数据类型，但在 TypeScript 中可以使用元组。元组中元素的顺序很重要。

## 基本使用  
### 保存定长数据类型的数据  
```js
// 类型必须一一匹配且个数必须为2
let mytuple: [string, number];

mytuple = ['xman', 18];   // 正确


mytuple = ['xman'];
// Type '[string]' is not assignable to type '[string, number]'.
// Property '1' is missing in type '[string]'.



mytuple = ['xman', 18, '60kg'];
// Type '[string, number, string]' is not assignable to type '[string, number]'.
// Types of property 'length' are incompatible.
// Type '3' is not assignable to type '2'.
```
`注意：`  
元组类型只能表示一个已知元素数量和类型的数组，长度已指定，元素类型顺序必须是完全对照的，否则会出现错误信息。

`越界问题  `
```js
let mytuple: [string, number] = ['xman', 18];
mytuple.push('60kg');

console.log(mytuple);       // 正常输出  ['xman', 18, '60kg']
console.log(mytuple[2]);    // Index '2' is out-of-bounds in tuple of length 2.
```
`注意：`  
虽然可以越界添加元素（不建议），但是不能越界访问，越界访问会提示错误。如果一个数组中可能有多种类型，数量和类型都不确定，那就直接`any[]`
### 可选元素类型  
在定义元组类型时，我们可以通过 `?` 号来声明元组类型的可选元素  
实例如下： 
```js
let mytuple: [string, number, string?];

mytuple = ['xman', 18];    //  ['xman', 18]
console.log(mytuple);   


mytuple = ['xman', 18, '60kg'];
console.log(mytuple);    //  ['xman', 18, '60kg']
```
`注意：`
- 可选元素必须在必选元素的后面；
- 如果第一个元素后缀了 `?`号，其后的所有元素都要后缀 `?`号
代码解释：  
```js
let mytuple1: [string?, number];  // A required element cannot follow an optional element.

mytuple1 = ['xman', 18]; 

// 以下代码正确
let mytuple2: [string?, number?];

mytuple2 = ['xman', 18]; 
```

声明可选的元组元素有什么作用？  
如利用元组类型可选元素的特性来定义一个元组类型的坐标点，解决一、二、三维坐标点问题：  
```js
type Point = [number, number?, number?]; 
const x: Point = [10]; // 一维坐标点 
const xy: Point = [10, 20]; // 二维坐标点 
const xyz: Point = [10, 20, 10]; // 三维坐标点
```

### 解构赋值  
元组支持解构赋值  
```js
let mytuple: [string, number] = ['xman', 18];
let [userName, age] = mytuple;
console.loog(userName);    // 'xman'
console.loog(age);    // 18
```
`注意：`  
解构赋值元素的个数不能超过元组中元素的个数，否则会出现错误信息    
```js
let mytuple: [string, number] = ['xman', 18];
let [userName, age, height] = mytuple;  // Tuple type '[string, number]' with length '2' cannot be assigned to tuple with length '3'.
```
提示在位置索引2出不存在任何元素 

#### `Cannot redeclare block-scoped variable 'name'`   
具体可看 https://github.com/Microsoft/vscode/issues/22436  
源自以上代码  
```js
let mytuple: [string, number] = ['xman', 18];
let [name, age] = mytuple;    // Cannot redeclare block-scoped variable 'name'.
```

**原因：**
在默认状态下，`typescript` 将 `DOM typings` 作为全局的运行环境，所以当我们声明 `name`时， 与 `DOM` 中的全局 `window` 对象下的 `name` 属性出现了重名。因此，报了 `error TS2451: Cannot redeclare block-scoped variable 'name'.` 错误。

**解决方法：**  
**方法一**  
将运行环境由 `DOM typings` 更改成其他运行环境。
我们可以在 `tsconfig.json` 中做一下声明：
```js
{
    "compilerOptions": {
        "lib": [
            "es2015"
        ]
    }
}
```
**方法二**  
既然与全局的变量出现重名，那我们将脚本封装到模块module内。`module` 有自己的作用域，自然不会与全局作用域的变量产生冲突。

### 剩余元素 
元组类型里最后一个元素可以是剩余元素。 Rest 元素指定了元组类型是无限扩展的，可能有零个或多个具有数组元素类型的额外元素。
```js
let mytuple: [number, ...string[]] = [18, 'xman', '60kg'];
console.log(mytuple[0]);    // 18
console.log(mytuple[1]);    // xman
```
元组可以作为参数传递给函数，函数的 Rest 形参可以定义为元组类型：  
```js
function readButtonInput(...args: [string, number, ...boolean[]]) {
  const [name, version, ...input] = args;
  // ...

}
```
等价于:
```js
function readButtonInput(name: string, version: number, ...input: boolean[]) {
  // ...
}
```

### 设置为只读类型 
TypeScript 3.4 引入了对只读元组的新支持。为元组类型加上 `readonly` 关键字前缀，以使其成为只读元组。
如下：  
```js
let mytuple: readonly [string, number] = ['xman', 18];
```
在使用 `readonly` 关键字修饰元组类型之后，把所有可变方法去掉了，因此可以确保数组创建后再也不能被修改。任何企图修改元组中元素的操作都会抛出异常。
```js
// Property 'push' does not exist on type 'readonly [string, number]'. 
mytuple.push('60kg');
```

# 参考资料 
https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types     
