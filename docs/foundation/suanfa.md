# 算法题目
[[toc]]
## 排序

### 快速排序
```js
function fn(arr){
  let len = arr.length
  if(len<2) return arr
  let mid = arr.splice(Math.floor(Math.random()*(len)/2),1)[0]
  let left=[];
  let right=[];
  for(let i=0;i<arr.length;i++){
    if(arr[i]<mid){
      left.push(arr[i])
    }else{
      right.push(arr[i])
    }
  }
  return fn(left).concat([mid],fn(right))
}
console.log(fn([2,44,22,11,5,7,1,3]))
```

### 冒泡排序
```js
function fn(arr){
  let len = arr.length
  for(let i=0;i<len;i++){
    for(let j=0;j<len;j++){
      if(arr[i]>arr[j]){
        [arr[i],arr[j]]=[arr[j],arr[i]]
      }
    } 
  }
  return arr
}
console.log(fn([2,44,22,11,5,7,1,3]))
```

### 选择排序
```js
function fn(arr){
  let index;
  let len = arr.length
  for(let i=0;i<len;i++){
    index = i
    for(let j=i+1;j<len;j++){
      if(arr[index]>arr[j]){
        index = j
      }
    }
    [arr[index],arr[i]] = [arr[i],arr[index]]
  }
  return arr
}
console.log(fn([2,44,22,11,5,7,1,3]))
```

## 编写parse函数，实现访问对象里属性的值
```js
// 编写parse函数，实现访问对象里属性的值

function parse1(obj,str){
  let rs = new Function('obj',`return obj.`+str)
  return rs(obj)
}

function parse2(obj,str){
  str = str.replace(/\[(\d+)\]/g,($0,$1)=>`.${$1}`)
  str = str.split('.')
  str.forEach(item=>{
    obj = obj[item]
  })
  return obj
}

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

console.log(r1,r2,r3,r4)
```

## 数组扁平化flat方法的多种实现
```js
let arr = [
  [1],
  [2, 3],
  [4, 5, 6, [7, 8, [9, 10, [11]]]],
  12
];
// 1
let rs = arr.toString().split(',')
// 2
while(arr.some(item=>Array.isArray(item))){
  arr =  [].concat(...arr)
}
// 3
Array.prototype.fn = function(){
  let rs = []
  function _fn(arr){
    for(let i=0;i<arr.length;i++){
      if(Array.isArray(arr[i])){
        _fn(arr[i])
      }else{
        rs.push(arr[i])
      }
    }
    return rs  
  }
  return _fn(this)
}

console.log(arr.fn())
```
## 柯里化
```js
console.log(add(1, 2, 3, 4, 5));//15
console.log(add(1)(2, 3)(4, 5));//15
console.log(add(1)(2)(3)(4)(5));//15


// 1
function _add(a,b,c,d,e){
  return a+b+c+d+e
}
function fn(_add,...args){
  return args.length < _add.length ? (...innerArgs) =>fn(_add,...args,...innerArgs) : _add(...args)
}
let add = fn(_add)
// 2
function add(...args){
  let rs = add.bind(null,...args)
  rs.toString = function(){
    return args.reduce((a,b)=>a+b)
  }
  return rs
}

```
## ['1','2','3'].map(parseInt)
- 结果 1 NaN NaN
- parseInt(string,radix) 如果radix在2-36之外会返回NaN
- 当radix 为0 或者没有的时候 按10进制计算

## 中文排序
```js
  ['阿萨德','说的','请问'].sort((a,b)=>a.localeCompare(b,'zh'))
```
## 素数
```js
// 判断
function fn(n){
  if(n<=1){ return false}
  let isFlag = true
  const N = Math.floor(Math.sqrt(n))
  for(let i=2;i<=N;i++){
    if(n%i === 0){
      isFlag = false
      break
    }
  }
  return isFlag
}
console.log(fn(25))
// 获取所有的
function * fn(num){
  let arr = Array.from({length:num-2},(_,i)=>i+2)
  let p=''
  while(p = arr.shift()){
    yield p
    arr = arr.filter(n => n%p!==0)
  }
}
let rs = fn(20)
console.log([...rs])
```
## 判断数组
```js
[].constructor === Array
Array.isArray([])
Object.prototype.toString.call([])
```
## map 注意点
```js
let arr = [
  {
    name:'sg1',
    age:11
  },
  {
    name:'sg2',
    age:12
  },
]
// map 不会改变原数组 但是item.age 会改变
arr.map(item=>{
  item.age=item.age>12?13:10
  return item
})
// 这种情况可以
arr.map(item=>{
  return {
    ...item,
    age:item.age>12?13:10
  }
})
```
## 数组最值
- 最小值用min
- 最大值用max
```js
const A = [1,2,3,4,5,6]
const max = Math.max(...A)
// 等价于 const max = Math.max(1,2,3,4,5,6)
```

## 深拷贝
- Object.getOwnPropertyDescriptors(obj) 对象自身的属性 非继承的
```js
function clone(obj){
  if(obj ==null|| typeof obj!= 'object') return obj
  const newObj = new obj.constructor()
  for(let key in Object.getOwnPropertyDescriptors(obj)){
    newObj[key] = clone(obj[key])
  }
  return newObj
}
```
## 深比较
```js
function deepCompare(a,b){
  if(a===null||typeof a !== 'object' || b===null||typeof b!=='object'){
    return a === b
  }
  const propsA = Object.getOwnPropertyDescriptors(a)
  const propsB = Object.getOwnPropertyDescriptors(b)
  if(Object.keys(propsA).length !== Object.keys(propsB)){
    return false
  }
  return Object.keys(propsA).every(item=>deepCompare(a[item],b[item]))
}
```
## 栈
```js
// 栈 实现
export default function Stack(max = 1000){
    this.data = new Array(max)
    this.top = -1
    this.max = max
}

Stack.prototype.push = function(x){
  if(this.top === this.max -1){
    throw 'stackoverflow'
  }
  this.top ++;
  this.data[this.top] = x
}

Stack.prototype.pop = function(){
  if(this.top === -1){
    throw 'stackoverflow'
  }
  const x = this.data[this.top]
  this.top -- 
  return x
}

Stack.prototype.length = function(){
  return this.top + 1
}
// 栈实现队列

// stack1 :用于入队
// stack2 :用于入队

class Queue{
  constructor(){
    super()
    this.s1 = new Stack(max)
    this.s2 = new Stack(max)
  }
  enqueue(x){
    this.s1.push(x)
  }
  dequeue(){
    // 为了保证 s2里面的顺序 必须等s2清空 
    if(this.s2.length){return this.s2.pop()}
    while(this.s1.length){
      this.s2.push(this.s1.pop())
    }
    return this.s2.pop()
  }
}
```
## 队列
```js
/**
 * 队列
 * */ 
export default function Queue(max = 1000){
  this.data = new Array(max)
  this.head = 0
  // 尾指针 
  this.tail = 0
  this.max = max
  this.size = 0
}
// 入列
Queue.prototype.enqueue = function(x){
  if(this.size === this.mex) { throw 'overflow' }
  this.data[this.tail] = x;
  // 当尾指针到头的时候  尾指针在回到0
  this.size ++
  if(this.tail === this.max -1){
    this.tail = 0
  }else{
    this.tail ++
  }
}
// 出列
Queue.prototype.dequeue = function(){
  // undefined
  if(this.size === 0) { throw 'undefined' }
  this.size --
  const x = this.data[this.head]
  this.head ++ 
  return x
}

Queue.prototype.get = function(){
  return this.size
}
// 用队列实现栈


// stack1 :用于入队
// stack2 :用于入队


let Queue = require ('./queue.js')
class Stack{
  constructor(max){
    this.Q1 = new Queue(max)
    this.Q2 = new Queue(max)
  }
  // enqueue dequeue
  push(data){
    if(this.Q1.length()<1){
      this.Q1.enqueue(data)
      for(let i=0;i<this.Q2.length;i++){
        let q2 = this.Q2.dequeue()
        this.Q1.enqueue(q2)
      }
      return
    }
    if(this.Q2.length()<1){
      this.Q2.enqueue(data)
      for(let i=0;i<this.Q1.length;i++){
        let q1 = this.Q1.dequeue()
        this.Q2.enqueue(q1)
      }
      return
    }
  }
  pop(){
    if(this.Q1.length()>0){
      return this.Q1.dequeue()
    }
    if(this.Q2.length()>0){
      return this.Q2.dequeue()
    }
  }
}
let stack =new Stack(100)

stack.push(3)
stack.push(1)
stack.push(2)
console.log(stack.pop())
```
## 随机数组打乱
```js
function fisher1(arr){
  for(let i=0;i< arr.length-1; i++){
    const j = i + Math.floor(Math.random()*(arr.length - i));
    [arr[i], arr[j]] = [arr[j],arr[i]]
  }
  return arr
}

// 错误的算法   比较慢
function shuffle2(arr){
  return arr.sort((x,y)=>Math.random() - 0.5)
}
```
## 斐波拉契树
- 后一项是前面2项之和
```js
function fn(n){
  return n>2?fn(n-1)+fn(n-2):1
}
console.log(fn(6))
```
## 给定一个括号表达式,中间只有[]和(),判断这个表达式两边括号是不是平衡的
- 比如[(())] 是平衡的  比如[()(()] 就不是 
```js
function isB(str){
  let [first,...other] = str
  let stack = [first]
  while(other.length>0){
    let a1 = stack[stack.length-1]
    let a2 = other.shift()
    if(match(a1,a2)){
        stack.pop()
    }else{
      stack.push(a2)
    }
  }
  return stack.length === 0
}

function match(a,b){
  return (a=='['&&b==']')||(a=='('&&b==')')
}
console.log(isB('[()]'))
```
## 创建数组
```js
[...Array(10)].map((_,i)=>i)
Array(10).fill(0).map((_,i)=>i)
Array.from({length:10},(_,i)=>i)
```
## 省市县 根据id和 parent_id  将数组转换成DOM树结构
- 每个元素的 id 都有对应的 子对象 即子元素的parent_id
- 创建一个新的对象map{id:{当前id元素}}
- 遍历数组 只要有 查找map[parent_id],增加children往里面添加儿子元素,因为children添加的是引用地址 先添加 id3 在添加id2的时候,都会挂到一起
- 最后删除 parent_id 非0 的既可以
```js
let array = [
  {
    id: 1,
    parent_id: 0,
    name: "四川省"
  },
  {
    id: 2,
    parent_id: 0,
    name: "广东省"
  },
  {
    id: 3,
    parent_id: 0,
    name: "江西省"
  },
  {
    id: 5,
    parent_id: 1,
    name: "成都市"
  },
  {
    id: 6,
    parent_id: 5,
    name: "锦江区"
  },
  {
    id: 7,
    parent_id: 6,
    name: "九眼桥"
  },
  {
    id: 8,
    parent_id: 6,
    name: "兰桂坊"
  },
  {
    id: 9,
    parent_id: 2,
    name: "东莞市"
  },
  {
    id: 10,
    parent_id: 9,
    name: "长安镇"
  },
  {
    id: 11,
    parent_id: 3,
    name: "南昌市"
  }
]

function fn(array){
  let map = {};
  let arr = []
  array.map(item=>{
    map[item.id] = item
  })
  array.map(item=>{
    let parent_id = item.parent_id
    if(parent_id !== 0){
      map[parent_id].children? map[parent_id].children.push(item):map[parent_id].children = [item]
    }
  })
  for(let key of Object.values(map)){
    if(key.parent_id == 0){
      arr.push(key)
    }
  }
  console.log(arr)
}


fn(array)
```
## 数组转tree
- 二维数组
```js
let input = [
      ["新闻", "体育", "网球", "国外"],
      ["新闻", "体育", "网球", "国内"],
      ["产品", "互联网", "金融"],
      ["新闻", "房产", "深圳"],
      ["新闻", "房产", "上海"],
      ["新闻", "体育", "羽毛球"],
      ["产品", "互联网", "保险"]
  ]

  function createTreeFromArray(arr) {
    const cache = {};
    const root = {
      child: [],
    };

    for (let i = 0; i < arr.length; i += 1) {
      for (let j = 0; j < arr[i].length; j += 1) {
        const element = arr[i][j];
        if (!cache[element]) {
          console.log('elem',element)
          cache[element] = {
            name: element,
          };
        }
        if (j > 0) {
          const parent = cache[arr[i][j - 1]];
          if (parent) {
            parent.child = []
            if (parent.child.indexOf(cache[element]) < 0) {
              parent.child.push(cache[element]);
            }
          }
        } else {
          if (root.child.indexOf(cache[element]) < 0) {
            root.child.push(cache[element]);
          }
        }
      }
    }

    return root.child;
  }
  console.log('createTreeFromArray',createTreeFromArray(input))
```
## 对象转换
```js
// 输入
let input = "Prod_id,prod_Name,prod_dEsc"
// 输出 
let ouput = [{
    "key": "prodId",
    "label": "Prod Id",
    "index": 1
}, {
    "key": "prodName",
    "label": "Prod Name",
    "index": 2
}, {
    "key": "prodDesc",
    "label": "Prod Desc",
    "index": 3
}]
function fn(arr){
  let arrs = arr.split(',')
  return arrs.reduce((a,b,index)=>{
    a.push({
      key:b.replace(/\_(\w)/,($0,$1)=>$1.toUpperCase()),
      label: b.replace(/\_(\w)/,($0,$1)=>` ${$1.toUpperCase()}`),
      index:index+1
    })
    return a
  },[])
}
console.log(fn(input))
```
## 根据单词表切分单词 
```js
//输入
let words=['my','home','welcome','this']
let input="hellothisismyhomewelcometomyhome"
//输出
let oupput=["hello","this","is","my","home","welcome","to","my","home"]
function fn(words,input){
  for(let key of words){
    let reg = new RegExp(`(${key})`,'g')
    input = input.replace(reg,($0,$1)=>` ${$1} `)
  }
  input = input.split(' ').filter(item=>item.length)
  console.log(input)
}
fn(words,input)
```