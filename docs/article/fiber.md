# fiber
<!-- 调度  调和 -->
[mock react](https://github.com/xiaoqi7777/react.git) fiber分支

[[toc]]
## 基础知识
### 屏幕刷新率
- 大多数设备的屏幕都是 60次/秒,页面是一帧绘制出来,当每秒绘制的帧数(FPS)到达60时,页面是流程的,小于这个值,用户会感觉到卡段
- 每个帧的预算事件是16.66毫秒(1秒/60)，1s 60帧,所以每一帧分到的事件是 1000/60 = 16ms,所以我们的代码力求不让义诊的工作量超过16ms

### 帧
- 每个帧的开头包括样式计算,布局和绘制
- js执行的js引擎和页面渲染引擎在同一个渲染现成,GUI渲染和js执行是互斥
- 如果某个任务执行时间过长 浏览器会推迟渲染
- 图片若显示过小 在新网页中看


<img :src="$withBase('/img/lifeofframe.jpg')" >


### rAf(requestAnimationFrame)
- requestAnimationFrame回调函数会在绘制之前执行,上图中显示他执行的时候在layout前面
- 下面的用法  当浏览器绘制前操作dom 让他的width 一直增加
```html
<body>
  <div style="background: red;width: 0;height: 20px;"></div>
  <button>开始</button>
  <script>
    const div = document.querySelector('div')
    const button = document.querySelector('button')
    let start;
    function progress(){
      div.style.width = div.offsetWidth + 1 + 'px'
      div.innerHTML = div.offsetWidth + '%'
      if(div.offsetWidth < 100){
        let current = Date.now()
        start = current
        timer = requestAnimationFrame(progress)
      }
    }
    button.onclick = function(){
      div.style.width = 0;
      start = Date.now();
      requestAnimationFrame(progress);
    }
  </script>
</body>
```
### requestIdleCallback
- requestIdleCallback 作用是 当正常帧任务完成后没超过16秒,说明时间有富余,此时就会执行`requestIdleCallback`里注册的响应
- `requestIdleCallback(callback,{timeout:1000})`,callback接收2个参数(didTimeout,timeRemaining())
  - didTimeout，布尔值，表示任务是否超时，结合 timeRemaining 使用
  - timeRemaining(), 表示当前帧剩余的时间
  - timeout表示如果超过这个时间后,任务还没有执行,则强制执行,不必等待
<img :src="$withBase('/img/cooperativescheduling.jpg')">

```html
<body>
  <script>
    // 
    function sleep(d){
      for(var t = Date.now();Date.now() - t <= d;){}
    }
    const works = [
      ()=>{
        console.log('第一个任务开始')
        sleep(20)
        console.log('第一个任务结束')
      },
      ()=>{
        console.log('第二个任务开始')
        sleep(20)
        console.log('第二个任务结束')
      },
      ()=>{
        console.log('第三个任务开始')
        sleep(20)
        console.log('第三个任务结束')
      }
    ]
    // timeout 意思是 告诉浏览器 1000ms 即使你没有空闲时间也得帮我执行, 因为我等不及了
    requestIdleCallback(workLoop,{timeout:1000})
    function workLoop(deadLine){
      // 返回值 deadLine.didTimeout 布尔值 表示任务是否超时 
      // deadLine.timeRemaining() 表示当前帧剩余的时间
      console.log('本帧剩余时间', parseInt(deadLine.timeRemaining()));
      while((deadLine.timeRemaining() > 1 || deadLine.didTimeout) && works.length>0){
        performUnitOfWork()
      }
      if(works.length>0){
        console.log(`只剩下${parseInt(deadLine.timeRemaining())}ms,时间片到了等待下次空闲时间的调度`);
        requestIdleCallback(workLoop)
      }
    }

    function performUnitOfWork(){
      works.shift()()
    }
  </script>
</body>
```
### 单链表
- 单链表是一种链式存取的数据结构
- 链表中的数据是以节点来表示的,每个节点的构成：元素+指针(指示后继元素的存储位子),元素就是存储数据的存储单元,指针就是连接每个节点的地址

<img :src="$withBase('/img/singlelink2.jpg')">

```js
class Update{
  constructor(payload,nextUpdate){
    this.payload = payload
    this.nextUpdate = nextUpdate
  }  
}

class UpdateQueue{
  constructor(){
    this.baseState = null
    this.firstUpdate = null
    this.lastUpdate = null
  }
  enqueueUpdate(update){
    if(this.firstUpdate == null){
      this.firstUpdate = this.lastUpdate = update
    }else{
      this.lastUpdate.nextUpdate = update
      this.lastUpdate = update
    }
  }
  forceUpdate(){
      let currentState = this.baseState || {}
      let currentUpdate = this.firstUpdate
      while(currentUpdate){
        let nextState = typeof currentUpdate.payload == 'function' ? currentUpdate.payload(currentState) : currentUpdate.payload
        currentState = {...currentState,...nextState}
        currentUpdate = currentUpdate.nextUpdate
      }
      this.firstUpdate = this.lastUpdate = null;
      this.baseState = currentState
      return currentState
  }
}

let queue = new UpdateQueue();
queue.enqueueUpdate(new Update({name:'sg'}))
queue.enqueueUpdate(new Update({age:12}))
queue.enqueueUpdate(new Update((data)=>({age:data.age+1})))
queue.enqueueUpdate(new Update((data)=>({age:data.age+2})))
console.log(queue.forceUpdate()) ;
console.log(queue.baseState)
```

## fiber
### Fiber 之前的Reconcilation(协调)
- React 会递归对比VirtualDOM树,找出需要变动的节点,然后同步更新他们,这个过程叫`Reconcilation`
- 在协调期间,React 会一直占用着浏览器的资源，一则会导致用户触发的事件得不到响应，二会导致卡顿
### Fiber
- 我们可以通过某些调度策略合理分配CPU资源,从而提高用户的响应数据
- 通过Fiber,让自己的 `Reconcilation` 过程变成可被中断。适时让出CPU执行权,可以让浏览器及时地响应用户的交互
- Fiber也是一个执行单元,每次执行完一个执行单元,React就会检查现在还剩多少时间,如果没有时间就将控制权让出去

<img :src="$withBase('/img/fiberflow.jpg')" >

- Fiber同时也是一种数据结构
  - React目前使用的是链表,每个VirtualDOM 节点内部表示一个Fiber
```js
type Fiber = {
  //类型  
  type: any,
  //父节点
  return: Fiber,
  // 指向第一个子节点
  child: Fiber,
  // 指向下一个弟弟
  sibling: Fiber
}
```
<img :src="$withBase('/img/fiberconstructor.jpg')" >

### 模拟fiber 执行过程 后面会详细分析
```js
/*
  1、从顶点开始遍历
  2、如果有儿子,先遍历大儿子
*/
// 在浏览器执行
let A1 = {type:'div',key:'A1'}
let B1 = {type:'div',key:'B1',return:A1};
let B2 = {type:'div',key:'B2',return:A1};
let C1 = {type:'div',key:'C1',return:B1};
let C2 = {type:'div',key:'C2',return:B1};
A1.child = B1;
B1.sibling = B2;
B1.child = C1;
C1.sibling = C2;

function sleep(d){
  for(var t = Date.now();Date.now() - t <= d;){}
}

let nextUnitOfWork = null;// 下一个执行单元
function workLoop(deadLine){
  while((deadLine.timeRemaining() > 1 || deadLine.didTimeout) && nextUnitOfWork){
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  if(!nextUnitOfWork){
    console.log('render阶段执行结束')
  }else{
    requestIdleCallback(workLoop,{timeout:1000})
  }
}
// 开始遍历
function performUnitOfWork(fiber){
  beginWork(fiber)//处理fiber
  if(fiber.child){// 如果有儿子 返回大儿子
    return fiber.child
  }
  // 如果没有儿子 说明此fiber已经完成了
  while(fiber){
    completeUnitOfWork(fiber)
    if(fiber.sibling){
      return fiber.sibling//如果有弟弟就返回 亲弟弟
    }
    // 在找父亲的弟弟
    fiber = fiber.return
  }
}
function completeUnitOfWork(fiber){
  console.log('结束',fiber.key)
}
function beginWork(fiber){
  sleep(20)
  console.log('开始',fiber.key)
}
nextUnitOfWork = A1
requestIdleCallback(workLoop,{timeout:1000})
```
## Fiber执行阶段
- 每次渲染有两个阶段:Reconciliation(协调/渲染)和Commit(提交阶段)
- 协调阶段:可以认为是Diff阶段,这个阶段可以被中断,这个阶段会找出所有节点变更,例如节点新增、删除、属性变更等等,这都称为react的(Effect)
- 提交阶段:将上一个阶段计算出来的需要处理的副作用一次行执行了,这个解读那必须是同步执行,不能被打断

## 初次渲染
### 1、scheduleRoot
- 以下所有的内容都是根据这个模板
- element通过babel编译成jsx语法,传给render方法,render会将element包装成一个fiber结构,进行调度根节点(scheduleRoot)
```js
import React from './react';
import ReactDOM from './react-dom';
let style = { border:'3px solid red',margin:'5px'}
let element = (
  <div id='A1' style={style}>
    A1
    <div id='B1' style={style}>
      B1
      <div id='C1' style={style}>C1</div>
      <div id='C2' style={style}>C2</div>
    </div>
    <div id='B2' style={style}>B2</div>
  </div>
)

ReactDOM.render(
  element,
  document.getElementById('root')
)
```
### 2、schedule(调度整体流程)
- 根据下面3条规则能将react串联起来
- a、**遍历的规则**
  - 先儿子,后弟弟,在叔叔，

<img :src="$withBase('/img/fiberconstructortranverse.jpg')" >

- b、**完成链规则**
  - 自己所有的子节点完成后完成自己
- c、**effect规则**
  - 自己所有的子节点完成后完成自己

### commit 阶段
<img :src="$withBase('/img/fiberCommit.jpg')" >

- 组装和遍历是一个反向操作, 有三种情况,第一个有副作用的儿子节点`firstEffect`, 最后一个有副作用的节点`lastEffect`, 有副作用节点之间关联起来`nextEffect`。
我们分析上面图,遍历到最底部是C1最先完成,此时B1的`firstEffect`和`lastEffect` 继承了C1的,但是C1的都为null, 那么C1 把自己往父节点挂上去, 那么`firstEffect`和`lastEffect` 变成了C1。当遍历C2的时候
B1的`lastEffect.nextEffect` 指向了C2。C1和C2遍历完成,便利B这一层,当遇到B1的时候 此时A1的`firstEffect`和`lastEffect` 同B1一样继承他了,为C1 C2,继承之后,B1把自己往父节点上挂,B1这个节点中A1(C1=>C2=>B1)。同理运行B2的时候 A1.`lastEffect.nextEffect`指向了B2,就这样无限循环下去

### 渲染 按照上面的element进行初次渲染,来看下利用这三条规则进行渲染

<img :src="$withBase('/img/fibereffectlistwithchild.jpg')" >

- 遍历节点
  - 对于每个有变化的节点,都会创建虚拟DOM生成，同时创建fiber,生成fiber树，此时的fiber结构有个属性保存着下一个兄弟节点(若有)
  - 深度递归遍历，只要有儿子就一直递归下去,没有儿子的时候会让自己完成,在去查看是否有下一个兄弟节点,若没有即返回父节点
  - 在完成的时候 firstEffect指向第一个完成的节点, lastEffect始终指向最后一个变化节点,每个完成的节点.nextEffect指向下一个完成的节点,这样所有发生副作用的fiber都会被收集到链表中
  - 第一个`1完成`的元素即是(A1 text文本) 在遍历的时候 他是首个没有child的元素,接着找他的兄弟元素(B1 div标签),同样(B1 text文本)是第二个的个`2完成`,接着找兄弟节点(C1 div标签),此时的(C1 text文本)就是第三个`3完成`的节点
  - (C1 text文本)完成后,没有儿子节点也没有兄弟节点,即返回父节点(C1 div标签)`4完成`。他会去找叔叔的(C2 div),此时(C2 text文本)`5完成`,同样(C2 text文本)没有兄弟和儿子节点,返回(C2 div标签)即父节点`6完成`
  - (B1 div标签)里面的儿子都完成自己就`7完成`了,他会去找自己的兄弟节点(B2 div标签),那么(B2 text文本)`8完成`,接着就是(B2 div标签)`9完成`,最后就是(A1 div标签)`10完成`
  - 此流程对应了上图中的(A1 text=> A1)的过程,下面有打印的过程
- 渲染
<img :src="$withBase('/img/fibereffectlistabc.png')" >
- render阶段 就是把虚拟DOM 转成 Fiber树,在根据Effect list 渲染

- 核心 mock fiber
```js
// 入口
import { TAG_ROOT, ELEMENT_TEXT, TAG_TEXT, TAG_HOST, PLACEMENT } from "./constants";
import { setProps } from './utils';
/*
  从根节点开始渲染和调度
  两个阶段
  diff阶段 对比新旧的虚拟DOM  进行增重 更新或创建 render阶段
    这个阶段可以比较花时间,我们可以对任务进行拆分,拆分的维度虚拟DOM。此阶段可以暂停
  render阶段成功是effect list知道哪些节点更新 哪些节点删除了 哪些节点增加了 
  render阶段有两个任务1、根据虚拟DOM生成fiber树 2、收集effectList
  commit阶段,进行DOM更新创建阶段,此阶段不能暂停,要一气呵成
*/
let nextUnitOfWork = null; // 下一个工作单元
let workInProgressRoot = null;// RootFiber引用的根
export function scheduleRoot(rootFiber){ //{tag:TAG_ROOT,stateNode:container,props:{children:[element]}}
  workInProgressRoot = rootFiber
  nextUnitOfWork = rootFiber;
}
// 执行当前单元节点
function performUnitOfWork(currentFiber){
  // 开始遍历当前的fiber的children 为每一个child配置成fiber 每个child之前通过 sibling 进行连接(大哥.sibling=二哥  二哥.sibling = 三妹)
  beginWork(currentFiber);
  // 1、有儿子情况 就返回他的儿子  作为下一个任务 下一个任务又回到 performUnitOfWork 里面
  if(currentFiber.child){
    return currentFiber.child;
  }
  // 2、没有儿子情况   就找弟弟
  while(currentFiber){
    completeUnitOfWork(currentFiber);//没有儿子 让自己完成
    if(currentFiber.sibling){// 看有没有弟弟
      return currentFiber.sibling;// 有弟弟就返回弟弟
    }
    // 3、没有儿子 自己也完成 没有弟弟, 就获取父亲 让父亲完成->去找他的弟弟(此时儿子都完成了),弟弟有就返回,到此三角形就循环起来了
    currentFiber = currentFiber.return;// 找父亲 然后让父亲完成
  }
}
// 在完成的时候(第一个是A1)要收集有副作用的fiber,然后组成effect list
// 每个fiber有两个属性,firstEffect指向第一个副作用的子fiber lasterEffect指向最后一个有副作用的fiber
// 中间的用nextEffect做成一个单链表 firstEffect=大儿子.nextEffect=二儿子.nextEffect=三儿子,lastEffect 也指向三儿子
/* 
  completeUnitOfWork 按照这个结构走
  A 
  A(Next)
  B1     B2
  C1 C2  D1  D2
*/
function completeUnitOfWork(currentFiber){// 第一个完成的是A1(TEXT) 
  // 此处打印所有完成的情况
  console.log('type=',currentFiber.type,'id=',currentFiber.props.id,'text=',currentFiber.props.text,)
  let returnFiber = currentFiber.return;// A1(TEXT) 的父亲 是A1
  if(returnFiber){
    /////// 这一段是把儿子的effect 链子挂到父亲身上
    //当没有父firstEffect没有的时候  让父的firstEffect 等于儿子的 firstEffect
    if(!returnFiber.firstEffect){
      // 根节点的 firstEffect 指向第一个完成的 节点 以后就不会变动了
      returnFiber.firstEffect = currentFiber.firstEffect;
    }
    if(currentFiber.lastEffect){
      if(returnFiber.lastEffect){
        // 让兄弟节点(B1)的最后一个.nextEffect 指向兄弟节点(B2)最开始一个.nextEffect
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect
      }
        // 根节点的 指向当前节点的 最后一个完成的
        returnFiber.lastEffect = currentFiber.lastEffect
    }
    /////把自己挂到父亲身上
    const effectTag = currentFiber.effectTag;
    if(effectTag){ //说明自己有副作用 没有的时候 就是新增
      if (returnFiber.lastEffect){
        returnFiber.lastEffect.nextEffect = currentFiber
      }else{
        returnFiber.firstEffect = currentFiber;
      }
      // lastEffect一直都是在变动的
      returnFiber.lastEffect = currentFiber
    }
  }
}
  /*
    beginWork开始收集
    completeUnitOfWork 把下面的都收集完成了
    1、创建真是DOM元素
    2、创建子fiber 
   */
function beginWork(currentFiber){
  // 如果是根节点
  if(currentFiber.tag === TAG_ROOT){
    updateHostRoot(currentFiber);
  // 如果是文本节点
  }else if(currentFiber.tag === TAG_TEXT){
    updateHostText(currentFiber)
  }else if (currentFiber.tag === TAG_HOST){// 原生DOM节点
    updateHost(currentFiber)
  }
}
function updateHost(currentFiber){
  if(!currentFiber.stateNode){// 如果此fiber没有创建DOM节点
    currentFiber.stateNode = createDOM(currentFiber)
  }
  const newChildren = currentFiber.props.children
  reconcileChildren(currentFiber,newChildren);
}
// 创建真是的节点
function createDOM(currentFiber){
  // 文本节点
  if(currentFiber.tag === TAG_TEXT){
    return document.createTextNode(currentFiber.props.text)
  }else if(currentFiber.tag === TAG_HOST){
  // 原生节点
    let stateNode = document.createElement(currentFiber.type)
    updateDOM(stateNode,{},currentFiber.props);
    return stateNode;
  }
}
function updateDOM(stateNode,oldProps,newProps){
  // 增加 if (stateNode && stateNode.setAttribute)
  if (stateNode && stateNode.setAttribute){
    setProps(stateNode,oldProps,newProps);
  }
}
function updateHostText(currentFiber){
  // 如果此fiber没有创建DOM节点
  if(!currentFiber.stateNode){
    currentFiber.stateNode = createDOM(currentFiber)
  }
}
function updateHostRoot(currentFiber){
  // 先处理自己, 如果是一个原生节点 创建真实DOM 2、创建子fiber
  let newChildren = currentFiber.props.children;//[element=A1]
  // 调和节点 这里出创建根节点一个 Fiber
  reconcileChildren(currentFiber,newChildren);
}
//newChildren是一个虚拟DOM的数组 把虚拟DOM转成Fiber节点
function reconcileChildren(currentFiber,newChildren){
  let newChildIndex = 0;// 新子节点的索引
  // 增加2行
  let prevSibling;// 上一个新的子fiber
  // 遍历我们的子虚拟DOM 元素数组,为每个虚拟DOM元素创建子Fiber
  while(newChildIndex<newChildren.length){
    let newChild = newChildren[newChildIndex];// 取出子元素节点[A1]{type=A1}
    let tag;
    if(newChild && newChild.type === ELEMENT_TEXT){
      tag = TAG_TEXT;// 这是一个文本节点
    }else if(newChild && typeof newChild.type === 'string'){
      tag = TAG_HOST;// 如果type是字符串,那是一个原生的DOM节点
    }
    // beginWork创建fiber 在 completeUnitOfWork 的时候收集effect
    let newFiber = {
      tag,//TAG_HOST
      type:newChild.type,
      props:newChild.props,
      stateNode:null,// div还没有创建DOM元素
      return:currentFiber,//父Fiber
      effectTag:PLACEMENT,// 副作用标识,render我们要会收集副作用 增加 删除 更新
      nextEffect:null,// effect list 也是一个单链表
      // effect list 顺序和完成顺序是一样的 但是节点只放哪些变化的fiber节点,不变化的不会放进去
    }
    // 最小的儿子是没有弟弟的
    if(newFiber){
      if(newChildIndex === 0){// 如果当前索引为0 说明是第一个儿子
        currentFiber.child = newFiber
      }else{
        // 让第一儿子 指向他下一个兄弟
        // reconcileChildren 只会遍历当前的儿子
        prevSibling.sibling = newFiber;
      }
      prevSibling = newFiber
    }
    newChildIndex++;
  }
}
// 循环执行工作 nextUnitWork 不管有沒有任务都会进入 一旦检测到nextUnitOfWork 有值就执行逻辑
function workLoop(deadLine){
  let shouldYield = false;//是否要让出时间片或者说控制权
  while(nextUnitOfWork && !shouldYield){
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);//执行完一个任务后
    shouldYield = deadLine.timeRemaining() < 1;// 没有时间的话 就要让出控制权
  }
  if(!nextUnitOfWork && workInProgressRoot){// 如果时间片到期后还有任务没有完成,就需要请求浏览器再次调度
    commitRoot();
  }
  // 不管有没有任务 都请求再次调度 每一帧都要执行一次workLoop
  requestIdleCallback(workLoop,{timeout:500})
}
function commitRoot(){
  let currentFiber = workInProgressRoot.firstEffect 
  while(currentFiber){
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }
  workInProgressRoot = null
}
function commitWork(currentFiber){
  if(!currentFiber) return;
  let returnFiber = currentFiber.return;
  let returnDOM = returnFiber.stateNode;
  if(currentFiber.effectTag === PLACEMENT){
    returnDOM.appendChild(currentFiber.stateNode)
  }
  currentFiber.effectTag = null;
}
// react告诉浏览器 我现在有任务请你在闲的时候
requestIdleCallback(workLoop,{timeout:500})
```
## 更新
- 在第一次更新之前 commitRoot 的时候 workInProgressRoot(渲染时候的fiberRoot) 会保存在currenRoot(当前页面显示的fiberRoot)中,在更新的时候  workInProgressRoot指向更新时的fiberRoot,fiberRoot属性(alternate)指向currentRoot(老的),他会进入到reconcileChildren(创建fiber),在这里他会通过fiberRoot.alternate获取来的老根节点,通过新老fiberRoot进行对比,当创建的fiber,有一个属性alternate指向老节点的fiber 

 fiber都 那么创建newFiber对象的时候会多一个alternate属性,他指向oldFiber,新fiber递归创建,他里面的alternate属性都指向同级的oldFiber,每一个新fiber都有一个指针指向oldFiber,等待所有的effect收集完成,用currentFiber.alternate.props和currentFiber.props进行DOM更新
- 在第二次更新的时候,
<img :src="$withBase('/img/updatecomponent.jpg')" >

### 双缓存机制

<img :src="$withBase('/img/alternate.jpg')" >
