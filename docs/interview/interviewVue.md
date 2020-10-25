# vue 面试题
## vue的双向绑定的原理是什么？
- vue.js是采用数据劫持结合发布者-订阅者模式的方式，通过ES5提供的Object.defineProperty()方法来劫持(监视)各个属性的setter,getter，在数据变动的时发布消息给订阅者，触发相应的监听回调。
- 具体流程
- 1、observer 会监听所有的data变化
- 2、Dep 列表订阅了很多Watcher(涉及到响应式,包括页面渲染),
- 3、数据变化 触发observer 里面的set,他会通知dep 循环遍历watcher执行update 进行数据页面更新 
## vue中计算属性computer和普通属性method的区别是什么？
- computed是响应式的，methods并非响应式。
- 调用方式不一样，computed的定义成员像属性一样访问，methods定义的成员必须以函数形式调用
- computed是带缓存的，只有依赖数据发生改变，才会重新进行计算，而methods里的函数在每次调用时都要执行。
- computed不支持异步，当computed内有异步操作时无效，无法监听数据的变化
- computed中的成员可以只定义一个函数作为只读属性，也可以定义get/set变成可读写属性，这点是methods中的成员做不到的
