# 接口 
接口是一系列抽象方法的声明，是一些方法特征的集合，这些方法都应该是抽象的，需要由具体的类去实现，然后第三方就可以通过这组抽象方法调用，让具体的类执行具体的方法。
接口处理可用于对类的一部分行为进行抽象外，也常用于对对象的形状进行描述。  

**接口定义**如下：
```js
interface interface_name {
}
```
`注意:`  
1. 定义接口要首字母大写；
2. 只需要关注值的外形；
3. 如果没有特殊声明，定义的变量比接口少了一些属性是不允许的，多一些属性也是不允许的，赋值的时候，变量的形状必须和接口的形状保持一致
## 应用场景  
在声明一个对象、函数或者类时，先定义接口，确保其数据结构的一致性；
## 实例
```js
interface IPerson {
  name: string;
  age: number;
}

let person:IPerson = {
  name: 'xman',
  age: 18
}
```
以上我们定义了一个接口IPerson，接着定义了一个变量person，它的类型是IPerson。这样，我们就约束了 `person` 的形状必须和接口 `IPerson` 一致。

`变量的形状必须和接口的形状保持一致`  
```js
interface IPerson {
  name: string;
  age: number;
}

let person:IPerson = {
  name: 'xman'
}
// Type '{ name: string; }' is not assignable to type 'IPerson'.
// Property 'age' is missing in type '{ name: string; }'.

let person2:IPerson = {
  name: 'xman',
  age: 18,
  height: '60kg'
}
// Type '{ name: string; age: number; height: string; }' is not assignable to type 'IPerson'.
// Object literal may only specify known properties, and 'height' does not exist in type 'IPerson'.
```

# 接口属性

## 可选属性 
接口里的属性不全都是必需的。在可选属性名字定义的后面加一个`?`符合
```js
interface IPerson {
  name: string;
  age: number;
  height?: string;
}
```
好处： 
1. 对可能存在的属性进行预定义；
2. 捕获引用了不存在属性时的错误
此时仍不允许添加未定义的属性，如果引用了不存在的属性时会出现错误信息。  
## 只读属性 
一些对象属性只能在对象刚刚创建的时候修改其值。你可以在属性名前用 `readonly` 来指定只读属性  
```js
interface IPerson {
  readonly name: string;
  age: number;
}
```
修改只读属性值时会`Cannot assign to 'xxx' because it is a constant or a read-only property.`错误信息  
测试下:  
```js
let person:IPerson = {
  name: 'xman',
  age: 18
}
person.name = 'zxx';  // Cannot assign to 'name' because it is a constant or a read-only property.
```
TypeScript 可以通过 `ReadonlyArray<T>` 设置数组为只读，只是把所有可变方法去掉了，因此可以确保数组创建后再也不能被修改
```js
let arr: ReadonlyArray<T> = [1, 2, 3];
arr[0] = 100;   // Index signature in type 'ReadonlyArray<any>' only permits reading.
arr.push(4);  // Property 'push' does not exist on type 'ReadonlyArray<any>'.
arr.length = 0;   // Cannot assign to 'length' because it is a constant or a read-only property.
```

**readonly VS const**  
最简单判断该用`readonly`还是`const`的方法是看要把它做为变量使用还是做为一个属性。作为变量使用的话用 `const`，若作为属性则使用`readonly`。  

## 任意属性 
有时我们希望接口允许有任意的属性，语法是用`[]`将属性包裹起来
任意属性有两种定义的方式： 一种属性签名是string类型的， 一种是number类型  
### 任意属性为string类型 
```js
interface IPerson {
  name: string;
  age: number;
  [propName: string]: any;
}

let person:IPerson = {
  name: 'xman',
  age: 18,
  height: '60kg'
}
```
` [propName: string]: any`是指IPerson类型的对象可以有任意属性签名, string指的是对象的键名是字符串类型的， any则是指定属性值的类型 , 至于`propName`则类似于函数的形参，是可以取其他名字的。  

### 任意属性为number类型  
```js
interface StringArray { 
  [index: number]: string; 
}

let arr: StringArray = ['xman'];
```
`[index: number]: string`是指StringArray的数组可以有任意的数字下标，而且数组成员的类型必须是string。 同时 `index`也只是类似于函数形参的东西，用其他标识符也是完全可以的。

### 可以同时定义两种任意属性吗？  
可以， 但是`number` 类型的签名指定的值类型必须是 `string` 类型的签名指定的值类型的子集，举个例子：
```js
interface A {
  [index: number]: string;
  [propName: number]: number;
}

// Numeric index type 'string' is not assignable to string index type 'number'. 
```
说明： `string` 并不是 `number` 的子集。 
以下例子成立：  
因为Function是object的子集:
```js
interface A {
  [index: number]: Function;
  [propName: number]: object;
}
```
### 同时定义任意属性和其他类型的属性  
`注：`一旦定义了任意属性， 那么其他属性（确定属性、可选属性、只读属性等）的类型都必须是它的类型的子集  
```js
interface IPerson {
  name: string;
  age?: number;   // Property 'age' of type 'number' is not assignable to string index type 'string'.
  [propName: string]: string;
}

let person:IPerson = {
  name: 'xman',
  age: 18,
  height: '60kg'
}

// Type '{ name: string; age: number; height: string; }' is not assignable to type 'IPerson'.
// Property 'age' is incompatible with index signature.
// Type 'number' is not assignable to type 'string'.
```
以上例子中我们定义接口IPerson中有一个可选属性age，属性值的类型为number, 任意属性值string，number不是string的子属性，所以报错了。 
如何解决？我们可以使用联合类型：  
```js
interface IPerson {
  name: string;
  age?: number;    
  [propName: string]: string | number;
}

let person:IPerson = {
  name: 'xman',
  age: 18,
  height: '60kg'
}
```
对于number类型的任意属性,情况也是一样  
```js
type MyArray = {
  0: string, 
  [index: number]: number;
}

// Property '0' of type 'string' is not assignable to numeric index type 'number'.
```
但是，`number` 类型的任意属性签名不会影响其他 `string` 类型的属性签名：  
```js
type A {
  [index: number]: number;
  length: string;
}
```
如上，虽然指定了 `number` 类型的任意属性的类型是 `number`，但 `length` 属性是 `string` 类型的签名，所以不受前者的影响。

但是反过来就不一样了，如果接口定义了 `string` 类型的任意属性签名，它不仅会影响其他 `string` 类型的签名，也会影响其他 `number` 类型的签名。 

## 如何绕过多余属性的报错  
```js
interface IPerson {
  name: string;
  age: number;
}

let person: IPerson = {
  name: 'xman',
  age: 18,
  height: '60kg'
}
// Type '{ name: string; age: number; height: string; }' is not assignable to type 'IPerson'.
// Object literal may only specify known properties, and 'height' does not exist in type 'IPerson'.
```

### 类型断言 
类型断言是一种告诉编译器变量类型的机制。当 TypeScript 确定赋值无效时，我们可以选择使用类型断言来覆盖类型。如果我们使用类型断言，赋值总是有效的，所以我们需要确保我们是正确的。否则，我们的程序可能无法正常运行。

两种执行类型断言的方法:  
- 使用角括号<>
- as 关键字

```js
interface IPerson {
  name: string;
  age: number;
}

let person: IPerson = {
  name: 'xman',
  age: 18,
  height: '60kg'
} as IPerson

// 或者
let person1: IPerson = < IPerson > {
  name: 'xman',
  age: 18,
  height: '60kg'
} 
```
### 索引签名 
```js
interface IPerson {
  name: string;
  age: number;
  [prop: string]: any;
}

let person: IPerson = {
  name: 'xman',
  age: 18,
  height: '60kg'
}

```
### 鸭式辨型法  
鸭式辨型来自于James Whitecomb Riley的名言："像鸭子一样走路并且嘎嘎叫的就叫鸭子。"即具有鸭子特征的认为它就是鸭子, 也就是通过制定规则来判定对象是否实现这个接口。  
```js
interface LabeledValue {
  label: string;
}
function printLabel(labelledObj: LabeledValue) {
  console.log(labelledObj.label);
}

let myObj = { size: 10, label: "Size 10 Object" };
printLabel(myObj);
```
类型检查器会查看`printLabel`的调用。 `printLabel`有一个参数，并要求这个对象参数有一个名为`label`类型为`string`的属性。 需要注意的是，我们传入的对象参数实际上会包含很多属性，但是编译器只会检查那些必需的属性是否存在，并且其类型是否匹配。
```js
interface LabeledValue {
  label: string;
}
function printLabel(labeledObj: LabeledValue) {
  console.log(labeledObj.label);
} 
printLabel({ size: 10, label: "Size 10 Object" });   

// Argument of type '{ size: number; label: string; }' is not assignable to parameter of type 'LabeledValue'.
// Object literal may only specify known properties, and 'size' does not exist in type 'LabeledValue'.
```
以上代码，在参数里写对象就相当于是直接给labeledObj赋值，这个对象有严格的类型定义，所以不能多参数或少参数。而当你在外面将该对象用另一个变量`myObj`接收，`myObj`不会经过额外属性检查，但会根据类型推论为`let myObj: { size: number; label: string } = { size: 10, label: "Size 10 Object" };`，然后将这个`myObj`再赋值给`labeledObj`，此时根据类型的兼容性，两种类型对象，参照**鸭式辨型法**，因为都具有`label`属性，所以被认定为两个相同，故而可以用此法来绕开多余的类型检查。   

`注：` 具体可参考 https://segmentfault.com/a/1190000022418050  

## 函数类型 
除了描述带有属性的普通对象外，接口也可以描述函数类型。

为了使接口表示函数类型，我们需要给接口定义一个调用签名。 它就像是一个只有 `参数列表` 和 `返回值类型` 的函数定义。  
```js
interface SearchFunc {
  (source: string, subString: string): boolean;
}
 
let mySearch: SearchFunc;
mySearch = function(source: string, subString: string): boolean {
  return source.search(subString) > -1;
}
```
对于函数类型的类型检查来说，函数的参数名不需要与接口里定义的名字相匹配。你可以改变函数的参数名，只要保证函数参数的位置不变。函数的参数会被逐个进行检查：
```js
interface SearchFunc {
  (source: string, subString: string): boolean;
}
 
let mySearch: SearchFunc;
// source => src, subString => sub
mySearch = function(src: string, sub: string): boolean {
  return src.search(sub) > -1;
}
```
如果你不想指定类型，TypeScript 的类型系统会推断出参数类型，因为函数直接赋值给了 SearchFunc 类型变量。  
```js
interface SearchFunc {
  (source: string, subString: string): boolean;
}
 
let mySearch: SearchFunc;
mySearch = function(src, sub) {
  let result = src.search(sub);
  return result > -1;
}
```

# 类类型 
我们希望类的实现必须遵循接口定义，那么可以使用 `implements` 关键字来确保兼容性。

这种类型的接口在传统面向对象语言中最为常见，比如 java 中接口就是这种类类型的接口。这种接口与抽象类比较相似，但是接口只能含有抽象方法和成员属性，实现类中必须实现接口中所有的抽象方法和成员属性。  
```js
interface IPerson {
  name: string;
  age: number;
  say(str: string): string;
}

class Person implements IPerson {
  name: string;
  age: number;
  
  constructor (name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  
  say (str: string) {
    return 'str'
  }
}
```
`接口描述了类的公共部分，而不是公共和私有两部分。 它不会帮你检查类是否具有某些私有成员.`  

# 继承
接口可以通过其他接口来扩展自己。接口可继承多个接口。继承使用关键字 extends。
**单继承实例：**  
```js
interface IAnimal {
  name: string;
}

interface IPerson extends IAnimal{
  age: number;
}

let person = <IPerson> {};
person.name = 'xman';
person.age = 18;
```
编译以下代码，得到以下JavaScript代码：  
```js
var person = {};
person.name = 'xman';
person.age = 18;
```
**多继承实例：**
```js
interface Shape {
  color: string;
}
 
interface PenStroke {
  penWidth: number;
}
 
interface Square extends Shape, PenStroke {
  sideLength: number;
}
 
let square = {} as Square;
square.color = "blue";
square.sideLength = 10;
square.penWidth = 5.0;
```

# 混合类型 
对象可以同时做为函数和对象使用，并带有额外的属性
```js
interface Counter {
  (start: number): string;
  interval: number;
  reset(): void;
}
 
function getCounter(): Counter {
  let counter = function (start: number) { } as Counter;
  counter.interval = 123;
  counter.reset = function () { };
  return counter;
}
 
let c = getCounter();
c(10);
c.reset();
c.interval = 5.0;
```

以上代码，先声明了一个接口，包括number类型的索引签名、reset函数、interval属性  
` let counter = function (start: number) { } as Counter;`通过类型断言，将函数对象转换为 `Counter` 类型，转换后的对象不但实现了函数接口的描述，使之成为一个函数，还具有 interval 属性和 reset() 方法。



# 参考资料
https://www.tslang.cn/docs/handbook/interfaces.html  
https://juejin.cn/post/6855449252785717256  
https://segmentfault.com/a/1190000022418050  

