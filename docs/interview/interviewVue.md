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
## vue-router
### hash
- 1、hash模式 默认是hash模式，基于浏览器history api，使用window.addEventListener('hashchange',callback,false)对浏览器地址进行监听。
- 2、当调用push时，把新路由添加到浏览器访问历史的栈顶。
- 3、使用replace时，把浏览器访问历史的栈顶路由替换成新路由 hash的值等于url中#及其以后的内容。
- 4、浏览器是根据hash值的变化，将页面加载到相应的DOM位置。锚点变化只是浏览器的行为，每次锚点变化后依然会在浏览器中留下一条历史记录，可以通过浏览器的后退按钮回到上一个位置
### history
- 1、History history模式，基于浏览器history api ，使用window.onpopstate 对浏览器地址进行监听。
- 2、对浏览器history api中的pushState()、replaceState()进行封装，当方法调用，会对浏览器的历史栈进行修改。
- 3、从而实现URL的跳转而无需加载页面 但是他的问题在于当刷新页面的时候会走后端路由，所以需要服务端的辅助来兜底，避免URL无法匹配到资源时能返回页面
### abstract 
- 不涉及和浏览器地址的相关记录。流程跟hash模式一样，通过数组维护模拟浏览器的历史记录栈 服务端下使用。使用一个不依赖于浏览器的浏览器历史虚拟管理后台
### 总结 
- hash模式和history模式都是通过window.addEvevtListenter()方法监听 hashchange和popState进行相应路由的操作。可以通过back、foward、go等方法访问浏览器的历史记录栈，进行各种跳转
- 而abstract模式是自己维护一个模拟的浏览器历史记录栈的数组
