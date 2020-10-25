# js
## 栈(stack)&&队列
- 栈 是存放数据的一种内存区域
  - 特点是先进后出 数组的push&pop方法
  - 2中内存空间 
    - stack(栈) 有数据结构
    - heap(堆) 没有数据结构 任意存放 
- 队列
  - 队列是一种操作受限制的线性表
  - 特点 在表的前端进行删除操作 后端进行插入操作 数组的push&&shift
## 作用域
- 每当函数执行的时候 会创建一个VO,然后根据VO创建一个执行上下文,上下文里面有VO和scopeChain(作用域链)
- 作用域：确定其访问权限,当前执行上下文中的VO上的属性
- 作用域链：自己关联父级 父级关联爷爷级 一层一层的往上找
  - 父作用域链在函数创建的时候就已经确定了,跟在哪儿执行没有关系
  - 函数执行的时候创建上下文,并且加入了自己的作用域链
```js
// two的作用域链 是在one创建two函数的时候 就定下来了
// one创建two函数的时候 内部实例是创建函数和two的作用域链:{twoFunction:`twoFunction`,scope=[oneExecutionContextVo,globalExecutionContextVo]}
// 函数执行的时候创建上下文,并且加入了自己的作用域链

function one(){
  var a = 1;
  function two(){
    console.log(a)
  }
  return two
}
var a = 2
var rs = one()
rs()
```
## 生命周期
- 一个新的执行上下文的生命周期有两个阶段
  - 创建阶段
    - 创建变量对象
    - 确定作用域链
    - 确定 this 指向
  - 执行阶段
    - 变量赋值
    - 函数赋值
    - 代码执行
```js
/*
  当执行one的时候  会创建一个执行上下文
  编译阶段
    创建VO
      1、处理参数,把参数放入VO
      2、扫描所有代码,找出function声明,从上下一次执行 在编译阶段 会处理所有的函数声明,如果有重复的声明,后面会覆盖前面的
      3、扫描var 关键字 var是不赋值的 只声明 值是undefined
      4、在编译阶段不会处理let 变量的,let的变量也不会放到VO里
  编译完成
    开始执行阶段,变量赋值,代码执行
*/ 
// one[[SCOPE]] = [globalEC.VO]
function one(m, n) {
  // let VO={m:1,n:2,fn:()=>2,a:undefined,b:undefined}
  // let oneEC = {VO,this:window,scopeChain:[oneVO,globalEC.VO]}
  console.log(m,n)//1,2
  var a = 1;
  function fn(){
    return 1;
  }
  function fn(){
    return 2;
  }
  var b = 2;
  var b = 3;
  let c = 4
  console.log(a,b,c,fn)
}
one(1,2)
```

- 例子
- 当var a =2 的时候 one执行结果是1
  - 全局 vo包含了 one,two,a  当one执行的时候  two找的是全局的a而不是oneVO的a,如果two在one函数内声明的话 结果就是2,编译阶段就确定了原型链的查找规则
- 当a = 2 的时候 one执行结果是2
  - a 会修改当前的a 所以 全局的a是2
```js
var a = 1;
function one (){
  var a = 2
  // a = 2
  two()
}

function two(){
  console.log(a)
}

one()// 1
```

## AO
- VO Local this
```js
function one(m){
  function two(){
    console.log('tow')
  }
  two()
}
one(1)
// 当one开始执行的时候,因为oneEC(one的执行上下文)处于执行栈的顶端,这个时候,oneVO 就会成为AO
// Activeation Object  AO 会多一个this  oneVO.this = window
```

## let 
- 函数本身的作用域在其所在的块级作用域之内
```js
'use strict'
function fn(){
  console.log('out')
}
(function(){
  // 这里写if(false) 和不写 一样都是{}作用域
  if(false){
    function fn(){
      console.log('in')
    }
  }
  fn()
})()
```
- 暂时性死区
```js
{
  let a = 10;
  {
    console.log(a)
    let b= 20;
  }
}
```
## this
- this 谁来调用,或者说当前执行这个逻辑的主体是谁
```js
// 如果是对象来调用,this就是调用的对象
let zhangsan = {
  name:'张三',
  getName(){console.log(this.name)}
}
zhangsan.getName();// 张三

// 如果没有人来调,直接执行
let getName = zhangsan.getName;
// 如果是非严格模式 主体window global 如果是严格模式就是 null && undefined
getName()
// 其实this的确定 只有一条规则 谁调就是谁
// 如果事件绑定的时候 this就是绑定的元素
```

### call 
```js
/*
  call 的原理 增加一个属性 在删除
  obj.getName = getName 
  obj.getName = getName
  delete obj.getName
*/
function getName() {
  console.log(this.name)
  if('number','string',)
}
let obj = {name:'xxx'}
!(function (prototype){
  function call2(context){
    context.getName = this
    context.getName();
    delete context.getName;
  }
  prototype.call2 = call2
})(Function.prototype)
getName.call2(obj)
```

## 原型链
- 函数的祖宗 就是Function `Function.prototype === Function.__proto__`
- Object的祖宗是 null,`Object.prototype.__proto__ ==null`
- Object 是一切对象的根,所有的原型都是基于Object.prototype,Function 是一个函数的根`Object.__proto__ === Function.prototype`


## 优先级
- 函数中:函数声明>arguments>变量声明
- ()>new Fn()>Fn.a()>new Fn.a() 
  - new 带参数(也就是执行)优先级比 .(变量访问) 会高,变量访问比new 不带参数优先级高 

