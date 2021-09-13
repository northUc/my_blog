# react16版本

## 渲染
- 主要解析要渲染的对象:`原生js  class  fnction` 
- `React.createElement`用来创建虚拟DOM, 他主要对元素进行分类,分成`原生js  class  fnction`,最后包装成一个对象返回,如果儿子节点是多层的情况 还会进行递归处理。
```js
import React from './react';
import ReactDOM from './react-dom';
function FunctionCounter(props){
  return React.createElement('div', {id: 'counter'}, 'hello2','123');
}
class ClassComponent extends React.Component{
  render() {
    return React.createElement(FunctionCounter, {id: 'counter'}, 'hello1');
  }
}
ReactDOM.render(
  elm,
  document.getElementById('root')
);
```
### babel 编译后的样子
```js
let onClick1 = (event) => {
  console.log('onclick1',event);
}
let onClick = (event) => {
  console.log('onclick', event);
  event.persist();
  setInterval(()=>{
    console.log('-----------------------------------')
  },1000) 
}
// js里面变量名基本上是驼峰
//  写法
let elm = React.createElement('div',
  {
   id:'sayHello',
   onClick,
   style:{
     with:'100px',
     height:'100px',
     border:'1px solid red'
   }
  },
  'div',
  React.createElement('section', {
      onClick:onClick1,
      style: {
        color: 'red',
        with:'50px',
        height:'50px',
        border:'1px solid green'
      }},
      'section')  
)
```
### render
- render函数就是将 `React.createElement` 创建的虚拟DOM转化成真实DOM挂载到第二个参数上。核心就就是`createDOM`函数
- `createDOM`会根据传进的元素进行分类`普通文本 class 原生DOM function`根据不同的类型分别进行处理,最后都会返回处理后的新DOM进行返回,然后挂载到root上。对于react多数组,同一级别的元素react都会进行打平操作
```js
// 打平 最后会打平成这个样子
{[1],[2],[3,[4]]} ==={[1,2,3,4]}
```
## 合成事件
- 1、因为合成事件可以屏蔽浏览器的差异,不同浏览器绑定事件和触发事件的方法不一样
- 2、合成阔以实现事件对象的复用，重用，减少垃圾回收，提高性能
- 3、因为默认我要实现批量更新 setState, setState 两个SetState 合并成一次更新，这个也是合成事件中实现的
### 流程,所有的事件都是冒泡到 document，进行统一管理
- 比如 click 事件触发的时候,他会从目标源到document进行遍历，获取每一个需要处理的元素绑定了click事件函数,进行触发
- event persist 作用是event事件持久化,默认情况下 合成event 在函数执行完成后, 合成event 里面的数据会被指向null。persist作用是让当前的合成的event继续存在，实现就是在当前函数执行的时候执行 event.persist()，他会改变内部 合成event 指向，等待事件遍历完成，去清除合成event时候，只是处理改变后的，之前的合成event并没有被清除
- 处理批量更新,在处理事件的之前就开始 批量更新模式，再去处理函数里面的setState,等所有的事件函数都执行完成后,在关闭批量更新模式,对页面更新

## setState
- 里面有个变量控制 批量更新,默认是开启批量更新。
- 在事件处理中，同步情况下,每次调用`setState`他都会把状态保存起来，然后尝试类组件更新。
  - 如果当前还是处于批量更新的情况,把自己放到更新队列中。多次调用情况下, 会一直走这里 请数据保存起来
  - 如果当前不是批量更新,那么就去更新,去执行 `shouldUpdate`更新钩子逻辑,在对组件进行`forceUpdate`强制更新
- 类组件 阔以调用`forceUpdate` 对组件 进行强制更新。
- `import { unstable_batchedUpdates } from './react-dom'` 强制更新
  - `unstable_batchedUpdates` 逻辑很简单,强制开始批量更新,执行传递进来的逻辑,在关闭批量更新,调用队列更新,去更新组件

## forceUpdate
- 每次setState执行完成组件尝试去更新，首先判断`shouldUpdate`钩子是否支持,如果支持才调用`forceUpdate`执行强制更新。另外我们可以通过类组件直接调用`forceUpdate`进行强制更新
- 在这里 会走`componentWillMount`&`getSnapshotBeforeUpdate`&`render`&`componentDidUpdate`钩子一次执行, render之后, 拿新老dom比较更新

## diff
- 1、新的元素没有、type不一样、文本不一样直接进行替换
- 2、如果都是类和函数组件,他们会再次进入循环体进行dom比较
- 3、核心在两个type相同的native元素进行比较 以下面例子比较 `A B C D`和`A C B E F`
  - 下面有2点 深度优先 第一点是 diffQueue 收集,对需要操作的dom进行搜集
  - 第二点 patch 对dom进行统一处理
```js
// 1、patch 打印diffQueue 需要操作的dom
//     [
//       {
//         "parentNode": {
//           "eventStore": {}
//         },
//         "type": "MOVE",
//         "fromIndex": 1,
//         "toIndex": 2
//       },
//       {
//         "parentNode": {
//           "eventStore": {}
//         },
//         "type": "INSERT",
//         "toIndex": 3,
//         "dom": {}
//       },
//       {
//         "parentNode": {
//           "eventStore": {}
//         },
//         "type": "INSERT",
//         "toIndex": 4,
//         "dom": {}
//       },
//       {
//         "parentNode": {
//           "eventStore": {}
//         },
//         "type": "REMOVE",
//         "fromIndex": 3
//       }
//     ]
// 2、下面是具体的4个变化的dom
//       a、首先匹配A情况  都是一样的直接赋用老元素
//       b、查看新元素里面的C,在老元素有对应的 并且赋用老元素的位子lastIndex(2)大于当前挂载的位子mountIndex(1),即同样不用操作
//       c、查看B元素,去老的元素找到同样的,但是他的mountIndex(1)小于lastIndex(2),即需要操作,将他移动到lastIndex的后面, 
//           看上面 patch 第一个参数 type 即为MOVE,fromIndex 代表最后要落下的位子(用新元素的mountIndex即可), toIndex(代表当前老元素的位子)
//       d、查看E,老元素里面没有 那就插入,patch 第二个参数 type 为INSERT, toIndex 表示要插入到那儿(用新元素的mountIndex 表示)
//       e、F同E
//       f、新元素遍历完成,去遍历老元素 删除新元素内没有用到的,即D 被删除掉 fromIndex代表当前老元素的位子
//     MOVE {$$typeof: Symbol(ELEMENT), type: "li", key: "B", ref: undefined, props: {…}, …}
//     INSERT {$$typeof: Symbol(ELEMENT), type: "li", key: "E", ref: undefined, props: {…}}
//     INSERT {$$typeof: Symbol(ELEMENT), type: "li", key: "F", ref: undefined, props: {…}}
//     REMOVE {$$typeof: Symbol(ELEMENT), type: "li", key: "D", ref: undefined, props: {…}, …}
//    3、深度优先 搜集 diffQueue 对dom进行统一处理
//       a、 MOVE 的操作是 先删除 在插入,先将 REMOVE 和 MOVE 统一删除
//       b、 在将 INSERT 和 MOVE 统一插入节点操作
    
class ClassComponent extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      show: true
    }
  }
  
  handleClick = () => {
    this.setState(state => ({show: !state.show}));
  }
  render() {
    if(this.state.show){
      return (
        <ul onClick={this.handleClick}>
          <li key='A'>A</li>
          <li key='B'>B</li>
          <li key='C'>C</li>
          <li key='D'>D</li>
        </ul>
      )
    }else {
      return (
        <ul onClick={this.handleClick}>
          <li key='A'>A</li>
          <li key='C'>C</li>
          <li key='B'>B</li>
          <li key='E'>E</li>
          <li key='F'>F</li>
        </ul>
      )
    }
  }
}
```
## cycle

### 初始阶段
- 组建实例化 会执行`constructor` => `getDerivedStateFromProps` => `render` => `componentDidMount`
### 更新阶段
- 接受新的数据 `getDerivedStateFromProps` => `shouldComponentUpdate` => `render` => 获取快照`getSnapshotBeforeUpdate` 这个的返回值会传给 `componentDidUpdate` 第三个参数
### 销毁阶段
- `componentWillUnMount` 这个是发生在diff的时候 如果比较dom diff 元素不见了 就会卸载组件

### 老生命周期有2个被删除了～
- `componentWillMount` &`componentWillUpdate`
- 使用不当 会造成死循环,他阔以拿到this 修改父组件的数据,新的`getDerivedStateFromProps`方法替代 他是一个函数没法获取到this

## context
- context用法很简单 
  - `createContext`返回两个对象`Provider`组件注册数据,`Consumer`接受回调拿数据
  - 类组件中,获取可以通过`static contextType = ThemeContext` 内部在解析组件的时候 会判断是否有这个存在 如果有的话,会把`Provider`传递的数据挂在当前实例上`context`上
```js
let ThemeContext = React.createContext(null);
// ....父组件
<ThemeContext.Provider value={{}}>
    <div>
    </div>
</ThemeContext.Provider>

<ThemeContext.Consumer>
    {
        (value) => (
            <div>
              {value}
            </div>
        )
    }
</ThemeContext.Consumer>
```
```js
// 解析类组件
 if(oldElement.type.contextType){
        componentInstance.context = oldElement.type.contextType.Provider.value;
    }
```
```js
function createContext(defaultValue){
    Provider.value = defaultValue;// context会复制一个初始值
    function Provider(props){
        Provider.value = props.value;// 每次Provider重新更新时候 也会重新赋值
        return props.children;
    }
    function Consumer(props){
        return onlyOne(props.children)(Provider.value)
    }
    return {Provider, Consumer}
}
```

## fiber
## DOM=>fiber
- fiber是一个数据结构,也是一个对象。
- 上面是通过babel编译后的DOM, 每一个节点都会转成 特定的数据结构(fiber),所以第一步是将dom全部转换成fiber。fiber有一些必备属性（type props return effectTag nextEffect等）他们记录了每个DOM信息以及DOM直接的关联
- fiber 遍历是从跟节点开始 深度优先。图可以看出关联，child指向元素的自字节，sibling 指向 元素的下一个兄弟节点,return 执行父节点。可以看代码的`beginWork`方法,实现了DOM转fiber，以及`child` `return` `sibling`之间的关联
- `performUnitOfWork`方法对DOM进行递归遍历,原则是先找最深的第一个元素,接着找他的下一个兄弟元素, 依次寻找,兄弟元素找完成后, 找父元素 在找父元素的兄弟元素 依次循环,遍历所有节点
```js
// let element = (
//     <div id='A1'>
//         <div id='B1'>
//             <div id='C1'></div>
//             <div id='C2'></div>
//         </div>
//         <div id='B2'></div>
//     </div>
// )
// console.log(JSON.stringify(element, null, 2))
let element = {
    "type": "div",
    "props": {
      "id": "A1",
      "children": [
        {
          "type": "div",
          "props": {
            "id": "B1",
            "children": [
              {
                "type": "div",
                "props": {
                  "id": "C1"
                },
              },
              {
                "type": "div",
                "props": {
                  "id": "C2"
                },
              }
            ]
          },
        },
        {
          "type": "div",
          "props": {
            "id": "B2"
          },
        }
      ]
    },
  }

```

## fiber组装
- 组装和遍历是一个反向操作, 有三种情况,第一个有副作用的儿子节点`firstEffect`, 最后一个有副作用的节点`lastEffect`, 有副作用节点之间关联起来`nextEffect`。
我们分析上面图,遍历到最底部是C1最先完成,此时B1的`firstEffect`和`lastEffect` 继承了C1的,但是C1的都为null, 那么C1 把自己往父节点挂上去, 那么`firstEffect`和`lastEffect` 变成了C1。当遍历C2的时候
B1的`lastEffect.nextEffect` 指向了C2。C1和C2遍历完成,便利B这一层,当遇到B1的时候 此时A1的`firstEffect`和`lastEffect` 同B1一样继承他了,为C1 C2,继承之后,B1把自己往父节点上挂,B1这个节点中A1(C1=>C2=>B1)。同理运行B2的时候 A1.`lastEffect.nextEffect`指向了B2,就这样无限循环下去
