# react 优化
[[toc]]
## 路由切换
- 懒加载 利用 webpack 的 import 配合React.lazy,当组建渲染的时候在拉取代码块
- webpackPrefetch 在浏览器空闲的时候 去加载(在head标签中 加入link标签)
- src\index.js
```js
import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router,Route,Link} from 'react-router-dom';
import {dynamic} from './utils';
const LoadingHome = dynamic(()=>import(/*webpackPrefetch:true*/'./components/Home'));
const LoadingUser = dynamic(()=>import(/*webpackPrefetch:true*/'./components/User'));
ReactDOM.render(
    <Router>
        <ul>
            <li><Link to="/">Home</Link></li>
            <li> <Link to="/user">User</Link></li>
        </ul>
        <Route path="/" exact={true} component={LoadingHome}/>
        <Route path="/user" component={LoadingUser}/>
    </Router>
    ,document.getElementById('root'));
```
- src\utils.js
```js
const Loading = () => <div>Loading</div>;
export function dynamic(loadComponent) {
    const LazyComponent = lazy(loadComponent)
    return () => (
        <React.Suspense fallback={<Loading />}>
            <LazyComponent />
        </React.Suspense>
    )
}
function lazy(load) {
    return class extends React.Component {
        state = { Component: null }
        componentDidMount() {
            load().then(result => {
                this.setState({ Component: result.default});
            });
        }
        render() {
            let { Component } = this.state;
            return Component && <Component />;
        }
    }
}
```
## 组件缓存
- PureComponent 处理类组件  memo处理函数组件
- 默认情况下 父组件更新 子组件也要更新,通过`PureComponent` 处理`shouldComponentUpdate`生命周期处理
```js
import React from 'react';
export class PureComponent extends React.Component{
    shouldComponentUpdate(nextProps,nextState){
        return !shallowEqual(this.props,nextProps)||!shallowEqual(this.state,nextState)
    }
}
export function memo(OldComponent){
        return class extends PureComponent{
        render(){
            return <OldComponent {...this.props}/>
        }
    }
}
```
## 数据深拷贝
### immer
- 处理数据不可变(处理方案:深度拷贝,immer)
- 特点 利用的proxy 代理处理的,只要修改后的数据返回的对象都是不一样的
- react 用 'use-react'
- 基本使用
```js
import { produce } from 'immer';
let baseState = {}

let nextState = produce(baseState, (draft) => {

})
console.log(baseState===nextState);


import { produce } from 'immer';
let baseState = {
  ids: [1],
  pos: {
    x: 1,
    y: 1 
  }
}

let nextState = produce(baseState, (draft) => {
  draft.ids.push(2);
})
console.log(baseState.ids === nextState.ids);//false
console.log(baseState.pos === nextState.pos);//true
```
### immutable
```js
import React from 'react';
import {PureComponent} from './utils';
import { Map } from "immutable";
export default class App extends React.Component{
  constructor(props){
    super(props);
   this.state = {count:Map({ number: 0 })}
  }
  add = (amount)=>{
   let count = this.state.count.set('number',this.state.count.get('number') + amount);
   this.setState({count});
  }
  render(){
    console.log('App render');
    return (
      <div>
        <Counter number={this.state.count.get('number')}/>
        <button onClick={()=>this.add(1)}>+1</button>
        <button onClick={()=>this.add(0)}>+0</button>
      </div>
    )
  }
}
class Counter extends PureComponent{
  render(){
    console.log('Counter render');
    return (
     <p>{this.props.number}</p>
    )
  }
}

// PureComponent 优化
import React from 'react';
import { Map,is } from "immutable";

export class PureComponent extends React.Component{
    shouldComponentUpdate(nextProps,nextState){
        return !shallowEqual(this.props,nextProps)||!shallowEqual(this.state,nextState)
    }
}
export function memo(OldComponent){
    return class extends PureComponent{
      render(){
        return <OldComponent {...this.props}/>
      }
}
}
export function shallowEqual(obj1,obj2){
    if(obj1 === obj2)
        return true;
    if(typeof obj1 !== 'object' || obj1 ===null || typeof obj2 !== 'object' || obj2 ===null){
        return false;
    }    
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);
    if(keys1.length !== keys2.length){
        return false;
    }
    for(let key of keys1){
       if (!obj2.hasOwnProperty(key) || !is(obj1[key],obj2[key])) {
            return false;
        }
    }
    return true;
}
```
## redux 优化
- `reselect` 缓计算属性,类比 vue 里面的`computer`
- `createSelector` 只要监控`filterSelector`的返回值有变化就会触发重新更新有返回值,否则就不会有返回值
```js
import {createStore} from 'redux';
import {createSelector} from 'reselect';
let initilState = {
    count: {number: 0, l:'1'},
    todos: [{text:'没完成',completed:false},{text:'没完了',completed:true}],
}
const reducer = (state=initilState,action) => {
    switch(action.type){
        case 'ADD':
            return {...state,count:{...state.count,number:state.count.number+1}}
        default: 
        return state; 
    }
}

let store = createStore(reducer);
const todosSelector = (state) => {
    return state.todos;
}
const filterSelector = (state) => {
    return state.count.l;
}

const visibleTodosSelector = createSelector(
    [todosSelector, filterSelector],
    (todos,filter)=>{
        console.log('重新计算 visibleTodos', todos, filter)
        return todos;
    }
)
const render = () => {
    let state = store.getState();// 获取最新状态
    const state1 = visibleTodosSelector(state);
}
render();
store.subscribe(render);
// dispatch 多次 只会触发一个
store.dispatch({type:'ADD'})
store.dispatch({type:'ADD'})
store.dispatch({type:'ADD'})
store.dispatch({type:'ADD'})
store.dispatch({type:'ADD'})
```
- 在 `redux` 中,可以每次`dipstch`都会 触发`subscribe`导致页面更新
```js
// 简易版
function createSelector(selectors,map) {
    let lastValue;
    return function (state) {
        let value = selectors.map(selector => selector(state));
        let result = map(...value);
        if(lastValue === value){
            return lastValue
        }
        lastValue = result
        return lastValue;
    }
}
```
- redux中的用法
- `createSelector`包装了`testRedux1`组件内的state,`filter()`函数是条件如果出发dispatch`filter 函数`的返回值没有变化则`createSelector`函数不会执行
- `testRedux2` 函数没有处理 是正常的 redux 连接,不管那个组件的`dispatch`执行都会出发他的`render`
```js
// testRedux1.ts
import React from 'react';
import {connect} from 'react-redux'
import * as actions from './store/actions/index'
import TestRedux2 from './testRedux2';
import { createSelector } from 'reselect';
const App = (props) => {
    console.log('1号组件', props)
    return  <div>
        1号组件num:={props.number1}
        <button onClick={()=>props.increment(1)}>++++</button>
        <br />
        <TestRedux2 />
    </div>
}
let mapStateToProps = state => {
    return state.counter
}
let filter = state => {
    return state.counter.filter
}
const selectorProps = createSelector([mapStateToProps, filter], (number, nameObj) => {
    console.log('重新计算', number, nameObj)
    return {
        number1:number.number
    }
})

// mapStateToProps 被订阅了 stote.subscribe
// actions 触发的动作 dispatch
export default connect(selectorProps, actions)(App);



// testRedux2.ts
import React from 'react';
import {connect} from 'react-redux'
import * as actions from './store/actions/index'
const App = (props) => {
    console.log('2号组件', props)
    return  <div>
        2号组件num:={props.list}
        <button onClick={()=>props.increment1(1)}>++++</button>
    </div>
}
let mapStateToProps = state => {
    console.log('2号组件 stae', state)
    return state.list
}
export default connect(mapStateToProps, actions)(App);

// reducer1
import * as types from '../action-types';
export default function reducer(state={number:0, filter: 2},action) {
    switch(action.type){
        case types.INCREMENT:
        return {number: state.number+action.payload*2}
        default: 
        return state;
    }
}
// reducer2
import * as types from '../action-types';
export default function reducer(state={list:0},action) {
    switch(action.type){
        case types.INCREMENT1:
        return {list: state.list+action.payload*2}
        default: 
        return state;
    }
}
```

## 时间切片
- 执行大任务的时候
```js
import React from 'react';
import ReactDOM from 'react-dom';

class Home extends React.Component{
    state={
        list: []
    }
    handleClick=()=>{
        // this.oldTimeSlice();
        this.newTimeSlice(1000);
    }
    newTimeSlice = (times)=>{
        let starTime = new Date().getTime();
        // 这两个都可以  requestIdleCallback 在浏览器空闲的时候执行   requestAnimationFrame 在浏览render前执行
        //requestIdleCallback
        requestAnimationFrame(()=>{
            let minus = times>=100?100:times;
            times-=minus;
            this.setState({
                list:[...this.state.list,...new Array(minus).fill(0)]
            },()=>{
                if(times>0){
                    this.newTimeSlice(times);
                    const end =  new Date().getTime()
                    console.log( (end - starTime ) / 1000 + '秒')
                }  
            });
        });
    }

    oldTimeSlice = ()=>{
        let starTime = new Date().getTime();
        this.setState({
            list: new Array(30000).fill(0)
        },()=>{
            const end =  new Date().getTime()
            console.log( (end - starTime ) / 1000 + '秒')
        })
    }
    render(){
        return (
            <ul>
            <input />
            <button onClick={ this.handleClick }>点击</button>
            {
                this.state.list.map((item,index)=>(
                    <li  key={index} >{index+1}</li>
                ))
            }
            </ul>
        )
    }
}

ReactDOM.render(<Home />, document.getElementById('root'));
```