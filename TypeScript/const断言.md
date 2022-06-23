# const断言
先看以下代码：  
```js
let str = 'hello';
// let str: string


const stringLiteral = "https"; 
// const stringLiteral: "https"
```
变量`str`实际为一种宽泛的字符串类型，只要是字符串，都可赋值给变量`str`, 即`let`关键字声明的变量会被推断为拓宽后的类型；   
而变量`stringLiteral`有`const`关键字，其变量值不能进行修改， 所以推断为字面量类型是非常合适的。 它保留了赋值的准确类型信息;    
综上，`const`关键字实际是将宽泛的类型，例如字符串，数字等转化为具体的值类型。 而`as const`则是将此特性用于断言之中，方便类型转换操作。  

当然也可以使用尖括号断言语法:
```js 
let x = <const>"hello"; 
// let x: "hello"
```

# 使用  
## 对基本类型使用  
```js
let str = 'hello' as const;
// let str: "hello"

str = '2';
// 不能将类型“"2"”分配给类型“"hello"”

let num = 100 as const;
// let num: 100

num = 1;
// 不能将类型“1”分配给类型“100”
```
相当于推断为具体的值类型    

## 对数组使用  
```js
let arr1 = [1, 2, 3];
// let arr1: number[] 

let arr2 = [1, 2, 3] as const;
// let arr2: readonly [1, 2, 3] 

let arr3 = ['xman', 18];
// let arr3: (string | number)[]

arr3.push(false);
// 类型“false”的参数不能赋给类型“string | number”的参数

let arr4 = ['xman', 18] as const;
// let arr4: readonly ["xman", 18]

arr4.push(false);
// 类型“readonly ["xman", 18]”上不存在属性“push”
```

`arr3`数组被推断为`(string | number)[]`, 因此不能添加除了`string | number`之外的类型。   
`arr4`数组通过as const限定后，数组类型变为`readonly ["xman", 18]` 

## 对对象字面量使用  
```js
let obj1 = { name: "xman", age: 18 };
// let obj1: {
//   name: string;
//   age: number;
// };

let obj2 = { name: "xman", age: 18 } as const;
// let obj2: {
//   readonly name: "xman";
//   readonly age: 18;
// };

```
对象字面量应用 `const`断言后， 对象字面量的属性，将使用 `readonly` 修饰    
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

type T3 = typeof arr2[number]['name'];
// type T3 = "xman" | "zxx"
```

**总结**  
使用这个断言后, TS就明白:

- 表达式中的任何字面类型不应被拓宽  
- 对象字面量会获得`readonly`属性  
- 数组字面量会变成`readonly`元组  

# 举例说明  
## 示例1 
假设我们已经编写了以下函数。它接受 `URL` 和 `HTTP` 请求方法，使用浏览器的 `Fetch API` 向该 `URL` 发出 `GET` 或` POST `请求，并将响应反序列化为 `JSON`:  
```js
function fetchJSON(url: string, method: "GET" | "POST") {
  return fetch(url, { method }).then(response => response.json());
}
```
调用时传入url及请求方法： 
```js
// 没毛病
fetchJSON("https://example.com/", "GET").then(data => {
  // ...
});
```
现在让我们做一点重构。HTTP 规范定义了各种其他请求方法，如 DELETE、HEAD、PUT 等。我们可以定义一个枚举样式的映射对象，并列出各种请求方法：HTTPRequestMethod
```js
const HTTPRequestMethod = {
  CONNECT: "CONNECT",
  DELETE: "DELETE",
  GET: "GET",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
  PATCH: "PATCH",
  POST: "POST",
  PUT: "PUT",
  TRACE: "TRACE",
};
```
现在我们可以将函数调用中的字符串文本`GET`替换为：`fetchJSONHTTPRequestMethod.GET`
```js
// 类型“string”的参数不能赋给类型“"GET" | "POST"”的参数
fetchJSON("https://example.com/", HTTPRequestMethod.GET).then((data) => {
  // ...
});
```
根据之前内容我们可以知道`HTTPRequestMethod.GET`类型为`string`， 所以会出现`类型“string”的参数不能赋给类型“"GET" | "POST"”的参数`错误提示
这时我们可以使用`const`类型断言功能： 
```js
const HTTPRequestMethod = {
  CONNECT: "CONNECT",
  DELETE: "DELETE",
  GET: "GET",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
  PATCH: "PATCH",
  POST: "POST",
  PUT: "PUT",
  TRACE: "TRACE",
} as const;
```
HTTPRequestMethod类型为：
```js
const HTTPRequestMethod: {
  readonly CONNECT: "CONNECT";
  readonly DELETE: "DELETE";
  readonly GET: "GET";
  readonly HEAD: "HEAD";
  readonly OPTIONS: "OPTIONS";
  readonly PATCH: "PATCH";
  readonly POST: "POST";
  readonly PUT: "PUT";
  readonly TRACE: "TRACE";
};
```
此时再调用据不会出问题了：  
```js
// 没毛病
fetchJSON("https://example.com/", HTTPRequestMethod.GET).then((data) => {
  // ...
});
```
当然我们也可以使用枚举来解决：  
```js
enum HTTPRequestMethod {
  CONNECT = "CONNECT",
  DELETE = "DELETE",
  GET = "GET",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  PATCH = "PATCH",
  POST = "POST",
  PUT = "PUT",
  TRACE = "TRACE",
}
```

## 示例2 
通过`const`类型断言， 省略一些只用于提示编译器不变性的类型  
```js
export const Colors = {
  red: "RED",
  blue: "BLUE",
  green: "GREEN",
} as const;


// 或者使用 'export default'
export default {
  red: "RED",
  blue: "BLUE",
  green: "GREEN",
} as const;
```

# 注意事项  
1. const断言只能用于简单的字面量表达式 
```js
// 以下会出错  
// A 'const' assertions can only be applied to references to enum members, or string, number, boolean, array, or object literals.
let a = (Math.random() < 0.5 ? 0 : 1) as const;
let b = (60 * 60 * 1000) as const;

// 以下没毛病!
let c = Math.random() < 0.5 ? (0 as const) : (1 as const);
let d = 3_600_000 as const;

```
2. `const` 上下文不会立即将表达式转换为完全不可变 

```js
let arr = [1, 2, 3, 4];
let foo = {
  name: "foo",
  contents: arr,
} as const;

foo.name = "bar";
// Cannot assign to 'name' because it is a read-only property.

foo.contents = [];
// Cannot assign to 'contents' because it is a read-only property

foo.contents.push(5);   // 没毛病
```

以上ts代码均在 https://www.typescriptlang.org/play 上运行过，版本为4.7.2。  
最后， 如有错误，欢迎各位大佬指点！感谢！    


# 参考资料   
[https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)  
[https://mariusschulz.com/blog/const-assertions-in-literal-expressions-in-typescript](https://mariusschulz.com/blog/const-assertions-in-literal-expressions-in-typescript)