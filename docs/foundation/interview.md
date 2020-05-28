# js base  question
[[toc]]
## call 和 apply 的区别是什么，哪个性能更好一些
- call 参数是一个个传递
- apply 是以数组的形式传递
- call的性能更好(apply 内部也是调用的call)
## 数组里面有10万个数据，取第一个元素和第10万个元素的时间相差多少 
- 一样的(取数据都一样O(1),但是存数数据是O(n))
## XHR具体底层原理和API
- [XMLHttpRequest](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest)
- axios 基于他实现的
## prototype根本上解决的是什么问题
- 主要是方法的复用问题
## 编写parse函数，实现访问对象里属性的值 
```js
let obj = { 
  a: 1, 
  b: { c: 2 }, 
  d: [1, 2, 3], 
  e: [{ f: [4, 5, 6] }] 
};
let r1 = parse(obj, 'a');// = 1;
let r2 = parse(obj, 'b.c');// = 2;
let r3 = parse(obj, 'd[2]');// = 3;
let r4 = parse(obj, 'e[0].f[0]');// = 4;
// function parse(obj,str){
//   let rs = new Function('obj','return obj.'+str)
//   return rs(obj)
// }
function parse(obj,str){
  // 正则将 e[0] => e.0 
  str = str.replace(/\[(\d+)\]/g,`.$1`)
  // str = str.replace(/\[(\d+)\]/g,($0,$1)=>`.${$1}`)
  let arr = str.split('.')
  arr.forEach(item=>{
    obj = obj[item]
  })
  return obj
}
console.log(r1,r2,r3,r4)
```
## sleep方法封装
```js
// 1
function sleep(delay){
  for(var start = Date.now();Date.now()-start <= delay;){}
}
  console.log('1')
  sleep(5000)
  console.log('2')
// 2
function sleep_wait(ms){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      resolve();
    },ms)
  })
}
//用法 1
let fn =async ()=>{
  console.log('1')
  await sleep_wait(5000)
  console.log('2')
}
fn()
//用法 2
let is_loaded = true
let fn =async ()=>{
  console.log('---------')
  while(is_loaded){
    await sleep_wait(1000)
    console.log('一直走')
  }
}
fn()
let a = setInterval(()=>{
  is_loaded = !is_loaded
  clearInterval(a)
},5000)
```
## 数组扁平化flat方法的多种实现
```js
let arr = [
    [1],
    [2, 3],
    [4, 5, 6, [7, 8, [9, 10, [11]]]],
    12
];
// 1、
console.log(arr.flat(Infinity))
// 2、toString() 能将多层数组扁平化 
console.log(arr.toString().split(',').map(item=>Number(item)))
// 3、JSON.stringify 和 toString类似
console.log(JSON.stringify(arr).replace(/\[|\]/g,'')..split(',').map(item=>Number(item)))
// 4、concat可以展开一层
while(arr.some(item=>Array.isArray(item))){
  arr = [].concat(...arr)
}
console.log(arr)
// 5、flat 里面递归处理
Array.prototype.myFlat = function(){
  let rs = []
  let _this = this;
  function _flat(arr){
    for(let i=0;i<arr.length;i++){
      let item = arr[i]
      if(Array.isArray(item)){
        _flat(item)
      }else{
        rs.push(item)
      }
    }
  } 
  _flat(_this)
  return rs
}
let rs = arr.myFlat()
console.log(rs)
```
## 实现一个不可变对象
- 下面3中方法都是浅控制
### 不可扩展 preventExtensions
- Object.preventExtensions()可以使一个对象不可再添加新的属性，参数为目标对象，返回修改后的对象
- 可删 可修
```js
let obj = {name:'xxx'}
console.log(Object.isExtensible(obj))// 可扩展
Object.preventExtensions(obj)
console.log(Object.isExtensible(obj))// 不可扩展
obj.age = 10
console.log(obj.age)//undefined
```
### 密封 seal
- Object.seal() 可以使一个对象无法添加新属性的同时，也无法删除旧属性。参数是目标对象，返回修改后的对象
- Object.getOwnPropertyDescriptor 查看对象的属性
- 可修
```js
let obj = {name:'xxx'}
console.log(Object.isExtensible(obj))// 可扩展
console.log(Object.isSealed(obj))// 没有密封 false
Object.seal(obj)
console.log(Object.isExtensible(obj))// 不可扩展
console.log(Object.isSealed(obj))// 不可扩展 true
console.log(Object.getOwnPropertyDescriptor(obj, 'name'));
```
### 冻结 freeze
- Object.freeze() 可以使对象一个对象不能再添加新属性，也不可以删除旧属性，且不能修改属性的值。参数是目标对象，返回修改后的对象。
- Object.isFrozen() 可以检测一个对象是否冻结，即是否可以增删改。参数是目标对象，返回布尔值，true 表示已经冻结不可再增删改，false 反之
```js
let obj = {name:'xxx',arr:[1,2]}
Object.freeze(obj)
obj.name = 'xxx1'
obj.arr.push(3)
console.log(obj)// { name: 'xxx', arr: [ 1, 2, 3 ] }
```
```js
// 深冻结 后期在补
let obj = {names:{name:'sg'},arr:[1,2]};
function deepFreenze(){
  let newObj = {};
  for(let key in obj){
    let value = obj[key]
    newObj[key] = Object.freeze(value)
  }
}
deepFreenze(obj)
obj.names.age = 20
console.log(obj)
```
## +号
- 两个操作数如果是number则直接相加出结果
- 如果其中有一个操作数为string，则将另一个操作数隐式的转换为string，然后进行字符串拼接得出结果
- 如果操作数为对象或者是数组这种复杂的数据类型，那么就将两个操作数都转换为字符串，进行拼接
- 如果操作数是像boolean这种的简单数据类型，那么就将操作数转换为number相加得出结果
- [ ] + { } 因为[]会被强制转换为"", 然后+运算符 链接一个{ }, { }强制转换为字符串就是"[object Object]"
- { } 当作一个空代码块,+[]是强制将[]转换为number,转换的过程是 +[] => +"" =>0 最终的结果就是0
```js
[]+{}  //"[object Object]"
{}+[]  //0
{}+0   //0
[]+0   //"0"
```
## 给定一组url，利用js的异步实现并发请求，并按顺序输出结果
```js
function printOrder(urlArr) {
    Promise.all(urlArr.map(url => new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest;
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                resolve(xhr.response);
            }
        }
        xhr.send();
    }))).then(result => {
        console.log(result);
    });
}
printOrder(['/1.json?ts=' + Date.now(), '/2.json?ts=' + Date.now()]);
```
## 说下 Reflect Proxy
- Proxy 就是拦截 第一个参数是值(对象和基本数据类型都可以) 第二参数是函数 有get/set
- Reflect 将Object对象的一些明显属于语言内部的方法（比如Object.defineProperty），放到Reflect对象上
```js
// 代理基本类型
let a =new Proxy({},{
  i:1,
  get(obj,key){
    return ()=>this.i++
  }
})
console.log(a)

// 代理对象
let target = {
    name: 'sg',
    age: 10
}
let handler = {
    get: function (target, key) {
        return target[key];
    },
    set: function (target, key, value) {
        target[key] = value;
    }
}
let proxy = new Proxy(target, handler)
console.log(proxy.name);
proxy.age = 25;
console.log(proxy.age);
```
```js
let target = {
    name: 'sg',
    age: 10
}
//Object.defineProperty();
Reflect.defineProperty(target, 'home', {
    value: '北京'
})
console.log(target.home);
// 'home' in target
console.log(Reflect.has(target, 'home'));
```
## 写一个函数，可以控制最大并发数
```js
  // 信号
  class Semaphore {
    constructor(available) {
      // 有空的
      this.available = available;
      // 等待
      this.waiters = [];
      // 继续执行者
      this._continue = this._continue.bind(this);
    }

    take(callback) {
      if (this.available > 0) {
          this.available--;
          callback();
      } else {
          this.waiters.push(callback);
      }
    }

    leave() {
      this.available++;
      if (this.waiters.length > 0) {
          process.nextTick(this._continue);
      }
    }

    _continue() {
      if (this.available > 0) {
          if (this.waiters.length > 0) {
              this.available--;
              const callback = this.waiters.pop();
              callback();
          }
      }
    }
  }

  let semaphore = new Semaphore(2);
  console.time('cost');
  semaphore.take(function () {
      setTimeout(() => {
          console.log(1);
          semaphore.leave();
      }, 1000);
  });
  semaphore.take(function () {
      setTimeout(() => {
          console.log(2);
          semaphore.leave();
      }, 2000);
  });
  semaphore.take(function () {
      console.log(3);
      semaphore.leave();
      console.timeEnd('cost');
  });
```
## 如何让 (a == 1 && a == 2 && a == 3) 的值为true
### valueOf和toString
- ==的时候会涉及到类型转换，如果双等号两边数据类型不同会尝试将他们转化为同一类型
- valueOf和toString这两个方法是每个对象都自带的(继承自Object原型)
- toString返回一个字符串"[object Object]",valueOf则是直接返回对象本身
```js
  var obj = {a:1};
  //在隐式转换的过程中，调用了`toString`方法
  console.log(obj == "[object Object]");//true
```
### 类型转换
- 三个等号不转数据类型,二个等号不转数据类型,直接返回false 值一样,类型需要一样
- NaN和谁都不相等,包括NaN自己
- null==undefined null和undefined两个等号相等，三个等号不相等
- 对象 == 字符串 会把对象转成字符串再比较
- 剩余的都转换为数字进行比较
### 对象转原始类型步骤
- 如果部署了[Symbol.toPrimitive] 接口，那么调用此接口，若返回的不是基本数据类型，抛出错误
- 如果没有部署 [Symbol.toPrimitive] 接口，那么根据要转换的类型，先调用 valueOf / toString
- 如果hint是number,调用顺序为 valueOf=>toString
- 如果hint是string(针对Date),调用顺序为toString=>valueOf
- 如果hint是default,调用顺序为valueOf=>toString
- 执行a==1时,js引擎会尝试把对象类型a转化为数字类型，首先调用a的valueOf方法来判断，不行则继续调用toString方法
- 然后再把toString返回的字符串转化为数字类型再去和a作比较
- 重写valueOf方法也可以实现，而且转化时会优先调用valueOf方法

- 执行a==1时,js引擎会尝试把对象类型a转化为数字类型，首先调用a的valueOf方法来判断，不行则继续调用toString方法
- 然后再把toString返回的字符串转化为数字类型再去和a作比较
- 重写valueOf方法也可以实现，而且转化时会优先调用valueOf方法
```js
// 1、Symbol.toPrimitive
let a = {
  [Symbol.toPrimitive]:(function(){
    let i = 1;
    return ()=> i++;
  })()
}

// 2、Proxy
let a =new Proxy({},{
  i:1,
  get(obj,key){
    return ()=>this.i++
  }
})
// 3、valueOf
let a = {
  i:0,
  valueOf:function(){
    return ++this.i
  }
}
// 4、toString
let a = {
  i:0,
  toString:function(){
    return ++this.i
  }
}
// 5、 Object.defineProperty
let i=0
Object.defineProperty(window,'a',{
  get(){
    return ++i
  }
})
// 6、toString配合数组
var a = [1,2,3]
a.toString = a.shift

console.log(a + '')
console.log(a + '')
console.log(a + '')
```
## console.log([]==![])
- 比较的时候要转成数字进行比较
```js
console.log([]==![]);//true
console.log([] == false) //true
console.log(![] == false)  //true


console.log([]==[]);//false
console.log([]==!{});//true

[].toString() 得到空字符串=>Number('')=0
![] = false =>Number(false)=>0
```

## debounce(防抖)
- 一直按按钮 只触发一次,等待最后一次按钮触发,在开始计算倒计时,开始触发按钮函数
```js
  function fn(){
    console.log('logger')
  }
  function debounce(fn,wait,immediate){
    let timeout;
    return function(){
      if(immediate){
        if(!timeout){
          fn.apply(this,arguments)
        }
      }
      clearInterval(timeout)
      timeout = setTimeout(()=>{
        fn.apply(this.arguments)
      },wait)
    }
  }
  let btn = document.getElementById('btn')
  // 第三个参数 首次触发
  btn.addEventListener('click',debounce(fn,1000,true))
```
## throttle(节流)
- 节流就是保证一段时间内 核心代码只执行一次
```js
  // 节流 throttle
  function throttle(fn,wait){
    let pre = 0;//上一次的默认值
    return function(){
      let now = Date.now()
      if(now-pre>wait){
        fn.apply(this,arguments)
        pre = now
      }
    }
  }
  let btn = document.getElementById('btn')
  function logger(){
    console.log('11111')
  }
  btn.addEventListener('click',throttle(logger,1000))
```
## 柯里化
```js
// 1、收集数组
console.log(add(1, 2, 3, 4, 5));//15
console.log(add(1)(2, 3)(4, 5));//15
console.log(add(1)(2)(3)(4)(5));//15

const add = ((total)=>{
  let AllArgs = []
  function _add(){
    AllArgs = [...AllArgs,...arguments]
    if(AllArgs.length >= total){
      let rs = AllArgs.reduce((a,b)=>a+b)
      AllArgs.length = 0
      return rs
    }else{
      return _add
    }
  }
  return _add
})(5)


// 2、利用toString
alert(add(1, 2, 3, 4, 5));//15
alert(add(1)(2, 3)(4, 5));//15
alert(add(1)(2)(3)(4)(5));//15

function add(...args){
  let _add = add.bind(null,...args)
  _add.toString = function(){
    return  args.reduce((a,b)=>a+b)
  }
  return _add
}


// 3、利用 递归
console.log(add(1, 2, 3, 4, 5));//15
console.log(add(1)(2, 3)(4, 5));//15
console.log(add(1)(2)(3)(4)(5));//15

function curry(fn,...args){
  return args.length < fn.length ? (...innerArgs)=> curry(fn,...args,...innerArgs) : fn(...args)
}

function _add(a,b,c,d,e){
  return a+b+c+d+e
}

let add = curry(_add)
```
## 拷贝
### JSON.parse
- 无法支持所有类型,比如函数
```js
let obj = { name: 'sg', age: 10 };
console.log(JSON.parse(JSON.stringify(obj)));
```
### 浅拷贝
```js
function clone(data){
  let rs = {}
  for(let key in data){
    rs[key] = data[key]
  }
  return rs 
}
```
### 深拷贝
```js
// map key源对象的内存地址 值是克隆后的对象的内存地址
function clone(obj,map = new Map()) {
  if (typeof obj != 'object' && obj != null) return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) return new RegExp(obj)
  let newObj = new obj.constructor
  if(map.get(obj)){
    return map.get(obj)
  } 
  map.set(obj,newObj)  
  for (let i in obj) {

    newObj[i] = clone(obj[i],map)
  }
  return newObj
}
```
## js中判断类型 
- lodash常用的工具库
### typeof
- 返回都是字符串
- 字符串包括 number string boolean undefined symbol
- typeof null object
- typeof {} [] /^$/ Date => object
### instanceof 返回实例
### Object.prototype.toString.call
```js
function getType(source){
  return Object.prototype.toString.call(source)
}

```
### ['1','2','3'].map(parseInt)
- 结果 1 NaN NaN
- parseInt(string,radix) 如果radix在2-36之外会返回NaN
