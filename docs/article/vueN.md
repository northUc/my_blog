# vue
## 入口文件
- 入口文件 vue干了什么事情
- 1、定义Vue函数
```js
// 为什么Vue用函数 不用class
// 1、用es5的函数放原型上挂载方法很方便 class不大好实现
// 2、将每个混入vue原型的方法拆分出来 方便管理,class 的方法都是写在自己内部的
```
- 2、挂载原型方法 通过mixin
- 3、挂载静态方法,通过initGlobalAPI 
## new Vue
```js
new Vue({
  el:'#app',
  render: h => h(Test),
  mounted(){
    console.log(this.message)
  },
  data:{
    message:'hello world'
  }
})
```
- 实际就是执行了this._init方法,_init是原型mixin进来的,
- vm.$options = vue里面的所有参数
- 首先分析data里面的数据,内部会将执行下面的代码,将vm._data=data
- new vue里面的数据是直接赋值data,其他组件情况 都是走getData函数,因为他们返回的都是函数 
```js
vm._data = typeof data === 'function' ?
      getData(data, vm) :
      data || {}
```
- mounted等方法阔以直接拿到data里面的message,实际是通过proxy进行处理的,this.message实际是获取的this._data.message
```js
 proxy(vm, `_data`, key)
```
## $mount
-  1、当没有render函数,通过template转换成render函数,反正最后要获取到render函数在 vm.$options.render能获取到
-  2、创建一个渲染watcher,将当前更新的函数传递进去,页面每次更新的时候 都会执行渲染watcher,所有每次都会更新
```js
updateComponent = () => {
  // _render在new的时候 初始化initrender的时候给原型赋值上去的
  vm._update(vm._render(), hydrating)
}
new Watcher(vm, updateComponent, noop, {
  before() {
    if (vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'beforeUpdate')
    }
  }
}, true /* isRenderWatcher */ )
```
## render
- render函数 就是生成一个vnode,核心还是$createElement
```js
vnode = render.call(vm._renderProxy, vm.$createElement)
```
## virtual DOM
- 就是一个对象,对真是dom元素的一种描述
## createElement
- 上面render第一个参数就是vue实例  第二个参数就是创建vnode
- vm.$createElement 实际 调用的是 createElement函数 经过一系列处理 去生成Vnode
- 生成Vnode 有两种情况 第一个是虚拟dom tag是标签,直接用 VNode 去创建,第二种是组件的情况,用`createComponent`函数去生成
```js
export function _createElement(
  context: Component,
  tag ? : string | Class < Component > | Function | Object,
  data ? : VNodeData,
  children ? : any,
  normalizationType ? : number
){
if (typeof tag === 'string') {
  // 创建的虚拟dom tag 是标签的情况
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // 创建的虚拟dom tag 是组件的情况
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  // 最后返回 vnode
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}

```
## update
- update 调用时机有2个  第一个是首次触发渲染页面,第二个是更新的时候触发更新页面
- update实际调用的patch函数,patch 几个核心的步骤
- 他主要接受2个参数真实的dom和vnode
  - 1、将最真实的dom转换成vnode
  - 2、createElm创建真实的dom
  - 3、createChildren 递归创建子节点
  - 4、insert往父节点内插入dom(第一个父节点就是`#app`)
- 元素就挂上去了

```js
  /**
   * 整个createPatchFunction  就返回了 patch函数
   * oldVnode 表示旧节点 它也可以不存在或者是一个 DOM 对象 是一个真是的dom
   * vnode 表示执行 _render 后返回的 VNode 的节点；
   * hydrating 表示是否是服务端渲染
   * removeOnly 是给 transition-group 用的，之后会介绍 
   * 
   */
  return function patch(oldVnode, vnode, hydrating, removeOnly) {
    // 将最真实的dom转换成vnode
    oldVnode = emptyNodeAt(oldVnode)
 
   // create new node
    createElm(
      vnode,
      insertedVnodeQueue,
      // extremely rare edge case: do not insert if old element is in a
      // leaving transition. Only happens when combining transition +
      // keep-alive + HOCs. (#4590)
      oldElm._leaveCb ? null : parentElm,
      nodeOps.nextSibling(oldElm)
    )
}

  /**
   * 核心创建 dom
   * */ 
  function createElm(
    vnode,
    insertedVnodeQueue,
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
  ) {
    // 这里是创建组件的情况
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }
    // 这里就是创建一个标签
    vnode.elm = vnode.ns ?
        nodeOps.createElementNS(vnode.ns, tag) :
        nodeOps.createElement(tag, vnode)

     // 递归创建子节点
    createChildren(vnode, children, insertedVnodeQueue)
    if (isDef(data)) {
      invokeCreateHooks(vnode, insertedVnodeQueue)
    }
    // 挂载节点
    insert(parentElm, vnode.elm, refElm)
  }
  /**
   * createChildren
   * */ 
  function createChildren(vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      if (process.env.NODE_ENV !== 'production') {
        checkDuplicateKeys(children)
      }
      for (let i = 0; i < children.length; ++i) {
        // 遍历 创建dom
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
    }
  }
  /*
    创建组件走这里
  */
    function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    let i = vnode.data
    if (isDef(i)) {
      const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        // 调用组件的init 钩子 初始化组件
        i(vnode, false /* hydrating */)
      }
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue)
         (parentElm, vnode.elm, refElm)
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
        }
        return true
      }
    }
  }
  /**
   * componentVNodeHooks 往组件内插入的钩子
    init 是初始化组件
    prepatch 是更新组件 传入新老节点(会触发子组件的get)
    insert 是挂载组件
  */ 
var componentVNodeHooks = {
  init: function init (vnode, hydrating) {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      var mountedNode = vnode; // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode);
    } else {
      // 创建组件
      var child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      );
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    }
  },

  prepatch: function prepatch (oldVnode, vnode) {
    var options = vnode.componentOptions;
    var child = vnode.componentInstance = oldVnode.componentInstance;
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    );
  },

  insert: function insert (vnode) {
    var context = vnode.context;
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true;
      callHook(componentInstance, 'mounted');
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance);
      } else {
        activateChildComponent(componentInstance, true /* direct */);
      }
    }
  },

  destroy: function destroy (vnode) {
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy();
      } else {
        deactivateChildComponent(componentInstance, true /* direct */);
      }
    }
  }
};
```
## createComponent
- 之前createElement通过render的参数 创建一个vnode,这里分析组件创建vnode的情况,`vnode = createComponent(tag, data, context, children)`
- createComponent 返回的同样也是一个vnode,他对我们传递的Test组件进行处理,1、通过创建一个构造函数,继承Vue的所有方法，2、往组件内部挂载几个钩子(patch阶段用),3、生成实例化Vnode
```js
import Test from './Test.vue'
import Vue from 'vue'
new Vue({
  el:'#app',
  render(h){
   return h(Test)
  },
  mounted(){
    console.log(this.message)
  },
  data:{
    message:'hello world'
  }
})
// 源码
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return
  }

  const baseCtor = context.$options._base

  // plain options object: turn it into a constructor
  // 通过Vue.extend 将Ctor对象转成成新的 构造器
  // baseCtor.extend 主要创建一个构造函数 继承Vue 合并options 赋值全局的静态方法
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  data = data || {}

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn

  // install component management hooks onto the placeholder node
  // 往组件内挂上钩子,在patch用到 (init prepatch insert destroy)
  // 组件的 children 为空 componentOptions 包括了很多
  installComponentHooks(data)

  // return a placeholder vnode
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )

  return vnode
}
```
## patch
- 之前分析了 普通标签创建,这里分析组件创建的情况
- patch整体流程:createComponent -> 子组件初始化 -> 子组件render -> 子组件patch
- 当组件初始化的时候 他会有一个vm.$vnode 作为占位vnode,指向children,vm._vnode为组件的渲染vnode
- patch会遍历组件,只有有子组件内还有组件,会一直执行createComponent,直到没有的时候,他会执行组件内的insert函数,将当前组件挂载到父级组件上,最终一层一层的网上挂载到body
- 所以组件的插入顺序是先子后父

## 配置合并
- 1、new Vue时候的组件配置合并
  - 这个阶段merge的是Vue上的全局配置,遵循一定的合并策略,不同的配置合并的方法不一样
- 2、组件内的配置合并(比上面快,简单)
  - 组件的合并 在组件的构造函数里面,他把Vue的options和组件内的配置进行合并
- 3、组件生命周期的合并,这里是指注册
  -  生命周期的合并,父 子的生命周期都放到一个数组中(parentVal.concat(childVal)) 返回数组
```js
function mergeHook (
  parentVal: ?Array<Function>,
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
  const res = childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
  return res
    ? dedupeHooks(res)
    : res
}
```
## 生命周期
- init 的时候 会执行  beforeCreate和created
```js
  initLifecycle(vm)
  initEvents(vm)
  initRender(vm)
  callHook(vm, 'beforeCreate')
  initInjections(vm) // resolve injections before data/props
  initState(vm)
  initProvide(vm) // resolve provide after data/props
  callHook(vm, 'created')
```
- 挂载的时候 组件首先执行 beforeMount, 这里的beforeMount就是先父后子
- mounted执行有2个地方
- 第一个是 当前都执行完成,如果是根节点的时候 执行一次
- 第二个是 在patch 过程中,子的生命周期会先插入到队里面,后面才插入父组件,会调用组件的insert钩子,执行mounted生命周期,所以子组件的mounted先执行
```js
// mount的时候
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  // .............
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // 第一个 执行mounted 情况
  // 根节点 $vnode 表示parent
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
// patch的时候  会调用组件的insert钩子 执行mounted 

  insert (vnode: MountedComponentVNode) {
    const { context, componentInstance } = vnode
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true
      // 第二个 执行mounted 情况,子组件挂载到
      callHook(componentInstance, 'mounted')
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance)
      } else {
        activateChildComponent(componentInstance, true /* direct */)
      }
    }
  },
```
- beforeUpdate && updated
- 组件更新的时候 会走`flushSchedulerQueue函数`,首先执行beforeUpdate
- callUpdatedHooks 发现是渲染watcher并且已经mounted过了 才执行updated,他第一次是不会执行的
```js
// 组件mount的时候 会创建一哥watcher
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
// beforeUpdate
flushSchedulerQueue(){
  queue.sort((a, b) => a.id - b.id)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
  }
}

// updated
function callUpdatedHooks (queue) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated')
    }
  }
}
```
- 组件销毁 先执行 beforeDestroy,销魂一系列东西后,再执行 destroyed
## 组件注册,全局注册&&局部注册
- 全局组件注册,同样他会通过基类构造器去创建`this.options._base.extend(definition)`,他会合并到Vue.options中所以全局都能拿到
- 局部组件注册,他也是通过vue.extend 创建的,但是他是合并到当前的options中,只有当前组件才能用
```js
// 用法
Vue.component('app',app)
// 源码注册
export function initAssetRegisters (Vue: GlobalAPI) {
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          definition = this.options._base.extend(definition)
        }
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
// 使用的时候 在 _createElement 函数

export function _createElement (
  // .........
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    // tag 是保留标签
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn)) {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
      // 组件组成 会走这里 
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // 创建组件的vnode
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  }
  // .........
}


export function resolveAsset (
  options: Object,
  type: string,
  id: string,
  warnMissing?: boolean
): any {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  const assets = options[type]
  // check local registration variations first
  if (hasOwn(assets, id)) return assets[id]
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  // fallback to prototype chain
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    )
  }
  return res
}
```
## 异步组件(3中方式)
- 异步组件(工厂函数) 在注册组件的时候 如果传入的是一个对象 他会通过vue.extend进行转换,否则啥都不做直接挂载到options上
- 在创建组件`createComponent`,会执行`resolveAsyncComponent`处理异步组件,`factory(resolve, reject)`去加载数据,他返回的是一个构造器,首次返回的是一个undefined,createComponent 函数返回一个空的vnode 
- 当异步组件的 require 加载成功的时候,会执行 resolve 函数,获取到模块的数据,去创建一个构造器保存起来(factory.resolved中),执行forceRender进行重新渲染,遍历之前保存的所有工厂函数,执行实例的update进行watcher 渲染
- `resolveAsyncComponent`之前返回的是undefined,再次执行的时候 会把之前`factory.resolved`构造函数返回,去生成vnode
```js
// 1、用法
Vue.component('HelloWorld',function(resolve,reject){
  // webpack 会将 require语法 切割成代码块
  require(['./components/xxx'],function(res){
    resolve(res)
  })
})
// 截取的 全局注册组件 isPlainObject(definition)判断第二个参数是不是对象
if (type === 'component' && isPlainObject(definition)) {
  definition.name = definition.name || id
  definition = this.options._base.extend(definition)
}
if (type === 'directive' && typeof definition === 'function') {
  definition = { bind: definition, update: definition }
}
this.options[type + 's'][id] = definition
return definition

// 异步组件核心
function resolveAsyncComponent(){

  
  if (isDef(factory.resolved)) {
    // factory.resolved 在组件下次更新的时候 才能获取到
    return factory.resolved
  }


  // 异步代码加载完成 后会执行这个代码  once只会执行一次
  const resolve = once((res: Object | Class<Component>) => {
    // ensureCtor 获取到模块代码 如果是对象 就用vue.extend去创建构造器 
    factory.resolved = ensureCtor(res, baseCtor)
    // 第二次 执行的时候  sync 为false 走forceRender
    if (!sync) {
      forceRender(true)
    } else {
      owners.length = 0
    }
  })
}

const reject = once(reason => {
    process.env.NODE_ENV !== 'production' && warn(
      `Failed to resolve async component: ${String(factory)}` +
      (reason ? `\nReason: ${reason}` : '')
    )
    if (isDef(factory.errorComp)) {
      factory.error = true
      forceRender(true)
    }
  })
// 去加载异步代码
const res = factory(resolve, reject)


sync = false
// return in case resolved synchronously
// 异步加载 第一次返回的 undefined
return factory.loading
  ? factory.loadingComp
  : factory.resolved


  
function ensureCtor (comp: any, base) {
  if (
    comp.__esModule ||
    (hasSymbol && comp[Symbol.toStringTag] === 'Module')
  ) {
    comp = comp.default
  }
  return isObject(comp)
    ? base.extend(comp)
    : comp
}
// owner 指的是当前组件实例 会存起来
 if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
    // already pending
    factory.owners.push(owner)
  }
// forceRender 遍历数组里面 实例执行$forceUpdate 实际上是进行更新
const forceRender = (renderCompleted: boolean) => {
      for (let i = 0, l = owners.length; i < l; i++) {
        (owners[i]: any).$forceUpdate()
      }
    }

Vue.prototype.$forceUpdate = function () {
  const vm: Component = this
  if (vm._watcher) {
    vm._watcher.update()
  }
}
```
- import 和 上面的require 其实差不多
- 区别在factory返回是否有值,之前返回的是undefined,他去加载数据,现在res返回的是一个promise,下面会执行他的then方法,然后就执行resolve方法 和之前的一样了,下面2点同之前的观点
- 会执行 resolve 函数,获取到模块的数据,去创建一个构造器保存起来(factory.resolved中),遍历之前保存的所有工厂函数,执行实例的update进行watcher 渲染
- `resolveAsyncComponent`之前返回的是undefined,再次执行的时候 会把之前`factory.resolved`构造函数返回,去生成vnode
```js
// 2、用法
// 该import函数 返回一个promise 对象
Vue.component('HelloWorld',()=>import('xxx.vue'))
// 区别
// 去加载异步代码
const res = factory(resolve, reject)

if (isObject(res)) {
  if (isPromise(res)) {
    // () => Promise
    if (isUndef(factory.resolved)) {
      res.then(resolve, reject)
    }
  } else if (isPromise(res.component)) {
    res.component.then(resolve, reject)

    if (isDef(res.error)) {
      factory.errorComp = ensureCtor(res.error, baseCtor)
    }

    if (isDef(res.loading)) {
      factory.loadingComp = ensureCtor(res.loading, baseCtor)
      if (res.delay === 0) {
        factory.loading = true
      } else {
        timerLoading = setTimeout(() => {
          timerLoading = null
          if (isUndef(factory.resolved) && isUndef(factory.error)) {
            factory.loading = true
            forceRender(false)
          }
        }, res.delay || 200)
      }
    }

    if (isDef(res.timeout)) {
      timerTimeout = setTimeout(() => {
        timerTimeout = null
        if (isUndef(factory.resolved)) {
          reject(
            process.env.NODE_ENV !== 'production'
              ? `timeout (${res.timeout}ms)`
              : null
          )
        }
      }, res.timeout)
    }
  }
}
```
- 这里高级组件,他内部会创 拿到component,loading,error组件创建构造器
- 他里面涉及到了4种状态,loading,resolve,reject,timeout状态
```js
// 3、用法
const AsyncComponent = () => ({
  // 需要加载的组件 (应该是一个 `Promise` 对象)
  component: import('./async.vue'),
  // 异步组件加载时使用的组件
  loading: LoadingComp,
  // 加载失败时使用的组件
  error: ErrorComp,
  // 展示加载时组件的延时时间。默认值是 200 (毫秒)
  delay: 200,
  // 如果提供了超时时间且组件加载也超时了，
  // 则使用加载失败时使用的组件。默认值是：`Infinity`
  timeout: 1000
})
Vue.component('HHello',AsyncComponent)


if (isObject(res)) {
  if (isPromise(res)) {
    // () => Promise
    if (isUndef(factory.resolved)) {
      res.then(resolve, reject)
    }
  } else if (isPromise(res.component)) {
    res.component.then(resolve, reject)

    if (isDef(res.error)) {
      factory.errorComp = ensureCtor(res.error, baseCtor)
    }

    if (isDef(res.loading)) {
      factory.loadingComp = ensureCtor(res.loading, baseCtor)
      if (res.delay === 0) {
        factory.loading = true
      } else {
        timerLoading = setTimeout(() => {
          timerLoading = null
          if (isUndef(factory.resolved) && isUndef(factory.error)) {
            factory.loading = true
            forceRender(false)
          }
        }, res.delay || 200)
      }
    }

    if (isDef(res.timeout)) {
      timerTimeout = setTimeout(() => {
        timerTimeout = null
        if (isUndef(factory.resolved)) {
          reject(
            process.env.NODE_ENV !== 'production'
              ? `timeout (${res.timeout}ms)`
              : null
          )
        }
      }, res.timeout)
    }
  }
}
```
## 响应式原理
## 响应式对象
- 核心利用了Object.defineProperty给对象的属性添加getter和setter
- Vue会把props，data等变成响应式对象，在创建过程中,发现子属性也为对象则递归把该对象变成响应式
## 依赖收集
- 依赖收集就是订阅数据变化的watcher的收集
- 依赖收集的目的为了当这个响应式数据变化,触发他们的setter的时候,能知道应该通知哪些订阅者去做相应的逻辑处理
## 派发更新
- 派发更新就是当数据发生改变以后,通知所有订阅了这个数据变化的watcher执行update
- 派发更新的过程中会把所有要执行的update的watcher推入到队列中,在nextTic后执行
## nextTick
- 异步渲染,vue组件都是通过他进行异步渲染的
- nextTick 是把要执行的任务推入到队列中,在下一个任务中同步执行
- 数据变化后触发渲染watcher的update,但是watcher是在nextTick之后完成的,所以重新渲染是异步的
- $nextTick函数如果放在数据变化之前执行,他的值还是以前老的值,因为nextTick里面他把异步的数据都push到数组中,先push的先执行
```js

console.log('sync')
// 1、用法
this.$nextTick(()=>{
  console.log('xxx')
})
// 2、用法
this.$nextTick().then(()=>{
  console.log('xxx')
})


// 注意点

data(){
  return{
    msg:'hello'
  }
}
methods:{
  this.$nextTick(()=>{
    console.log(this.$refs.msg.innerText)//hello
  })
  this.msg = 'xxx'
  console.log(this.$refs.msg.innerText)//hello
}
```
## 不能检测到的变化
- 响应式数据中对于对象新增删除属性以及数组的下标访问修改和添加数据等变化观察不到
- 通过Vue.set以及数组的api阔以解决这些问题
- 用Vue.set处理或者重写数组的api,本质上手动触发依赖更新的派发
- Vue.del 删除 也是大同小异
```js
data(){
  return{
    msg:{
      a:'hello'
    },
    items:[1,2]
  }
}
methods:{
  change(){
    this.items[1] = 3
    // Vue.set(this.items,1,3)
  },
  add(){
    this.mag.b = 'xxx'
    // Vue.set(this.msg,'b','bb')
    this.items[2] = 4
    this.items.push(4)
  }
}
```

## Vue.set
- 本质也是 通过defineReactive触发依赖,`ob.dep.notify()`派发
```js
export function set (target: Array<any> | Object, key: any, val: any): any {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  if (!ob) {
    target[key] = val
    return val
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}
```
## 计算属性 
- 本质就是创建一个watcher computed watcher
- 入口在 初始化的时候 执行 initComputed 做了2件事
  - 第一 是返回的另一个函数用来收集依赖和求值(在render取值的时候会触发这个函数)
  - 第二 是创建 computed watcher,这里实例化的时候 最后this.value为空不会立即获取值(其他情况的watcher实例化this.value直接获取get值)
- render取值 会执行之前那个函数,第一个他会把当前watcher添加到dep依赖中,第二个会执行get,执行computed函数,同时(lazy改为false)
- 由于computed会依赖其他响应式数据,取值的时候会触发update,进行异步更新,此时会执行,由于lazy为false,其他数据变化的时候 computed watcher 在更新的时候 跟着队列遍历更新了
```js
function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = vm._computedWatchers = Object.create(null)

  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }
    // 检验 key 不能存在data或者props中
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}


export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  const shouldCache = !isServerRendering()
  // computed 是一个函数的情况
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef)
    sharedPropertyDefinition.set = noop
  } else {
  // computed 是一个对象 要有get  
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
// 返回的computedGetter 在computed watch创建的过程中 不会立马对他求值
// 在访问取值的时候 会访问这个函数
function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        // 求值
        watcher.evaluate()
      }
      if (Dep.target) {
        // 收集watcher
        watcher.depend()
      }
      return watcher.value
    }
  }
}
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

  get () {
    // 这里会把watcher放到dep列表中
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }

// computed Watcher
// lazy 为true代表的 computed Watcher
export default class Watcher {
  // .....
    this.lazy = !!options.lazy

    this.value = this.lazy
      ? undefined
        : this.get()
        
}

```
## 侦听属性
- 他本质是一个user watcher
- 他主要靠$watch处理,会实例化Watcher 传入参数
- Immediate为true会立即执行watcher实例一次
- sync 同步执行 不会放到dep列表中,等待异步更新,
- deep 会深度遍历 触发他的get 进行依赖收集
- 将watch里面的配置(对象或者函数)进行处理,通过$watch进行创建,$watch挂载在原型上的
- 如果传入的是对象他会递归重新处理,接着用实例化一个Watcher,这个时候会对get进行一次求值,会把当前watcher放到dep中,一但数据变化 就会执行watcher的update更新数据
- 执行的时候 如果设置了sync就执行同步,默认情况就是异步
```js
// watch 常用例子
watch:{
  p1(newVal){
    console.log('p1',newVal)
  },
  p2:{
    immediate:true,
    handler(newVal){
      console.log('p2',newVal)
    }
  },
  p3:{
    deep:true,
    sync:true,
    handler(newVal){
      console.log('p3',newVal.a.b)
    }
  }
}
// 原理
function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}
function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}

Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    const vm: Component = this
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    options.user = true
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      try {
        cb.call(vm, watcher.value)
      } catch (error) {
        handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`)
      }
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
// watch 对象下的key 用这个函数进行解析成对象的
  const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`)
  export function parsePath (path: string): any {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
```
## computed和watcher 总结
- 计算属性合适用在模板渲染中,某个值是依赖了其他的响应式对象甚至是计算属性计算而来
- 而侦听属性何用与观测某个值的变化去实现完成一段复杂的业务逻辑
## 组件更新
- 组件跟更走的_update 方法,而实际起作用的是 patch 函数
### 父节点修改参数传递给子节点,子节点如何更新
- 当父节点数据更新的时候,在DOMDiff发生的时候,如果他们的`children`不一样,此时会调用新组件的`prepatch`,
- 这个钩子将更新子节点接收的参数,一旦子节点里面的数据重新赋值就会触发子节点的get,接着会进行组件更新
### 节点比较
- 1、新旧节点不相同的情况 有三步
  - 1、创建新的节点
  - 2、更新parent占位符节点 指向新的节点
  - 3、删除旧的节点
- 2、新旧节点相同的情况
  - 1、查看新节点 是有文本没有直接替换
  - 2、查看新老节点是否都有 children 有的情况最复杂(下面说)
  - 3、如果新的有 children,清空老节点,插入新节点。如果老的有则删除老的,如果新老都没有 children,则把老的text设置为空
- 3、children 比较(DOM DIFF)
  - 1、从新老节点的开头 一一比较
  - 2、从新老节点的尾巴 一一比较
  - 3、新的 abcd 老的dcba 用新的头和老的尾巴开始比较
    - 这里需要插入 将老节点的头往后面老节点尾巴一步步插入
  - 4、新的 abcd 老的dabc 用新的尾巴和老的头开始比较
    - 同样需要插入操作 将老的尾往前面一步步插入
  - 5、
```js
function patch (oldVnode, vnode, hydrating, removeOnly) {
   
    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true
      createElm(vnode, insertedVnodeQueue)
    } else {
      // isRealElement 查看是否是原生节点
      const isRealElement = isDef(oldVnode.nodeType)
      // sameVnode key相同的情况下
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // 新旧节点相同的情况
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
      } else {
        // 新旧节点不相同的情况 下面有3个步骤

        // create new node
        // 1、创建新的节点
        createElm(
          vnode,
          insertedVnodeQueue,
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        )

        // 2、更新parent占位符节点 指向新的节点
        if (isDef(vnode.parent)) {
          let ancestor = vnode.parent
          const patchable = isPatchable(vnode)
          while (ancestor) {
            for (let i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor)
            }
            // 占位符节点 引用指向 我们跟新的节点
            ancestor.elm = vnode.elm
            ancestor = ancestor.parent
          }
        }
        // 3、删除旧的节点
        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode)
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }

// 新旧节点相同的情况
  function patchVnode (
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    if (oldVnode === vnode) {
      return
    }
    const elm = vnode.elm = oldVnode.elm
    let i
    const data = vnode.data
    // updateChildComponent 触发子组件 prepatch 是组件内的钩子 他会调用 updateChildComponent 对子组件进行更新
    // 当父组件数据变化(修改子组件内的数据),会触发prepatch 钩子,执行 updateChildComponent函数,拿到新的props,更新组件内的数据,会触发get函数,导致子组件更新渲染
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode)
    }

    const oldCh = oldVnode.children
    const ch = vnode.children
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    // 1、查看新节点 是有文本
    if (isUndef(vnode.text)) {
      // 2、查看 是否有children(核心)
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) {
        // 3、只有新的有 children 清空老节点 新节点做一个插入
        if (process.env.NODE_ENV !== 'production') {
          checkDuplicateKeys(ch)
        }
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        // 4、只有老节点有 children 删除老的即可 
        removeVnodes(oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        // 5、新老节点都没有 children的时候 把老的text设置为空
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
    // 1、查看新节点 是没有文本,直接进行替换
      nodeOps.setTextContent(elm, vnode.text)
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
    }
  }
  // DOM diff
  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly

    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(newCh)
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
  }
```
## props
### props 的规范规程
- 在合并配置的时候 会处理 props传值,最终处理成对象的形式,每个对象都会有一个type属性
- 对`nick-name` 会转换成`nickName`形式
- 最终处理好的对象 会挂载到options.props上
- 注意default 不能直接返回对象,如果是对象必须要用函数包裹
- 如果default 返回的函数,组件跟新 不会重新计算这个默认值的(内部优化掉)
```js
function normalizeProps (options: Object, vm: ?Component) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}
```
### props 的初始化过程
- 在initState阶段
  - 1、对每个prop 校验求值
  - 2、props 做成响应式
  - 3、对props做代理 
```js
function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false)
  }
  for (const key in propsOptions) {
    keys.push(key)
    // 1、对每个prop 校验求值
    const value = validateProp(key, propsOptions, propsData, vm)
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      const hyphenatedKey = hyphenate(key)
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        )
      }
      defineReactive(props, key, value, () => {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          )
        }
      })
    } else {
      // 2、props 做成响应式
      defineReactive(props, key, value)
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      // 3、对props做代理 
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}
```
### props 的更新过程
- 子组件更新,肯定是父组件数据变化,会执行patch函数,patch 过程中会比较2个child组件的问题,会执行patchVnode函数
- patchVnode 他首先会执行 组件的prepatch钩子函数,他会子更新组件
### 子组件重新渲染的情况 
- 当父组件修改传递值的时候 会触发`prop`的`setter`,这个时候子组件会重新渲染
- 当对象`prop`属性内部发生变化,这个时候没有触发子组件的,子组件访问对象prop 会触发`getter`这个时候会把子组件`render watcher`收集到依赖中,然后当父组件更新prop某个属性的时候 会触发`setter`,就会通知子组件的`render watcher`的`update`,进而触发子组件的重新渲染。 
```js
// 两种写法
props:['name','nick-name'],
props:{
  age:Number,
  sex:{
    type:String,
    default:'xxx',
    validator(value){
      return value
    }
  }
}
```

## event
- 第一个模板编译,我们写的vue语法他会通过ast语法解析,将标签上的属性解析成对象的形式存着
- 组件阔以定义原生事件和自定义事件,原生dom只能定义原生dom事件
- 标签内`clickHandle($event)`这个参数实际是源码里面传递过来的,我们传递的方法,会在外面包裹一个函数
- 修饰符 实际会转换成特定的代码
```js
/* 
  clickHandle($event)例子
  <button @click='clickHandle($event)'>+</button>
  源码部分
  `function($event){${code}${handlerCode}}`
*/

// 修饰符
const modifierCode: { [key: string]: string } = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: genGuard(`$event.target !== $event.currentTarget`),
  ctrl: genGuard(`!$event.ctrlKey`),
  shift: genGuard(`!$event.shiftKey`),
  alt: genGuard(`!$event.altKey`),
  meta: genGuard(`!$event.metaKey`),
  left: genGuard(`'button' in $event && $event.button !== 0`),
  middle: genGuard(`'button' in $event && $event.button !== 1`),
  right: genGuard(`'button' in $event && $event.button !== 2`)
}
```
### 编译
- 编译时候 会将一直指令解析成对象
- @click vue自带的@ 会编译成 on 对象
- @click.native 原生的会被变异成 nativeOn 对象
```js
/*
  // 子
  <button @click='clickHandler($event)'>+</button>
  methods:{
    clickHandler(e){
      console.log('e',e)
    }
  }
  // 父
  <button @select='selectHandler' @click.native.prevent='clickHandler'></button>
  methods:{
    selectHandler(){
      console.log('selectHandler')
    }
    clickHandler(){
      console.log('clickHandler')
    }
  }
*/
// 编译
// 父
{
  on:{"select":selectHandler},
  nativeOn:{
    "click":function($event){
      $event.preventDefault();
      return clickHandler($event)
    }
  }
}
// 子
{
  on:{
    "click":function($event){
      clickHandler($event)
    }
  }
}
```
### 运行时
- patch 在渲染时候,真正将vnode节点patch到节点中,在执行patch的时候会执行很多钩子,(vnode转成真实的dom,标签上的一些属性 events 等就是在patch 执行钩子关联上的)


```js
// events 核心的文件 返回这么个对象
export default {
  create: updateDOMListeners,
  update: updateDOMListeners
}

// 在处理钩子的时候,他会遍历我们的hooks
// 首先 第一步  他根据返回的modules,在每个hooks要执行的函数 保存起来
// 第二步 create在节点创建的时候(创建元素或者创建组件) 会调用他
// 第三步 update在更新节点的时候(patchVnode) 执行组件的update钩子(之前讲过,更新的时候组件的props变化)

const hooks = ['create', 'activate', 'update', 'remove', 'destroy']
export function createPatchFunction (backend) {
  let i, j
  const cbs = {}

  const { modules, nodeOps } = backend

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }
  return function patch()=>{}
}

// hooks在这个函数调用的
 function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyNode, vnode)
    }
    i = vnode.data.hook // Reuse variable
    if (isDef(i)) {
      if (isDef(i.create)) i.create(emptyNode, vnode)
      if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
    }
  }
// 事件 点击执行  他执行的是 里面的函数 如果只有一个函数 直接执行,若多个就遍历数组
export function createFnInvoker (fns: Function | Array<Function>, vm: ?Component): Function {
  function invoker () {
    const fns = invoker.fns
    if (Array.isArray(fns)) {
      const cloned = fns.slice()
      for (let i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, arguments, vm, `v-on handler`)
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, `v-on handler`)
    }
  }
  invoker.fns = fns
  return invoker
}
```
### event总结
- event 在编译阶段生成相关的data,对于DOM事件在patch过程中创建阶段和更新阶段生成DOM事件;对于自定义事件,会在组件初始化阶段通过events创建
- 原生DOM事件和自定义事件主要的区别在于添加和删除的事件方式不一样,并且自动定义事件派发是往当前实例上派发,但是可以利用在父组件环境定义回调函数来实现父子组件的通讯

## slot


## vue-router
### router注册
- `Vue.use(Router)` vue.use是注册插件,默认每个插件都有一个install方法,vue.use 会默认执行插件的install方法,将Vue传入过去
- install 主要在每个组件的 
- beforeCreate 周期 把this和传入的router对象保存
- 响应式处理`$router`和`$route`
- 全局注册View和Link组件
```js
export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
```
### VueRouter 实例化做了那些事
- VueRouter 实例化的时候 主要接受routes路由配置
- 核心处理 createMatcher 初始化就是根据路由配置描述创建映射表,包括路径、名称到路由record的映射关系
- match会根据传入的位子和路径计算出新的位子,并匹配到对应的路由record,然后根据新的位子和record创建新的路径并返回
- addRoutes 就是动态添加路由,往映射表里面
```js
const router = new Router({
    base: settings.routeBase || '/',
    mode: settings.routeMode || 'history',
    routes:routes
});

export function createMatcher (
  routes: Array<RouteConfig>,
  router: VueRouter
): Matcher {
  // createRouteMap 处理我们传递的routes 生成一个路由映射表
  const { pathList, pathMap, nameMap } = createRouteMap(routes)
  // 动态往添加route映射 在已有的基础上 进行修改 添加
  function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap)
  }
  // 匹配路径 映射到路由的
  function match( raw: RawLocation,
    currentRoute?: Route,
    redirectedFrom?: Location
  ): Route {
    // 根据传入的路径和当前的路径 返回一个新的路径
    const location = normalizeLocation(raw, currentRoute, false, router)
    const { name } = location
    // 用name 去 nameMap映射表里面查找record 找到了就创建route 否则就返回null
    if(name){
      // ......
    }else{
      // ......
    }
    return _createRoute(........., location)
  }
// 。。。。。。。。
  return{
    addRoutes,
    match
  }
}

// 生成rout映射表
export function createRouteMap (
  routes: Array<RouteConfig>,
  oldPathList?: Array<string>,
  oldPathMap?: Dictionary<RouteRecord>,
  oldNameMap?: Dictionary<RouteRecord>
): {
  pathList: Array<string>,
  pathMap: Dictionary<RouteRecord>,
  nameMap: Dictionary<RouteRecord>
} {
  const pathList: Array<string> = oldPathList || []
  const pathMap: Dictionary<RouteRecord> = oldPathMap || Object.create(null)
  const nameMap: Dictionary<RouteRecord> = oldNameMap || Object.create(null)

  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route)
  })

  if (process.env.NODE_ENV === 'development') {
    const found = pathList
      .filter(path => path && path.charAt(0) !== '*' && path.charAt(0) !== '/')
    if (found.length > 0) {
      const pathNames = found.map(path => `- ${path}`).join('\n')
      warn(false, `Non-nested routes must include a leading slash character. Fix the following routes: \n${pathNames}`)
    }
  }

  return {
    pathList,
    pathMap,
    nameMap
  }
}
```
### 路径切换-生命周期
- 在mixin beforeCreate 的时候 会执行 `this._router.init(this)` init函数会进行路由的跳转,核心的跳转逻辑就是 transitionTo
- queue 收集的route的各种钩子,runQueue 会依次执行queue数组的钩子
```js
/*
  1、组件离开守卫 先子后父 beforeRouteLeave
  2、调用全局的 beforeEach
  3、组件的更新 先父后子 beforeRouteUpdate
  4、路由的配置里面的 beforeEnter
  5、解析异步组件
  6、进入组件的钩子 beforeRouteEnter 
  7、调用全局的 beforeResolve
  8、导航更新
  9、调用全局的 afterEach
  dom更新
  10、组件更新 执行 beforeRouteEnter的回调函数  将组件实例作为回调的参数传入
*/
```
```js
 
export default class VueRouter {
  static install: () => void
  static version: string
  static isNavigationFailure: Function
  static NavigationFailureType: any

  constructor (options: RouterOptions = {}) {
  this.matcher = createMatcher(options.routes || [], this)
    
  init (app: any /* Vue component instance */) {
    this.apps.push(app)
    this.app = app
    const history = this.history
    if (history instanceof HTML5History || history instanceof HashHistory) {
      const handleInitialScroll = routeOrError => {
        const from = history.current
        const expectScroll = this.options.scrollBehavior
        const supportsScroll = supportsPushState && expectScroll

        if (supportsScroll && 'fullPath' in routeOrError) {
          handleScroll(this, routeOrError, from, false)
        }
      }
      const setupListeners = routeOrError => {
        history.setupListeners()
        handleInitialScroll(routeOrError)
      }
      // 路径切换的入口
      history.transitionTo(
        history.getCurrentLocation(),
        setupListeners,
        setupListeners
      )
    }

    history.listen(route => {
      this.apps.forEach(app => {
        app._route = route
      })
    })
  }

  beforeEach (fn: Function): Function {
    return registerHook(this.beforeHooks, fn)
  }

  beforeResolve (fn: Function): Function {
    return registerHook(this.resolveHooks, fn)
  }

  afterEach (fn: Function): Function {
    return registerHook(this.afterHooks, fn)
  }

  onReady (cb: Function, errorCb?: Function) {
    this.history.onReady(cb, errorCb)
  }

  onError (errorCb: Function) {
    this.history.onError(errorCb)
  }
  // 路径切换的入口
  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    // $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        this.history.push(location, resolve, reject)
      })
    } else {
      this.history.push(location, onComplete, onAbort)
    }
  }
  // 路径切换的入口
  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    // $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        this.history.replace(location, resolve, reject)
      })
    } else {
      this.history.replace(location, onComplete, onAbort)
    }
  }
}

// transitionTo
  transitionTo (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    let route
    // catch redirect option https://github.com/vuejs/vue-router/issues/3201
      route = this.router.match(location, this.current)
    // ...........  
    const prev = this.current
    this.confirmTransition(
      route,
      () => {
        // 8、导航更新
        this.updateRoute(route)
        onComplete && onComplete(route)
        this.ensureURL()
        // 9、调用全局的 afterEach
        this.router.afterHooks.forEach(hook => {
          hook && hook(route, prev)
        })

        // fire ready cbs once
        if (!this.ready) {
          this.ready = true
          this.readyCbs.forEach(cb => {
            cb(route)
          })
        }
      },
      err => {
          // .......
      }
    )
// confirmTransition
confirmTransition (route: Route, onComplete: Function, onAbort?: Function) {
   const queue: Array<?NavigationGuard> = [].concat(
      // in-component leave guards
      // 1、组件离开守卫 先子后父 beforeRouteLeave
      extractLeaveGuards(deactivated),
      // global before hooks
      // 2、调用全局的 beforeEach
      this.router.beforeHooks,
      // in-component update hooks
      // 3、组件的更新 先父后子 beforeRouteUpdate
      extractUpdateHooks(updated),
      // in-config enter guards
      // 4、路由的配置里面的 beforeEnter
      activated.map(m => m.beforeEnter),
      // async components
      // 5、解析异步组件
      resolveAsyncComponents(activated)
    )
    runQueue(queue, iterator, () => {
      // wait until async components are resolved before
      // extracting in-component enter guards
      // 6、进入组件的钩子 beforeRouteEnter 
      const enterGuards = extractEnterGuards(activated)
      // 7、调用全局的 beforeResolve
      const queue = enterGuards.concat(this.router.resolveHooks)
      runQueue(queue, iterator, () => {
        if (this.pending !== route) {
          return abort(createNavigationCancelledError(current, route))
        }
        this.pending = null
        // 8、导航更新
        onComplete(route)
        if (this.router.app) {
          this.router.app.$nextTick(() => {
            handleRouteEntered(route)
          })
        }
      })
    })
}
// runQueue
export function runQueue (queue: Array<?NavigationGuard>, fn: Function, cb: Function) {
  const step = index => {
    if (index >= queue.length) {
      cb()
    } else {
      if (queue[index]) {
        fn(queue[index], () => {
          step(index + 1)
        })
      } else {
        step(index + 1)
      }
    }
  }
  step(0)
}
```
## store
- vue状态集中管理
- vue和单纯的全局对象 区别
  - vue的状态是响应式
  - 不能直接store的状态,必须要通过mutation处理,便于管理
- 总结 store 就是一个数据仓库,为了更方便的管理仓库,我们把一个大的store拆成一些modules,整个modules是一个
树型结构,每个module又分别定义了state,getters,mutations,actions,我们也通过递归遍历模块的方式都完成了他们的初始化