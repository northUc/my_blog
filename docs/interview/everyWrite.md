# everyWrite
[[toc]]

## 冒泡
```js
function fn(arr) {
    let len = arr.length
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
            if (arr[i] < arr[j]) {
                [arr[i], arr[j]] = [arr[j], arr[i]]
            }
        }
    }
    return arr
}
console.log(fn([5, 2, 6, 3, 2, 6, 1]))
```

## 快速
```js
function fn(arr) {
    let len = arr.length
    if (len < 2) {
        return arr
    }
    let midindex = arr.splice(Math.floor(Math.random() * len), 1)
    let right = []
    let left = []
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < midindex) {
            left.push(arr[i])
        } else {
            right.push(arr[i])
        }
    }
    return fn(left).concat(midindex, fn(right))
}

console.log(fn([5, 2, 6, 3, 2, 6, 1]))
```

## 选择排序
```js
function fn(arr) {
    let len = arr.length
    let index = null
    for (let i = 0; i < len; i++) {
        index = i;
        for (let j = i + 1; j < len; j++) {
            if (arr[index] > arr[j]) {
                index = j
            }
        }
        [arr[index], arr[i]] = [arr[i], arr[index]]
    }
    return arr
}
console.log(fn([5, 2, 6, 3, 2, 6, 1]))
```
## 原型链 规则
- 1、所有引用对象都是可以拓展其属性
- 2、引用对象都有一个 __proto__ 属性 他是一个普通对象
- 3、函数都有一个 prototype 属性他是一个普通对象
- 4、引用对象的__proto__ 指向 构造函数的prototype
- 5、当试图得到对象的某一个属性,会先在自身查找,找不到在去构造函数的prototype找,直到找到Object
## new 原理
- 1、创建一个空对象,关联构造函数的原型
- 2、执行构造函数,this指向当前对象
- 3、判断执行的结果 若是对象即返回 否则返回新的对象
## class extends
```js
class Father{
  static staticFatherName = 'FatherName'
  static staticGetFatherName = function (){
    console.log(Father.staticFatherName)
  }
  constructor(public name){
    // 他是放在实例上的
    this.name = '1111111111'
  }
  getName(){
    // 他是放在原型上的
    console.log(this.name)
  }
}

class Child extends Father{
  static staticChildName = 'ChildName'
  static staticGetChildName = function (){
    console.log(Child.staticChildName)
  }
  constructor(public name,public age){
    super(name)
    this.age = age
    this.name = 'name111111111'
  }
  getAge(){
    console.log(this.age)
  }
}
let child = new Child('zhefeng',10)
child.getName()
child.getAge()
Child.staticGetChildName()
Child.staticGetFatherName()


// es5
function _extends(Child,Father){
  Child.__proto__ = Father;//继承静态属性的方法
  function Temp(){
    // constructor 指向子类的构造函数
    // this.constructor = Child
  }
  Temp.prototype = Father.prototype;
  Temp.prototype.constructor = Child;
  Child.prototype = new Temp()
}

var Father = (function(){
  function Father(name){
    this.name = name
  }
  Father.prototype.getName = function() {
    console.log(this.name)
  }
  Father.staticFatherName = 'FatherName'
  Father.staticGetFatherName = function() {
    console.log(Father.staticFatherName)
  }
  return Father
})()

var Child = (function (_super){
  _extends(Child,_super);
  function Child(name,age){
    _super.call(this,name)
  }
  Child.prototype.getName = function () {
    console.log(this.name)
  }
  Child.staticChildName = 'ChildName';
  Child.staticGetChildName = function (){
    console.log(Child.staticChildName)
  }
  return Child
})(Father)
let child = new Child('xxx',10)
child.getName();
// child.getAge();
Child.staticGetChildName();
Child.staticGetFatherName();

```
## 深拷贝 
```js
let obj1 = { 
  name:"xxx", 
  age: 10, 
  datas:{s:{age:1}},
  hobbies:['抽烟','喝酒'],
};
obj1.obj1 = obj1
// map key源对象的内存地址 值是克隆后的对象的内存地址
function clone(obj,map = new Map()) {
  if (typeof obj != 'object' && obj != null) return obj
  
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) return new RegExp(obj)
  let newObj = new obj.constructor
  // 递归 处理
  if(map.get(obj)){
    return map.get(obj)
  } 
  map.set(obj,newObj)  
  
  for (let i in obj) {

    newObj[i] = clone(obj[i],map)
  }
  return newObj
}
let rs = clone(obj1)
rs.datas.s.age = 11111111
rs.hobbies[0] = '11'
console.log(obj1)
```
## call
```js
Function.prototype.mycall = function(context, ...args) {
    context = Object(context) ? Object(context) : window
    context.fn = this

    let rs = eval('context.fn(' + args + ')')
    // let rs = eval(`context.fn(${args})`)
    delete context.fn
}

function fn(a, b, c, d) {
    console.log(a, b, c, d)
}
fn.mycall({}, 1, 2)
```

## apply
```js
Function.prototype.myapply = function(context, args) {
    context = Object(context) ? Object(context) : window
    context.fn = this

    let rs = eval('context.fn(' + args + ')')
    // let rs = eval(`context.fn(${args})`)
    delete context.fn
}

function fn(a, b, c, d) {
    console.log(a, b, c, d)
}
fn.myapply({}, [1, 2, 3])
```
## mybind
```js
Function.prototype.mybind = function(context, ...args) {
    context = Object(context) ? Object(context) : window
    let bindArgs = args
    let that = this

    function fn() {}
    fn.prototype = this.prototype

    function fBound() {
        let fArgs = Array.prototype.slice.call(arguments)
        return that.apply(this instanceof fBound ? this : context, bindArgs.concat(fArgs))
    }
    fBound.prototype = new fn()
    return fBound
}

function fn(a, b, c, d) {
    console.log(a, b, c, d)
}
let a = fn.mybind({}, 1, 2)
a(3, 4)
```

## 数组数据打乱
```js
function fn(arr) {
    let len = arr.length
    for (let i = 0; i < len; i++) {
        let midindex = i + Math.floor(Math.random() * (len - i));
        [arr[i], arr[midindex]] = [arr[midindex], arr[i]]
    }
    return arr
}
console.log(fn([1, 2, 3, 4, 5, 6]))
```
## promise  catch reject finally all race
```js
Promise.prototype.catch = function(data) {
    return this.then(null, data)
}

Promise.reject = function(data) {
    return new Promise((resolve, reject) => reject(data))
}

Promise.prototype.finally = function(cb) {
    return this.then(data => {
        return Promise.resolve(cb()).then(() => data)
    }, err => {
        return Promise.resolve(cb()).then(() => { throw err })
    })
}

let pro = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('seccuss')
    }, 1000)
})

pro.then(data => {
    console.log('data1', data)
    return '12312312'
}).finally((data) => {
    console.log('1231')
}).then(data => {
    console.log('data2', data)
})

Promise.prototype.all = function(promises) {
    return new Promise((resolve, reject) => {
        let rs = null;
        let index = 0;

        function fn(arr) {
            index++;
            rs.push(arr)
            if (index == promises.length) {
                resolve(rs)
            }
        }
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(data => {
                fn(data)
            }, reject)
        }
    })
}

Promise.prototype.race = function(promises) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(data => {
                resolve(data)
            })
        }
    })
}
```

## koa 中间件
```js
let app = {}
app.middlewares = []
app.use = function(arr) {
    app.middlewares.push(arr)
}
app.use((next) => {
    console.log('1')
    next()
    console.log('2')
})

app.use((next) => {
    console.log('3')
    next()
    console.log('4')
})

let dispatch = function(index) {
    if (index === app.middlewares.length) return () => {}
    let route = app.middlewares[index]
    route(() => dispatch(++index))
}
dispatch(0)
let rs = app.middlewares.reduce((a, b) => (...fn) => a(() => b(...fn)))
let rs = app.middlewares.reduceRight((a, b) => (...fn) => b(() => a(...fn)))
rs(() => {})
```

## map
```js
let rs = [1, 2, 3].map(item => item * 2)
console.log(rs)  
Array.prototype.mymap = function(fn) {
    return this.reduce((a, b) => {
        a.push(fn(b))
        return a
    }, [])
}
let rs = [1, 2, 3].mymap(item => item * 2)
console.log(rs)
```

## 函数柯里化
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
## 如何让 (a == 1 && a == 2 && a == 3) 的值为true
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
// 普通
function sleep(delay){
  for(var start = Date.now();Date.now()-start <= delay;){}
}
// 基于promise
function sleep_wait(ms){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      resolve();
    },ms)
  })
}
```
## 数组 交集 并集 差集
```js
let arr1 = [1, 2, 3, 1, 4]
let arr2 = [3, 4, 5, 6]

并集
let set1 = new Set([...arr1, ...arr2])
console.log(set1)

差集
arr1 = new Set(arr1)
arr2 = new Set(arr2)
let rs = [...arr1].filter(item => !arr2.has(item))
console.log(rs)

交集
arr1 = new Set(arr1)
arr2 = new Set(arr2)
let rs = [...arr1].filter(item => arr2.has(item))
console.log(rs)
```
## 节流
- 一段时间内会触发一次
```html
<body>
  <div id='btn'>点击</div>
  <script>
      function fn(){
        console.log('fn')
      }
      // 节流 一段时间内只会触发一次
      function throttle(fn,await){
        let pre = null
        return function(){
          let now = Date.now()  
          if(now-pre>await){
            fn()
            pre = now
          }
        }        
      }
      let dom = document.getElementById('btn')
      dom.addEventListener('click',throttle(fn,1000))
  </script>
```
## 防抖
- 一直按只会触发一次
```html
<div id='btn'>点击</div>
<script>
    function fn(){
      console.log('fn')
    }
    function throttle(fn,await,immediate){
      let timeout;
      return function(){
        if(immediate){
          if(!timeout){
            fn.apply(this,arguments)
          }
        }
        clearInterval(timeout)
        timeout = setTimeout(()=>{
          fn()
        },await)
      }
    }

    let dom = document.getElementById('btn')
    dom.addEventListener('click',throttle(fn,1000,true))
</script>
```

## 路由 路径参数解析
- 请求的路径 url=`/url1/123/sg`
- 自定义的路由 reg = `url1/:id/:name`
- 得到 => {id:123,name:sg}
- exec 匹配的结果 和 分组 都放到数组内 长度就是数组长度,此外数组内还有文本下标 不记在length内
  - 所以在数组内只有 结果和 分组
```js
let url = `/url1/123/sg/12312`
let reg = `/url1/:id/:name/:l`
let data = {}
// 获取id name 放到keys中
let keys = []

function pathToRegexp(path, keys) {
  let rs = path.replace(/\:([^\/]+)/g, function() {
    keys.push(arguments[1])
    return `([^\/]+)`
  })
  return new RegExp(rs)
}
let regexp = pathToRegexp(reg, keys)
let matchRs = regexp.exec(url)
for (let i = 1; i < matchRs.length; i++) {
  let key = keys[i - 1]
  data[key] = matchRs[i]
}
console.log(data, keys)
```

## 模板字符串
- Function && with
- new Function('参数',script), 参数可以写多个，script 是一个字符串,参数对应script里面的 参数
```js
  let obj = { s: 1 }
  let script = `
  console.log(obj,a)
  `
  let fn = new Function('obj', 'a', script)

  fn(obj, 'a1' )
  // 打印 {s:1} 'a1'
```
- with
```js
let obj = { a: 1 }
with(obj) {
  console.log(a) // 1
}
```
- ejs
- 单个渲染原理
```js
let str = `hello <%=name%> world <%=age%>`;
let options = { name: 'zdpx', age: 9 }

function render(str, options) {
  return str.replace(/<%=(\w+)%>?/g, ($0, $1, $2, $3) => {
    return options[$1]
  })
}

let rs = render(str, options)
console.log(rs)
```
- ejs if/for渲染原理
- 主要用到2个语法 
  - Function构造函数可以执行字符串脚本
  - with(obj)语法 具有独立的作用域 里面的数据都可以从obj里面获取
- render函数处理，
  - head 主要是申明变量和创建with 语法
  - str 是处理的模板,将<%xxx%> 和<%=xxx%>这两种替换出来,注意顺序,先处理<%=xxx%>类型的,他主要是处理 具体值 ,<%xxx%>是将if或者for语法进行转换
  - tpl变量要将 除if 和 for以外的所有数据里连接起来,所以会有`"`;\n" + arguments[1] + "\n;tpl+=`"`,tpl是我们最终要获取的值
  - html 获取的是str用正则替换和 with语法包装后的结果
  - 最后通过Function函数将对象和html传进去 执行脚本

```js
let options = { user: { name: 'zdpx', age: 9 }, total: 5 }
let str = `
<%if(user){%>
  hello '<%=user.name%>'
<%}else{%>
  hi guest
<%}%>
<ul>
<%for(let i=0;i<total;i++){%>
  <li><%=i%></li>
<%}%>
</ul>
`

function render(str, options) {
  let head = "let tpl = ``;\n with(obj){ \n tpl+=` "
  str = str.replace(/<%=([\s\S]+?)%>/g, function() {
    return "${" + arguments[1] + "}"
  })
  str = str.replace(/<%([\s\S]+?)%>/g, function() {
    return "`;\n" + arguments[1] + "\n;tpl+=`";
  })
  let tail = "`} \n return tpl;" 
  let html = head + str + tail;
  let fn = new Function('obj', html)
  return fn(options)
}


let rs = render(str, options)
console.log(rs)

```

## 观察者模式
- 被观察者(一个)  观察者(多个) 
```js
1、被观察者提供维护观察者一系列方法 (注入观察者 提供更新数据 获取数据方法)
2、观察者提供更新接口
3、观察者把调用被观察者的注入方法自己注入到被观察者中
4、当被观察者中的数据变化 调用观察者中的更新方法

class Fan {
    constructor(name, star) {
        this.name = name;
        this.star = star
        this.star.attach(this)
    }
    update() {
        console.log(this.name + '-----------' + this.star.getState())
    }
}

class Star {
    constructor(name) {
        this.name = name
        this.state = null
        this.obervers = []
    }
    getState() {
        return this.state
    }
    setState(val) {
        this.state = val
        this.notifyAllObervers()
    }
    attach(oberver) {
        this.obervers.push(oberver)
    }
    notifyAllObervers() {
        this.obervers.forEach(oberver => {
            oberver.update()
        })
    }
}

let star = new Star('李明', 'blank')
let fan1 = new Fan('fan1', star)
let fan2 = new Fan('fan2', star)
star.setState('black')
```

## 发布订阅
```js
订阅者 发布者 调度中心
订阅者把自己想订阅的事注册到调度中

class Agent{
  constructor(){
    this._event = {}
  }
  publish(item){
    let listeners = this._event[item]
    let arg = Array.prototype.slice.call(arguments)

    listeners.forEach(item=>item(...arg))
  }
  subsribe(type,listener){
    let listeners = this._event[type]
    if(listeners){
      listeners.push(listener)
    } else{
      this._event[type] = [listener]
    }
  }
}
class Tenant{
  constructor(name){
    this.name = name
  }
  rent(agent){
    agent.subsribe('house',(area,monry)=>{
      console.log(this.name,area,monry)
    })
  }
}
class LandLord{
  constructor(name){
    this.name= name
  }
  lend(agent,area,monry){
    agent.publish('house',area,monry)
  }
}

let agent = new Agent()
let landLord = new LandLord('房东')
let tenant1 = new Tenant('张三')
let tenant2 = new Tenant('李四')
tenant1.rent(agent)
tenant2.rent(agent)

landLord.lend(agent,40,600)
```
##  webpack 执行过程 
```js
// 配置 2、插件 3、run 4、make 5、seal 6、emitAssets
// 1、执行npx webpack 他会找node_modules .bin/webpack.cmd => webpack/bin/webpack.js => webpack-cli/bin/cli 入口文件就这 获取webpack配置 webpack(options) 得到compiler实例 通过compiler.run 开始编译

// 2、解析配置 解析shell 和webpack 配置选项 

// 3、初始化 注册nodeEnvironmentPlugin插件，执行所有webpack 配置插件, 使用webpackOptionApply初始化基础插件

// 4、run `compiler.run` 会执行内部的`this.compile`他是真正开始编译  他内部会初始化`Compilation`,`Compilation`负责了整个编译过程,内部的`this.compiler`执行conpiler对象，创建entries入口、chunks代码块、modules所有模型、assets所有的资源、模板(mainTemplate,chunkTemplate,hotUpdateChunkTempalte,moduelTemplate,runtimeTemplate)

// 5、make 事件触发 singleEntryPlugin 插件 执行compilation.addEntry,根据入口文件通过工厂方式创建代码块模块保存到`entries`内,触发module.build方法对源码进行loader处理 在进行ast语法解析，会将`require`替换成`__webpack_require__`,同时遇到`require`会创建 dependency 添加到依赖数组。module处理完成后 处理依赖模块

// 6、seal 对每个每个chunk 和 module进行处理,创建代码块资源，通过模板把chunk生成__webpack_require__()的格式  mainTemplate处理入口的module chunkTemplate处理异步加载 生成资源放在compilation.assets中

// 7、emitAssets 把assets输出到output的path中
```

## 主要的生命周期 插件
```js
// 入口 webpackOptionApply entryOption
// run beforeRun beforeCompile compile thisCompilation compilation
// make buildModule successModule finishModules
// seal seal optimize reviveModule reviveChunk beforeChunk beforeHash afterHash afterChunk beforeModuleAssets chunkAssets
// emit emit afterEmit done afterSeal 
```

## jsonp
```js
// function jsonp({url,params,cb}){
//     return new Promise((resolve,reject)=>{
//         window[cb] = function(data){
//             resolve(data)
//         }
//         params = {...params,cb}
//         let arr = []
//         for(let i in params){
//             arr.push(`${i}=${params[i]}`)
//         }
//         params = arr.join('&')
//         let dom = document.createElement('script')
//         dom.src = `${url}?${params}`
//         document.body.appendChild(dom)
//     })
// }
// jsonp({
//     url:'http://localhost:4000/123',
//     params:{age:1},
//     cb:'cb'
// }).then(data=>{
//     console.log(data)
// })

// let express = require('express')
// let app= express()
// app.get('/123',(req,res)=>{
//     let {cb} = req.query
//     console.log(cb)
//     res.end(`(${cb})('123')`)
// })
// app.listen('4000',function(){
//     console.log('start')
// })
```

## ajax
```js
// let xhr = new XMLHttpRequest()
// xhr.open('get','http://localhost:4000/123',true)
// xhr.onreadystatechange = function(){
//     if(xhr.readyState == 4&&xhr.status==200){
//         console.log(xhr.responseText)
//     }
// }
// xhr.send()
```

## 懒加载
```js
// 分2步骤 分割代码,jsonp加载数据
// 分割代码，在ast解析的时候  遇到Import('xx')语法 会把他解析成__webpack_require__.e('chunkId').then(__webpack_require__.t.bind(module,dependencyChunkId,7)).then(data=>data.default)
// 其中 dependencyChunkId 对应分隔文件的 对象的key值
// jsonp 加载数据 
// __webpack_require__.e 方法就是实现了jsonp加载数据,创建script标签 加载数据分隔数据的js文件 获取数据,他对象数据添加到modules对象上,通过__webpack_require__.t 去解析数据到页面中
```

## hot 更新
```js
// server 端
// 创建一个sever&&io,io用来监控客户端连接,将连接的所有client存放起来,同时监控hooks.done钩子,每次编译完成的时候,循环所有的client 并且告诉他们 当前的编译的hash值和一个ok,内部要修改把compiler的输出文件系统改成了 MemoryFileSystem(内存)
// client 端
// module.hot.accept('moduleId',fn) 缓存数据
// 创建一个发布订阅 client 监控到 server发送过来的hash保存,当socket接收到ok事件事件,会发送`webpackHotUpdate`事件,第一次的时候 会保存当前的hash值,第二次的时候才会走hot的逻辑 
//  1、更新的时候 会用 hash(上一次保存的hash)+'.hot-update.json'发送get请求,询问服务器到底这一次编译相对上一次编译改变了哪些chunk,哪些模块,返回的 h是当前的hot hash值 c是当前变化的chunkId(c是一个对象,key是 chunkId,value是true)
//  2、遍历c对象,jsonp请求变化的数据,url是 chunkId+用更新前的上一次hash(hotCurrentHash)+'.hot.update.js',返回的是 webpackHotUpdate('chunkId',{moduleId:value})
//  3、webpackHotUpdate 作用 遍历jsonp过来的的数据 1、通过__webpack_require__ 加载有变化的module 2、通过moduleId 获取到parentModule 在里面取到hot里之前缓存的函数执行，加载最新的数据 
```

## loader
```js
// 1、给 loaderContext 上下文定义4个变量,request当前所有的loader,remindingRequest剩下的loader,previousRequest之前的loader,data用来共享数据
// 2、异步处理 isSync 默认是true 当执行async 的时候 会改变 isSync会变成false, 异步执行返回函数的时候 会将isSync变成true
// 3、先处理 iteratePitchingLoaders 当其中一个pitch函数没有返回值的时候 直接执行下一个 若有返回值的时候 执行他并且传入 remindingRequest,previousRequest,data 为参数
// 4、pitch执行完成后处理 normal.raw 当为true的时候 就变成二进制,否则不处理
// 5、处理 iterateNormalLoaders 一次执行 当执行完最后一个就 退出去 执行回调函数
```

## express
```js
// 基本流程 get等 use listen  
// 1、首先是路由 每一层router 都用Layer创建，第一个参数是路径,第二个参数是处理函数 router.dispatch(每个router 存放着当前路由的所有处理) 将他们存放起来
// 2、每一层的router 每一次实例的router(layer.router)存放自己  用来去获取当前一层的处理函数和是否是use(use 这一层的router是undefined) 遍历所有的请求methods 只要是某一个请求方式 第一个是路径参数  后面的都是处理函数   获取他所有的处理函数 遍历每一个  都创建一个layer实例 第一个参数是 路径  第二个参数是遍历的单个函数 然后push到当前的stack中。当前类有一个dispatch方法 就是遍历执行所有的 stack 保存的函数
// 3、listen 在执行  创建 Http.createServer的时候  开始遍历(handle) 执行第一个router 里的所有stack存储的函数,执行完成后 调用next 在取第二个router 就这样依次执行
// 4、use 和 路由 其实差不多 区别就是 每一层实例的router保存的值不一样 做区别,use是undefined 路由则是每一层的处理函数 use和路由一样 同样是用 Layer创建的 当没有二级中间件的时候 path(路径)就是/,有二级中间件的时候 path就是第一个参数,创建好之后 同样放入到当前实例的stack中,在遍历的时候 就通过layer.router下面是否有值判断是中间件还是路由
```

### 子路由系統
```js
// express.Router() 内部会返回一个router实例 他和express()返回的是一样的 前者是通过函数返回  后者是通过 原型链 构造，Object.setPrototypeOf(fn,{})主要是通过这个api,将对象挂载到函数的原型链上
// 返回的实例 同时具备use get等方法 二级路由 就是通过app.use('/xxx',子路由实例)
/**
 * A 函数new 和 直接执行 原型链都一样
 * function A(){
 *  function b(){
 *  }
 *  Object.setPrototypeOf(b,proto)
 *  return b 
 * }
 * let proto = Object.create(null)
 * proto.a= ()=>{}
*/
``` 

### 路径参数处理
```js
// 1、他会通过下面的库 在匹配路径的时候 他会提取:后面的key值 在匹配传递过来的路径 进行一一对应 挂载到params对象上
// 2、匹配到路径 处理函数的时候  会拦截处理 遍历是否有 路径参数 对应的函数 会一个一个的遍历执行 同时他也是通过 中间件的形式一个个执行 这个时候 我们可以在req对象上挂载东西
```

### path-to-RegExp
```js
/*
  path-to-regexp 这个库是通过路径 来提取正则
  let pathToRegexp = require('path-to-regexp')
  let path = '/user/:uid/:name';
  let keys = []

  function pathToRegexp(path, keys) {
    return path.replace(/\:([^\/]+)/g, ($1, $2, $3) => {
      console.log('===>',$1,$2,$3)
      keys.push({
        name: $2,
        optional:$3,// 偏移量
        replace: false
      })
      return '([^\/]+)'
    })
  }

  let rs = pathToRegexp(path, keys)
  let str = '/user/123/wew'
  let a = rs.exec(str)
  console.log(keys,a)
*/
```
### 模板引擎
```js
// app.set('view engine',path.resolve(__dirname, 'views')) 用来设置 模板文件的位子
// app.set('view engine', 'html') 这个是用来设置模板文件的后缀格式
// app.engine('html', ejs) 这个 设置html 结尾的 就用ejs 模板进行渲染 ejs是一个函数
```

### 中间件
```js
// 中间件 格式 use 传入一个函数 参数分别是req,res,next
/*
  app.use(function(req, res, next) {
    let { pathname } = url.parse(req.url)
    req.path = pathname
    next()
  })
*/
// static中间件 静态目录
/*
function static(){
  function(req, res, next) {
    let staticPath = path.join(p, req.url)
    let exists = fs.existsSync(staticPath)
    if (exists) {
      let html = fs.readFile(staticPath, (err, item) => {
        res.setHeader('Content-Type', 'text/html')
        // res.setHeader('Content-type', 'image/gif')
        res.end(item)
      })
    } else {
      next()
    }
  }
}
*/

// bodyParser 请求的参数解析
/*
function bodyParser() {
  return function(req, res, next) {
    let rs = []
    req.on('data', function(data) {
      rs += data
    })
    req.on('end', function(data) {
      try {
        req.body = JSON.parse(rs)
      } catch (e) {
        req.body = require('querystring').parse(rs)
      }
      next()
    })
  }
};
*/
```

### ejs
```js
// ejs 单个渲染原理
// let str = `hello <%=name%> world <%=age%>`;
// let options = { name: 'zdpx', age: 9 }

// function render(str, options) {
//   return str.replace(/<%=(\w+)%>?/g, ($0, $1, $2, $3) => {
//     return options[$1]
//   })
// }

// let rs = render(str, options)
// console.log(rs)

// ejs if渲染原理
// let options = { user: { name: 'zdpx', age: 9 }, total: 5 }
// let str = `
// <%if(user){%>
//   hello '<%=user.name%>'
// <%}else{%>
//   hi guest
// <%}%>
// <ul>
// <%for(let i=0;i<total;i++){%>
//   <li><%=i%></li>
// <%}%>
// </ul>
// `

// function render(str, options) {
//   let head = "let tpl = ``;\n with(obj){ \n tpl+=` "
//   str = str.replace(/<%=([\s\S]+?)%>/g, function() {
//     return "${" + arguments[1] + "}"
//   })
//   str = str.replace(/<%([\s\S]+?)%>/g, function() {
//     return "`;\n" + arguments[1] + "\n;tpl+=`";
//   })
//   let tail = "`} \n return tpl;"
//   let html = head + str + tail;
//   console.log('html=>', html)
//   let fn = new Function('obj', html)
//   return fn(options)
// }

// let rs = render(str, options)
// console.log(rs)
```

## React(0.3版本的)
### React 渲染流程
- 1、jsx语法会通过babel转成虚拟DOM
- 2、虚拟DOM在创建元素的时候,会分成原生DOM,文本节点,函数组件3类,在分别创建对应的节点，文本标签会用span标签包裹返回。原生dom,他会解析里面的属性,通过事件委托的方式绑定dom事件,赋值标签属性,递归渲染儿子节点。函数组件,类组件会转成函数组件,类组件的生命期在这处理,return或者render 返回的内容，通过递归创建dom
- 3、 setState 方法是 React.Component 类提供的方法,他内部会去调用 当前组件的.update方法将新状态传递进去,然后进行状态合并。比较元素的谭类型是否相同,不相同就直接砍掉重新创建元素,相同先比较属性,在比较children(diff)
### diff 比较
- 1、如果说新老一致的话 说明复用了老节点,如果老元素的位子小于(已遍历老元素的位子)就要往后移动(添加补丁包)
- 2、当标签不一样的时候 key 相同,老节点没有复用的 要删除原有的 (添加补丁包)
- 3、新的节点 就去创建(添加补丁包)
- 4、新节点里面没有老节点的 要删除掉(添加补丁包)
- 5、等待所有元素比较完成,开始打补丁包,补丁包先做删除dom操作,在做移动和添加操作
### redux


## vue 
### DOMDiff
- 核心的patch方法,接收(新节点,老节点)
- 1、比较标签,当标签不一样,直接替换
- 2、标签一样,比较文本,如果内容不一样,用新的替换老的文本节点
- 3、标签一样,比较属性,遍历新老属性,进行修改
- 4、比较儿子节点,a、当老的有孩子,新的没有孩子,直接删除老的child。b、当老的没有孩子,新的有孩子,递归遍历新的孩子往老节点添加。c、当都有孩子的时候是最烦,分5中策略
  - 开头插入,从头开始比较(新 a b c d,老 a b c d e的情况下) 先比较新老的第一个始比较,下次比较第二个 
  - 结尾插入,从尾巴开始比较(新 a b c d,老 e a b c d的情况下) 先比较新老的最后一个,下次在比较倒数第二个
  - 正序,用新的头和老的尾巴开始比较,(新的 a b c d,老的 d c b a)
  - 倒序,用新的尾巴和老的头开始比较,(新的 a b c d,老的 d a b c )
  - 乱序,顺序不确定的情况,遍历新节点,用新的第一个DOM去老的里面匹配,如不匹配则直接插入到老节点的前面,如匹配则直接一定老节点。新节点遍历完成,在看老节点中还有剩余的(新节点中没有的)直接删除
  - 最后比较完,判断新节点中还有剩余的元素则需要将剩余的插入，如果老节点中还有剩余则需要全部删除
- 注意 循环的是 尽量不要使用索引作为key 可能会导致重新创建当前元素的所有子元素
### 完整的导航解析流程
```js
/*
  导航被触发。
  在失活的组件里调用离开守卫。(组件内 beforeRouteLeave)
  调用全局的 beforeEach 守卫。(全局前置守卫 beforeEach )
  在重用的组件里调用 beforeRouteUpdate 守卫 (组件内的 beforeRouteUpdate, /foo/1 和 /foo/2 之间跳转的时候用到)
  在路由配置里调用 beforeEnter。(组件内 beforeEnter)
  解析异步路由组件。(全局router.beforeResolve  在导航被确认之前,所有组件内守卫和异步路由组件被解析之后)
  在被激活的组件里调用 beforeRouteEnter(在组件渲染前 不能获取this)
  调用全局的 beforeResolve 守卫 
  导航被确认。
  调用全局的 afterEach 钩子。
  触发 DOM 更新。
  用创建好的实例调用 beforeRouteEnter 守卫中传给 next 的回调函数。


  路由配置守卫即配置在路由对象中

    组件实力的导航守卫： beforeRouteLeave beforeRouteEnter beforeRouteUpdate

    全局守卫： beforeEach beforeResolve afterEach

    路由配置守卫： beforeEnter

*/
```
### vuex
- vue是单向数据流，组件变动不能驱动数据，而是数据变动驱动组件
- 同步情况 调用mutation改数据
- 异步情况，派发action，调用api，再在action里调用mutation改数据
- vuex 数据持久化vuex-persits
### vuex原理
- 每个vue插件 内部都提供install方法,他接收Vue
- install 方法内部通过 vue.mixin 把store属性传递给每个组件
## vue-router
- hash 通过hashchange监控hash变化
- history api 通过pushState

## fiber

## 微前端
- 名词解析:微前端就是后端微服务在前段的映射
- 如何在浏览器落地
  - 1、iframe
  - 2、single-spa
- 场景
  - 1、将大的复杂的应用 拆分成多个小的app进行加载
  - 2、将不同的app 组合到一起 进行加载(vue，react项目)
- 每个app 向外export4个生命周期()
  - 1、bootstrap(启动,每个app只会启动一次)
  - 2、mount(挂载)
  - 3、ummount(卸载)
  - 4、update(更新)
- 卸载
  - vue vueInstance.$destory()
  - react 
    - ReactDOM.ummountComponentAtNode(element)
    - ReactDOM.findNode(reactInstance)
### 执行流程(核心) 
- 触发的时机
  - 1、浏览器触发,拦截onhashchange和onpopstate事件
  - 2、手动触发,注册app和start启动这两个方法
- 修改队列(changesQueue)
  - 每次触发时机进行一次触发操作,都会被存放到changesQueue队列中,类似事件队列一样,等待被处理,不过changesQueue是成批执行。而js事件循环是一个个执行
- 事件循环
  -  每一次事件开始循环,会判断为前端框架是否已经启动
  - 1、如果没有,则loadApps,加载完成后调用内部的finish
  - 2、若启动了,则执行完成的app的生命周期,unMount App load App Mount App,
  - 不管是否启动,都会执行finish,finish就是判断当前队列是否为空,如果不为空就重新循环一次,为空的话中止循环退出流程
- location事件
  - 每次循环中止都会将已拦截的location事件进行触发,这样保证为前端的location触发事件总是最先的,vue和React总是在后面
## 性能监控
- 监控全局捕获错误,普通的监听`error`,异步的监听`unhandledrejection`
- ajax 进行接口监控,在请求成功或失败的时候进行日志上报
- 监控白屏,白屏原理:在onload时 在页面中通过`document.elementsFromPoint(x,y)`进行取点和已有的包裹元素进行 
  - `elementsFromPoint`方法可以获取到当前视口内指定坐标处，由里到外排列的所有元素
- 性能指标,通过`performance Timing`对页面每个时间段进行分析