# ts
[[toc]]
- 安装ts cnpm i -g typescript@3.7.2
- tsc -v 查看版本
- tsc xxx.ts 会编译文件
- tsc --init 创建ts配置文件
## 配置文件
```js
compilerOptions{
   "target": "es5", // 将ts文件编译成es5
   "module": "commonjs", // 将所有语法编译成commonjs语法
   "strict"true,
   "esModuleInterop":true,// 通过es6模块的方式导入commonjs模块
}
// ts 引入文件 要写成 import * as react from 'react'
// 如果配置 esModuleInterop:true 才可以写成 import react from 'react'
```
## 配置脚本
```js
    "build": "tsc",
    "build:watch": "tsc --watch"
```

## base
- 变量冲突 ts文件声明的变量 默认是全局的  内部有name变量会冲突,处理办法在顶部添加`export { }`使其变成局部变量
- 如代码里面有export import 之类的代码 那么这个文件变成一个模块
```js
export { }
// `Cannot redeclare block-scoped variable 'name'.` 
let name:string = '111'
let age: number = 10
// 数组内只能放字符串  下面有2中方式声明
let hobbies:string[]=['s','1']
let interests:Array<string> = ['4','5']
// 元祖 类似数组  他是一个长度和类型都固定的数组,数组类型是固定的,元祖表示固定的结构,数组表示 一个列表
let point:[number,string]=[100,'222']
// 枚举 考虑变量的所有可能值 用单词表示它的每一个值
enum Week{
  MONDAY = 1,
  TUESDAY = 8
}
// 常数枚举
const enum Colors{
  Red,//他的值只能是0
  Yellow//1
}
// 任意类型
// 非空断言 root可能是null的时候   root!表示肯定不会是null  就可以在root后面加东西了
// ts 为dom提供了一整套的类型声明   
let root : HTMLElement|null = document.getElementById('root')
root!.style.color='red'

// null undefined
// null 空 undefined 未定义
// 他们是其他类型的子类型
// 要修改配置 strictNullChecks:false
let num1:string = null;
let num1:string = undefined;

// void 类型 空的 没有
function greeting(name:string):void{
  return null
}
// never 永远不
// never 是其他类型的子类型 代表不会出现的值
// 函数内部永远会抛出错误 导致函数无法正常结束
```
## 函数
```js
// 定义
function hello(name:string):void{}
// type 用来定义一个类型或者类型别名
type GetU = (fi:string) => void
// 函数表达式
let getUserName:GetU = function(fi:string):string{
  return fi
}
// 可选参数 
function print(name:string,age?:number){

}
print('zss')
print('zss',12)
// 默认参数
function ajax(url:string,method:string='GET'){}
ajax('/user')
// 剩余参数
function sum(...number:Array<number>){
  return number.reduce((a,b)=>a+b,0)
}
// 函数重载
// 函数的传递的参数做区分
function attr(val:string):void
function attr(val:number):void
function attr(val:any):void{
  if(typeof val === 'string'){
    // ...
  }else if(typeof val === 'number'){
    // ....
  }
}
```
## 类
namespace 可以包裹起来
```js
namespace c{
  class Person{
    constructor(public name:string){

    }
  }
  let p = new Person('xx')
  p.name = 'xxx'
}
```
## 继承
- 子类继承父类后子类的实例上就拥有了父类中的属性和方法
- 访问修饰符 public protected private
## 装饰器
- 如果装上的是普通属性的话 那么这个target指向类的原型 
- 如果装饰的是一个类的属性static 那么这个target指定类的定义
## 接口
- 接口就是用来约束用的
- 任意属性
- 约束对象 
```js
interface Pl{
  [propName:string]:number
}
let obj:Pl={
  x:1,
  y:2
}
```
- 约束数组和对象
```js
interface pl{
  [index:number]:string
}
let arr:p1=['1','2']
let obj:p1={
  1:'1',
  2:'2'
}
```
- 接口的继承
```js
interface s1{
  speak():void
}
interface s2 extends s1{
  speak1():void
} 
// 继承了都要实现
class Person implement s2{
  speak(){}
  speak1(){}
}
```
- 约束函数
```js
interface Discount{
  (price:number):number
}
let cost:Discount = function(price:number):number{
  return price*0.8
}
```
- 约束类
```js
interface speak{
  name:string,
  speak(word:string):void
}
class Dog implements speak{
  name:string;
  speak(){}
}
```
- 约束构造函数
```js
class Animal{}
interface wi{
  new(name:string):Animal
}
function cr(clazz:wi,name:string){
  return new clazz(name)
}
let a = cr(Animal,'xxx')
```
## 函数的协变与逆变
- 参数逆变父类 返回值协变子类
- 返回值类型可以传子类,参数可以传父类
```js
class Animal{}
class Dog extends Animal{
    public name:string = 'Dog'
}
class BlackDog extends Dog {
    public age: number = 10
}
class WhiteDog extends Dog {
    public home: string = '北京'
}
let animal: Animal;
let blackDog: BlackDog;
let whiteDog: WhiteDog;
type Callback = (dog: Dog)=>Dog;
function exec(callback:Callback):void{
    callback(whiteDog);
}
//不行  callback(redDog);
type ChildToChild = (blackDog: BlackDog) => BlackDog;
const childToChild: ChildToChild = (blackDog: BlackDog): BlackDog => blackDog
exec(childToChild);

//也不行,理由同上
type ChildToParent = (blackDog: BlackDog) => Animal;
const childToParent: ChildToParent = (blackDog: BlackDog): Animal => animal
exec(childToParent);

//不行 因为有可能调用返回的Dog的方法
type ParentToParent = (animal: Animal) => Animal;
const parentToParent: ParentToParent = (animal: Animal): Animal => animal
exec(parentToParent);

//可以,所有的狗都是动物,返回的不管什么狗都是狗
type ParentToChild = (animal: Animal) => BlackDog;
const parentToChild: ParentToChild = (animal: Animal): BlackDog => blackDog
exec(parentToChild);
//(Animal → Greyhound) ≼ (Dog → Dog)
//返回值类型很容易理解：黑狗是狗的子类。但参数类型则是相反的：动物是狗的父类！
```
## 泛型
- 泛型是指在定义函数 接口 类的时候 不预先指定具体类型 而在使用的时候在指定类型的一种特性
- 泛型T 作用只限于函数内部使用 
- 其实就是一个占位符 用的时候 传入啥 这个占位符就是啥
```js
  function cr<T>(length:number,value:T):Array<T>{
    let rs:Array<any> = [];
    for(let i = 0 ;i<length;i++){
      rs[i] = value
    }
    return rs
  }
  let r1 = cr<string(3,'x')
```

## interface&&type
- interface定义一个实实在在的接口,他是一个真正的类型,接口创建了一个新的名字，它可以在其他任意地方被调用，类型别名并不是创建新的名字,类型不能被extends和implements 这个时候一般用接口
- type一般用在定义别名,并不是真正的类型,当我们需要使用联合类型或者元祖类型的时候 类型别名会更合适

## 交叉类型
### mixin
- 混入模式可以让你从两个对象中创建一个新对象，新对象会拥有着两个对象所有的功能
```js
interface AnyObject {
    [prop: string]: any;
}

function mixin<T extends AnyObject, U extends AnyObject>(one: T,two: U): T & U {
    const result = <T & U>{};
    for (let key in one) {
        (<T>result)[key] = one[key];
    }
    for (let key in two) {
        (<U>result)[key] = two[key];
    }
    return result;
}

const x = mixin({ name: "zhufeng" }, { age: 11 });
console.log(x.name, x.age);
```
### typeof
- 可以获取一个变量的类型
```js
//先定义变量，再定义类型
let p1 = {
    name:'zhufeng',
    age:10,
    gender:'male'
}
type People = typeof p1;
function getName(p:People):string{
    return p.name;
}
getName(p1);
```
### 索引访问操作符
```js
interface Person{
    name:string;
    age:number;
    job:{
        name:string
    };
    interests:{name:string,level:number}[]
}
let FrontEndJob:Person['job'] = {
    name:'前端工程师'
}
let interestLevel1:Person['interests'][0]['level'] = 2;
let interestLevel2:Person['interests'][number]['level'] = 2;
```
### keyof
- 获取接口的属性
```js
interface Person{
  name:string;
  age:number;
  gender:'male'|'female';
}
//type PersonKey = 'name'|'age'|'gender';
type PersonKey = keyof Person;

function getValueByKey(p:Person,key:PersonKey){
  return p[key];
}
let val = getValueByKey({name:'zhufeng',age:10,gender:'male'},'name');
console.log(val);
```
### 映射类型
- 在定义的时候用in操作符去批量定义类型中的属性
```js
interface Person{
  name:string;
  age:number;
  gender:'male'|'female';
}
//批量把一个接口中的属性都变成可选的
type PartPerson = {
  [Key in keyof Person]?:Person[Key]
}

let p1:PartPerson={};
//也可以使用泛型
type Part<T> = {
  [key in keyof T]?:T[key]
}
let p2:Part<Person>={};
```
### 条件类型
- 在定义泛型的时候能够添加进逻辑分支，以后泛型更加灵活
- 定义条件类型
```js
interface Fish {
    name: string
}
interface Water {
    name: string
}
interface Bird {
    name: string
}
interface Sky {
    name: string
}
//若 T 能够赋值给 Fish，那么类型是 Water,否则为 Sky
type Condition<T> = T extends Fish ? Water : Sky;
let condition: Condition<Fish> = { name: '水' };
```
- 条件类型的分发
```js
interface Fish {
    fish: string
}
interface Water {
    water: string
}
interface Bird {
    bird: string
}
interface Sky {
    sky: string
}
//naked type
type Condition<T> = T extends Fish ? Water : Sky;

//(Fish extends Fish ? Water : Sky) | (Bird extends Fish ? Water : Sky)
// Water|Sky
let condition1: Condition<Fish | Bird> = { water: '水' };
let condition2: Condition<Fish | Bird> = { sky: '天空' };
```
- 找出T类型中U不包含的部分
```js
//never会被自动过滤
type Diff<T, U> = T extends U ? never : T;

type R = Diff<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "b" | "d"
const r:R = 'd' // 只能是d


type Filter<T, U> = T extends U ? T : never;
type R1 = Filter<string | number | boolean, number>;
```
## 内置条件类型
- TS 在内置了一些常用的条件类型，可以在 lib.es5.d.ts 中查看：
### Exclude
- 从 T 可分配给的类型中排除 U
```js
type Exclude<T, U> = T extends U ? never : T;

type  E = Exclude<string|number,string>;
let e:E = 10;
```
### ReturnType
- infer 最早出现在此 PR 中，表示在 extends 条件语句中待推断的类型变量
- infer 推断用的 
- 获取函数类型的返回类型
```js
export {}
type ReturnType<T extends (...args: any[]) => any> = T extends ((...args: any[]) => infer R) ? R : any;
function getUserInfo() {
    return { name: "zhufeng", age: 10 };
}

// 通过 ReturnType 将 getUserInfo 的返回值类型赋给了 UserInfo
type UserInfo = ReturnType<typeof getUserInfo>;

const userA: UserInfo = {
    name: "zhufeng",
    age: 10
};
```
## 内置工具类型
### Partial
- Partial 可以将传入的属性由非可选变为可选，具体使用如下：
```js
type Partial<T> = { [P in keyof T]?: T[P] };

interface A {
  a1: string;
  a2: number;
  a3: boolean;
}

type aPartial = Partial<A>;

const a: aPartial = {}; // 不会报错
```
### 类型递归
- DeepPartial 对Partial 进行深度 遍历
```js
interface Company {
    id: number
    name: string
}

interface Person {
    id: number
    name: string
    company: Company
}
type DeepPartial<T> = {
    [U in keyof T]?: T[U] extends object
    ? DeepPartial<T[U]>
    : T[U]
};

type R2 = DeepPartial<Person>
```
### Required
```js
Required 可以将传入的属性中的可选项变为必选项，这里用了 -? 修饰符来实现。
interface Person{
  name:string;
  age:number;
  gender?:'male'|'female';
}
/**
 * type Require<T> = { [P in keyof T]-?: T[P] };
 */
let p:Required<Person> = {
  name:'zhufeng',
  age:10,
  //gender:'male'
}
```
### Readonly
```js
Readonly 通过为传入的属性每一项都加上 readonly 修饰符来实现。
interface Person{
  name:string;
  age:number;
  gender?:'male'|'female';
}
//type Readonly<T> = { readonly [P in keyof T]: T[P] };
let p:Readonly<Person> = {
  name:'zhufeng',
  age:10,
  gender:'male'
}
p.age = 11;
```
### Pick
- Pick 能够帮助我们从传入的属性中摘取某一项返回
```js
interface Animal {
  name: string;
  age: number;
  gender:number
}
/**
 * From T pick a set of properties K
 * type Pick<T, K extends keyof T> = { [P in K]: T[P] };
 */
// 摘取 Animal 中的 name 属性
interface Person {
    name: string;
    age: number;
    married: boolean
}
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result: any = {};
    keys.map(key => {
        result[key] = obj[key];
    });
    return result
}
let person: Person = { name: 'zhufeng', age: 10, married: true };
let result: Pick<Person, 'name' | 'age'> = pick<Person, 'name' | 'age'>(person, ['name', 'age']);
console.log(result);
```

### Record
- Record 是 TypeScript 的一个高级类型
- 他会将一个类型的所有属性值都映射到另一个类型上并创造一个新的类型
```js
/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
function mapObject<K extends string | number, T, U>(obj: Record<K, T>, map: (x: T) => U): Record<K, U> {
    let result: any = {};
    for (const key in obj) {
        result[key] = map(obj[key]);
    }
    return result;
}
let names = { 0: 'hello', 1: 'world' };
let lengths = mapObject<string | number, string, number>(names, (s: string) => s.length);
console.log(lengths);//{ '0': 5, '1': 5 }
type Point = 'x' | 'y';
type PointList = Record<Point, { value: number }>
const cars: PointList = {
    x: { value: 10 },
    y: { value: 20 },
}
```
## module && namespace
- 文件模块
- 文件模块也被称为外部模块。如果在你的 TypeScript 文件的根级别位置含有 import 或者 export，那么它会在这个文件中创建一个本地的作用域
```js
export const a = 1;
export const b = 2;
export default 'zhufeng';

import name, { a, b } from './1';
console.log(name, a, b);
```
- 命名空间
- 在代码量较大的情况下，为了避免命名空间冲突，可以将相似的函数、类、接口放置到命名空间内
- 命名空间可以将代码包裹起来，只对外暴露需要在外部访问的对象，命名空间内通过export向外导出
- 命名空间是内部模块，主要用于组织代码，避免命名冲突
```js
// 1.ts
export namespace zoo {
    export class Dog { eat() { console.log('zoo dog'); } }
}
export namespace home {
    export class Dog { eat() { console.log('home dog'); } }
}
let dog_of_zoo = new zoo.Dog();
dog_of_zoo.eat();
let dog_of_home = new home.Dog();
dog_of_home.eat();

import { zoo } from './1';
let dog_of_zoo = new zoo.Dog();
dog_of_zoo.eat();
```
- namespace 和 module 不一样，namespace 在全局空间中具有唯一性
- 每个文件是独立的
## 类型声明
- 声明文件可以让我们不需要将JS重构为TS，只需要加上声明文件就可以使用系统
- 类型声明在编译的时候都会被删除，不会影响真正的代码
- 关键字 declare 表示声明的意思,我们可以用它来做出各种声明:
```js
declare var 声明全局变量
declare function 声明全局方法
declare class 声明全局类
declare enum 声明全局枚举类型
declare namespace 声明(含有子属性的)全局对象
interface 和 type 声明全局类型
```
## 类型声明文件
- 我们可以把类型声明放在一个单独的类型声明文件中
- 可以在类型声明文件中使用类型声明
- 文件命名规范为*.d.ts
- 观看类型声明文件有助于了解库的使用方式
- typings\jquery.d.ts
```ts
declare const $:(selector:string)=>{
    click():void;
    width(length:number):void;
}
```
- tsconfig.json
```yaml
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2015",  
    "outDir":"lib"
  },
  "include": [
    "src/**/*",
    "typings/**/*"
  ]
}
```
- src\test.ts
```ts
$('#button').click();
$('#button').width(100);
export {};
```
### 第三方声明文件
- 可以安装使用第三方的声明文件
- @types是一个约定的前缀，所有的第三方声明的类型库都会带有这样的前缀
- JavaScript 中有很多内置对象，它们可以在 TypeScript 中被当做声明好了的类型
- 内置对象是指根据标准在全局作用域（Global）上存在的对象。这里的标准是指 ECMAScript 和其他环境（比如 DOM）的标准
- 这些内置对象的类型声明文件，就包含在TypeScript 核心库的类型声明文件中
- 使用jquery
```ts
cnpm i jquery -S
//对于common.js风格的模块必须使用 import * as 
import * as jQuery from 'jquery';
jQuery.ajax('/user/1');
```
- 安装声明文件
```ts
cnpm i @types/jquery -S
```
### 查找声明文件
- 如果是手动写的声明文件，那么需要满足以下条件之一，才能被正确的识别
- 给 package.json 中的 types 或 typings 字段指定一个类型声明文件地址
- 在项目根目录下，编写一个 index.d.ts 文件
- 针对入口文件（package.json 中的 main 字段指定的入口文件），编写一个同名不同后缀的 .d.ts 文件
```js
{
    "name": "myLib",
    "version": "1.0.0",
    "main": "lib/index.js",
    "types": "myLib.d.ts",
}
```
- 先找myLib.d.ts
- 没有就再找index.d.ts
- 还没有再找lib/index.d.js
- 还找不到就认为没有类型声明了
### 导入导出
- export = {} 是ts的语法 (commonJs)
```js
// 1.ts
const obj ={
    a:1
}
export = obj;

// 2.ts
import * as r from './1';
console.log(r.a)
```
### 自己编写声明文件
- types\jquery\index.d.ts
```ts
declare function jQuery(selector:string):HTMLElement;
declare namespace jQuery{
  function ajax(url:string):void
}
export = jQuery;
```
- tsconfig.json
- 如果配置了paths,那么在引入包的的时候会自动去paths目录里找类型声明文件
- 在 tsconfig.json 中，我们通过 compilerOptions 里的 paths 属性来配置路径映射
- paths是模块名到基于baseUrl的路径映射的列表
```yaml
{
  "compilerOptions": {
    "baseUrl": "./",// 使用 paths 属性的话必须要指定 baseUrl 的值
    "paths": {
      "*":["types/*"]
    }
}
```
```js
import $ from "jquery";
$.ajax('get');
```
### include && paths
- `paths` 给当前的库指定路径 找声明文件
- `include` 对那些文件进行ts 合并校验
```yaml
{
  "compilerOptions": {
    "target": "ES5",                                /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ES2021', or 'ESNEXT'. */
    "module": "commonjs",                           /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', 'es2020', or 'ESNext'. */
    "strictNullChecks": true, // null undefined 不是其它类型的子类型
    "lib":["dom", "ESNext","ES2015.Reflect","ES2015.Iterable"], //  指定编译的库 symbol 就属于ESNext  console 属于dom
    "experimentalDecorators": true, //支持装饰器
    "downlevelIteration": true, // 支持迭代器
    "strictFunctionTypes": true, // 开启后 函数参数就是双向协变
    // "esModuleInterop": true, // 转化es6 模块  import * as jQuery from 'jquery'; =》 import jQuery from 'jquery';
    "baseUrl": "./",
    "paths": {
      "*":["typings/*"]
    }
  },
  "include": [
    "src/**/*",
    "typings/**/*"
  ]
}
```
### 扩展局部变量的类型
```ts
declare var String:StringConstructor;
interface StringConstructor{
    // String 类 class
    new(any?:any): String;
    // string 类
    (value?:any): string;
    readonly prototype: String;
}
interface String{
    toString(): string;
}
// 相同名称的interface 会进行合并
interface String{
    double(): string;
}
String.prototype.double = function() {
    return this + this;
}
let rs = 'ss'.double();
```
### 局部作用域下 申请全局变量
```ts
export {}
declare global {
    interface String{
        toString(): string;
    }
    // 相同名称的interface 会进行合并
    interface String{
        double(): string;
    }
}
String.prototype.double = function() {
    return this + this;
}
let rs = 'ss'.double();
```
## 合并声明
- 同一名称的两个独立声明会被合并成一个单一声明
- 合并后的声明拥有原先两个声明的特性
```yaml
关键字	作为类型使用	作为值使用
class	yes	yes
enum	yes	yes
interface	yes	no
type	yes	no
function	no	yes
var,let,const	no	yes
```
- 合并全局的 module 类型
```ts
declare var module:NodeModule & {
    hot: {
        accept(arg0: string[], arg1: ()=>void) : void;
    }
};
```
- 类既可以作为类型使用，也可以作为值使用，接口只能作为类型使用
```js
class Person{
    name:string=''
}
let p1:Person;//作为类型使用
let p2 = new Person();//作为值使用

interface Animal{
    name:string
}
let a1:Animal;
let a2 = Animal;//接口类型不能用作值
```
- 可以通过接口合并的特性给一个第三方为扩展类型声明
```js
// use.js
interface Animal{
    name:string
}
let a1:Animal={name:'zhufeng',age:10};
console.log(a1.name);
console.log(a1.age);
//注意不要加export {} ,这是全局的
```
- types\animal\index.d.ts
```js
interface Animal{
    age:number
}
```
### 使用命名空间扩展类
- 我们可以使用 namespace 来扩展类，用于表示内部类
```js
class Form {
  username: Form.Item='';
  password: Form.Item='';
}
//Item为Form的内部类
namespace Form {
  export class Item {}
}
let item:Form.Item = new Form.Item();
console.log(item);
```
### 扩展Store
```js
import { createStore, Store } from 'redux';
type StoreExt = Store & {
    ext: string
}
let store: StoreExt = createStore(state => state);
store.ext = 'hello';
```
## 生成声明文件
- 把TS编译成JS后丢失类型声明，我们可以在编译的时候自动生成一份JS文件
- 要执行 tsc 才有效果  单独执行一个 好像不行
```js
{
  "compilerOptions": {
     "declaration": true, /* Generates corresponding '.d.ts' file.*/
  }
}
```