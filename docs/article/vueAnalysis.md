# vue

- 准备工作 clone vue@2.6.10
[[toc]]
## 数据驱动

- 流程图
  <img :src="$withBase('/img/new-vue.png')" >

- 流程图 展示了从`new Vue`到 DOM 渲染的各个核心环节，下面就根据流程图探究中间的环节。原则看主线，次线自己想办法屏蔽(否则研究不了)
- Vue 是在`src/core/instance/index.js`中创建的,Vue 是一个函数,里面调用`this._init`方法，传递了`options`。同时还用执行了`initMixin,stateMixin,eventsMixin,lifecycleMixin,renderMixin`等方法，将 Vue 作为参数传递进去，主要是为 Vue 的原型拓展了一系列方法。`initMixin`主要给原型挂载了`_init`初始方法。`stateMixin`主要$data、$props、$set、$delete、\$watch 等。`renderMixin`主要是\$nextTick、\_render。`eventsMixin`主要就是监听类的$on、$once、$off、$emit。`lifecycleMixin`主要是\_update、$forceUpdate、$destroy。他们都是 Vue 内部使用的，挂到原型上的方法，正如名字都在 mixin 混合。这些方法后面会讲到，先放到一旁，跟着主线走，看`Vue.prototype._init`，在`src/core/instance/init.js`里面。

### \_init

- `_init`主要方法里面主要是一些初始化,生命周期、事件、渲染、触发`beforeCreate`钩子、`provide,reject`、initState 里面包括常用的`props,methods,data,computed,watch`等等,`beforeCreate&&created`就是在这儿执行的,最后判断`vm.$options.el`,如果有 el 配置就调`$mount`方法。这就是 new Vue 干的事情

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

### \$mount

- `_init`之后就是`$mount`挂载。`$mount`在不同的版本都有定义,如 `src/platform/web/entry-runtime-with-compiler.js、src/platform/web/runtime/index.js、src/platform/weex/runtime/index.js`,我们主要看 compiler 完整版本。`Vue.prototype.$mount`是运行版本定义的被 mount 缓存了,后面的才是完整版本被调用的。同样`$mount`也是通过原型，挂载到 Vue 原型上。该方法上来就是判断`el === document.body || el === document.documentElement` el 不能挂载到`body&html`上。接着就是判断 render 还是 template 渲染，如果没有定义`render`,往下走，则会将`template`通过`compileToFunctions`(这个核心方法后面介绍)转换成 render。最后都会走`mount.call(this, el, hydrating)`,而此时的 mount 调用的是运行版本的\$mount 定义在`src/platform/web/runtime/index.js`

```js
Vue.prototype.$mount = function(
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```

- `$mount`主要接收 2 个参数,第一个是 el,即挂载的元素。hydrating 是区别服务端和浏览器环境的,浏览器就不需要传递这个参数。`mountComponent`定义在`core/instance/lifecycle`,该方法前面做了几个判断，注意`if(vm.$options.template && vm.$options.template.charAt(0) !== '#')`,他会报警告,也就是在安装运行版本使用 template 渲染就会出现的。接着就是添加一个观察者 Wather(具体的后面讲),updateComponent 就是 Wather 的回调函数，vm.\_render 会生产虚拟 dom,然后在调用 vm.\_update 进行更新。最后判断`vm.$vnode == null`时候，设置`vm._isMounted = true`,接着就执行了`mounted`钩子

```js
updateComponent = () => {
  // _render在new的时候 初始化initrender的时候给原型赋值上去的
  vm._update(vm._render(), hydrating)
}
new Watcher(
  vm,
  updateComponent,
  noop,
  {
    before() {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  },
  true /* isRenderWatcher */
)
if (vm.$vnode == null) {
  vm._isMounted = true
  callHook(vm, 'mounted')
}
```

### render

- render 用法

```js
render: function (createElement) {
  return createElement('div', {
     attrs: {
        id: 'app'
      },
  }, this.message)
}
```

- 上面讲到挂载,之后就是等着更新 调用`_render`进行渲染。`_render`定义在`src/core/instance/render.js`，他作用就是将实例渲染成一个虚拟 dom。
  `createElement`接收 2 个参数第一个是标签,第二个是属性。`_render`里面主要就是一个`vnode = render.call(vm._renderProxy, vm.$createElement)`执行 render 返回一个虚拟 dom。`$createElement`调的就是`createElement`,他会创建一个 virtual Dom

### createElement

- `createElement`方法就是用来创建 virtual Dom 的，他定义在`src/core/vdom/create-elemenet.js`,他里面实例调用的是`_createElement`,`_createElement`返回值就是 Vnode。他接受 5 个参数 context 表示 Vnode 的上下文，tag 是标签也可以是组件和函数，data 是 Vnode 里面的数据，children 是他下面的子节点，normalizationType 表示子节点的规范。children 会通过`normalizeChildren&&simpleNormalizeChildren`做处理(具体逻辑还没分析出来)，主要是对children做规范。之后就是 创建VNode(这里暂略)

### Virtual Dom
- Virtual Dom实质就是对针对dom的描述，他定义在`src/core/vdom/vnode.js`里

### update
- 当创建好VNode，接着就是update,他的作用就是将之前创建的VNode渲染成真实DOM,有2个地方用到它，第一个是首次加载，第二个是数据更新的时候。他定义在`src/core/instance/lifecycle.js`,他在init的时候就被挂载到Vue的原型上了。



### Virtual DOM

## 构建对应的版本

- package.json 里面配置了一堆 script 脚本 其实看关键字段 所有的 build 配置文件都在`scrpits/config`里面。这个文件里面有个 builds,能找到很多版本，format 里面标记了各个版本，有(es)es6 模块、(cjs)commonjs 模块以及(umd)浏览器执行的闭包模式,中口号内即为 format。

```js
  'web-runtime-cjs-dev': {
    //入口
    entry: resolve('web/entry-runtime.js'),
    //目标 根据入口文件 最终编译打包生成的文件目录
    dest: resolve('dist/vue.runtime.common.dev.js'),
    //格式 cjs commonjs模块
    format: 'cjs',
    env: 'development',
    banner
  },
    // 分析完整版
  'web-full-esm': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.esm.js'),
    format: 'es',
    alias: { he: './entity-decoder' },
    banner
  },
  // runtime-only build (Browser)
  'web-runtime-dev': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.js'),
    format: 'umd',
    env: 'development',
    banner
  },

```

- 官网上也写了对应的模块，但是这里要注意 runtime 和 runtime-with-compiler。一个是运行版本后者是完整版,完整版包括运行版和编译器,而编译器的作用是用来将模板字符串编译成为 JavaScript 渲染函数的代码。
- 说简单点就是，main.js 里面可以用 render 渲染组件也可以用 template 模板渲染,若要用到 template 就需要编译器来处理，否则就回报错。我们通常 npm run vue 下载 vue 的时候 vue 文件的 package.json 的入口文件对应的版本是运行版本,如果我们要在 main.js 使用 template 就需要更改配置。默认是对应运行版本,webpack 可以通过 resolve 对象里面的 alias 进行配置 `{'vue$': 'vue/dist/vue.esm.js'}` 。`vue//dist`这个目录存放着所有的 vue 构建版本,需要知道的是 runtime 比起 runtime-with-compiler 体积要小 30%。此外说一下 vue-cli，他默认配置了 `{'vue$': 'vue/dist/vue.esm.js'}` 路径,当我们引入 vue 的时候,不是去找 package.js 里面的入口,而是找配置的这个文件路径。当然以下的所有分析都是针对 runtime-with-compiler 版本

## new Vue

- new Vue 针对下面的小 dome 通过源码 解剖一下做了什么事情

```js
{
  {
    message
  }
}
export default {
  data() {
    return {
      message: 'hello word'
    }
  }
}
```

- new Vue 干的事情，针对 runtime-with-compiler 版本。首先找到目录`scrpits/config`,配置文件里找到完整版即 runtime-with-compiler,那么对应的 entry 就是`web/entry-runtime-with-compiler.js`,在这儿文件末尾找到 export default Vue,但是 Vue 又是从`./runtime/index`中导入的。再看`runtime/index`，同样的套路这里也没有直接创建 Vue,这个文件的 Vue 是`core/index`导入进来。打开`core/index`,老套路来了 Vue 又是`./instance/index`导入的，但是要注意的 initGlobalApi(Vue),有东西把 Vue 包裹了,从字面上讲给 vue 初始化了一些全局 api,先将他放下。回来找 Vue 主线,进到`./instance/index`，终于在这儿找到了 Vue 原型了。

```js
function Vue(options) {
  if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
```

- 这里做了判断,`this instanceof Vue`也就是说 必须要用 new 创建 Vue 的实例才行。往后 mixin 很多东西，比如`initMixin,stateMixin,eventsMixin,lifecycMixin,renderMixin`,我们只关心 initMixin 做了什么事情,new Vue 的时候 只触发了`this._init`,而`_init`是通过 initMixin 挂载到 Vue 原型链上的

```js
let uid = 0

export function initMixin(Vue: Class<Component>) {
  Vue.prototype._init = function(options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```

- `instance/init`文件里面给 Vue 原型挂了`_init`,这里有一个`_uid`是在当前文件生成的。`_init`函数里面做了层层判断,vm 当前实例,`vm.options`获取了传递进来的`options`,在往下走,我们可以看到`initLifecycle(vm),initEvents(vm),initState(vm)`这些初始化,最后一步,当 option 传递了 el 的时候才执行\$mount 挂载,整个初始化过程就结束了。到这儿主要做了合并配置，初始化生命周期，初始化事件中心，初始化渲染。下面看看 initState 做了什么

```js
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}
export function proxy(target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function initState(vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe((vm._data = {}), true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

function initData(vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' &&
      warn(
        'data functions should return an object:\n' +
          'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(`Method "${key}" has already been defined as a data property.`, vm)
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' &&
        warn(
          `The data property "${key}" is already declared as a prop. ` +
            `Use prop default value instead.`,
          vm
        )
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  observe(data, true /* asRootData */)
}
```

- 继续跟着主剧情走,看了一圈就`initState`符合,进去看看他做了什么事情。`initState`里面对 options 配置做了系列判断,分别初始化`props,methods,data,computed,watch`。`initData(vm)`方法，这儿就是核心点了,里面告诉我们在`data`里面声明的值为什么能在 this 里拿到,再次之前`vue`用对象的 key 了 3 个判断,防止`methods`和`props`重名,查看 key 是否已经存在了,一但名字相同就会爆警告。一切顺利后就来到`proxy(vm,'_data',key)`,看到这个方法就知道要干什么了,没错就是给当前实例声明一个`_data`,然后将 key 和对应的 value 整合进去,这样`this._data`就能拿到所有 data 里面的

### 总结

- Vue 初始化主要就干了几件事情，合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等等

## 挂载(\$mount)实现

- 还是先看`entry-runtime-with-compiler`入口

```js
// entry-runtime-with-compiler
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function(
  el?: string | Element,
  hydrating?: boolean
): Component {
  // query 将el传递进来的转换成dom
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' &&
      warn(
        `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
      )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // 如果传递的不是render 说明是template 对他进行处理
  if (!options.render) {
    //*********
  }
  return mount.call(this, el, hydrating)
}
```

- `$mount`是从原型上获取的,这里先跳过往后看。`Vue.prototype.$mount`重写了挂载方法,主要就是出路编译,`!options.render`这里做了判断,如果传递的不是 render 说明是 template 对他进行处理,也就是 tempalte 编译处理,这里面比较复杂。

```js
// runtime/index
Vue.prototype.$mount = function(
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```

- 上面代码是运行环境,看`runtime/index`这里在 Vue 原型上写了挂载的方法,最后交给了 mountComponent 进行了处理。

```js
// core/instance/lifecycle
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  if (!vm.$options.render) {
  // 在initState 初始化的时候 options全部挂上去了
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }
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
      // _render在new的时候 初始化initrender的时候给原型赋值上去的
      vm._update(vm._render(), hydrating)
    }
  }
```

- 在 initState 初始化的时候 options 全部挂上去了,能取到所有的配置。这里有个很关键的 warn,当`$options.render`没有配置并且配置了`$options.template`(所处的是运行环境)就会警告`You are using the runtime-only ....`。核心的来了 vm.\_render,\_render 就是专门用来渲染的方法,既然他挂载 vm 上肯定是之前初始化的时候处理的。当前有一个 render.js,他是在 new 时候 被初始化执行的文件,在这儿就找到\_render 挂载到原型上了

## render

```js
// instance/render.js

vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

Vue.prototype._render = function(): VNode {
  const vm: Component = this
  const { render, _parentVnode } = vm.$options

  if (_parentVnode) {
    vm.$scopedSlots = normalizeScopedSlots(
      _parentVnode.data.scopedSlots,
      vm.$slots,
      vm.$scopedSlots
    )
  }

  // set parent vnode. this allows render functions to have access
  // to the data on the placeholder node.
  vm.$vnode = _parentVnode
  // render self
  let vnode
  try {
    // There's no need to maintain a stack because all render fns are called
    // separately from one another. Nested component's render fns are called
    // when parent component is patched.
    currentRenderingInstance = vm
    vnode = render.call(vm._renderProxy, vm.$createElement)
  } catch (e) {
    handleError(e, vm, `render`)
    // return error render result,
    // or previous vnode to prevent render error causing blank component
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production' && vm.$options.renderError) {
      try {
        vnode = vm.$options.renderError.call(
          vm._renderProxy,
          vm.$createElement,
          e
        )
      } catch (e) {
        handleError(e, vm, `renderError`)
        vnode = vm._vnode
      }
    } else {
      vnode = vm._vnode
    }
  } finally {
    currentRenderingInstance = null
  }
  // if the returned array contains only a single node, allow it
  if (Array.isArray(vnode) && vnode.length === 1) {
    vnode = vnode[0]
  }
  // return empty vnode in case the render function errored out
  if (!(vnode instanceof VNode)) {
    if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
      warn(
        'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
        vm
      )
    }
    vnode = createEmptyVNode()
  }
  // set parent
  vnode.parent = _parentVnode
  return vnode
}
```

- render 就是在这儿挂到 vue 原型上的,他会返回一个 vnode。options 是在 new 初始化的时候挂载上去的,`render.call(vm._renderProxy, vm.$createElement)`第一个参数是当前实例,第二个才是创建虚拟 dom,\$createElement 函数返回的是`createElement(vm, a, b, c, d, true)`,
  createElement 才是创建虚拟 dom 的。

## createElement

```js
// ../vdom/create-element
export function createElement(
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}

export function _createElement(
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' &&
      warn(
        `Avoid using observed data object as vnode data: ${JSON.stringify(
          data
        )}\n` + 'Always create fresh vnode data objects in each render!',
        context
      )
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if (
    process.env.NODE_ENV !== 'production' &&
    isDef(data) &&
    isDef(data.key) &&
    !isPrimitive(data.key)
  ) {
    if (!__WEEX__ || !('@binding' in data.key)) {
      warn(
        'Avoid using non-primitive value as key, ' +
          'use string/number value instead.',
        context
      )
    }
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) && typeof children[0] === 'function') {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
  let vnode, ns
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (
        process.env.NODE_ENV !== 'production' &&
        isDef(data) &&
        isDef(data.nativeOn)
      ) {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }
      vnode = new VNode(
        config.parsePlatformTagName(tag),
        data,
        children,
        undefined,
        undefined,
        context
      )
    } else if (
      (!data || !data.pre) &&
      isDef((Ctor = resolveAsset(context.$options, 'components', tag)))
    ) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(tag, data, children, undefined, undefined, context)
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
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

- createElement 通过处理调用的内部\_createElement,接收一系列参数,也就是我们 render 时候传入的。当`if (!tag)`会调`createEmptyVNode`方法,也就是创建一个空的 Virtual DOM。当`if (typeof tag === 'string')`tag 传入的是字符串,普通的节点的时候会`new VNode(xxx)`创建 dom 实例,如果是已经注册了的组件名则用 createComponent 来创建一个组件类型的 VNode,否则就创建一个未知名的 VNode。同时 children 也是一个节点,他也会创建一个 VNode,层层嵌套下来就形成了一个 DOMTree

## Virtual DOM

```js
// core/vdom/vnode
export default class VNode {
  tag: string | void
  data: VNodeData | void
  children: ?Array<VNode>
  text: string | void
  elm: Node | void
  ns: string | void
  context: Component | void // rendered in this component's scope
  key: string | number | void
  componentOptions: VNodeComponentOptions | void
  componentInstance: Component | void // component instance
  parent: VNode | void // component placeholder node

  // strictly internal
  raw: boolean // contains raw HTML? (server only)
  isStatic: boolean // hoisted static node
  isRootInsert: boolean // necessary for enter transition check
  isComment: boolean // empty comment placeholder?
  isCloned: boolean // is a cloned node?
  isOnce: boolean // is a v-once node?
  asyncFactory: Function | void // async component factory function
  asyncMeta: Object | void
  isAsyncPlaceholder: boolean
  ssrContext: Object | void
  fnContext: Component | void // real context vm for functional nodes
  fnOptions: ?ComponentOptions // for SSR caching
  devtoolsMeta: ?Object // used to store functional render context for devtools
  fnScopeId: ?string // functional scope id support

  constructor(
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.fnContext = undefined
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child(): Component | void {
    return this.componentInstance
  }
}

export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}

export function createTextVNode(val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
export function cloneVNode(vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.fnContext = vnode.fnContext
  cloned.fnOptions = vnode.fnOptions
  cloned.fnScopeId = vnode.fnScopeId
  cloned.asyncMeta = vnode.asyncMeta
  cloned.isCloned = true
  return cloned
}
```

- Virtual DOM 简单的说就是用 js 对象描述一个 DOM 节点,真是的 DOM 节点非常复杂,vue 用 VNode 这个类,暂时替代了 dom 经常操作

## update

- Vue 在初始化的时候会提供一个`_update`,在`src/core/instance/lifecycle.js`,而且调用的只在首次渲染,数据更新的时候调用了。他里面的核心方法是`__patch__`,他在`src/platforms/web/runtime/index.js`定义


## 组件
### createComponent
- 1、创建组件的时候 内部主要靠`Vue.extend`创建一个vue的子类
- 2、安装组件的钩子(hooks)
- 3、实例化vnode,组件的vnode没有children属性
## patch
- 在组件update的时候,会走patch,通过createElm创建 新的节点,patch会将新老元素对比。在完成组件的整个 patch 过程后,最后执行insert完成DOM的插入,如果组件 patch 过程中又创建了子组件，那么DOM 的插入顺序是先子后父
- patch的流程:createElement -> 子组件初始化 -> 子组件render -> 子组件patch
## options合并
- 分2中情况  第一种是全局new Vue的时候,第二种情况是组件内部 new Vue实例化子组件,都是通过mergeOption,并遵循一定的合并策略
- 全局情况下,他会把全局`components、directives、filter`合并到 全局的options中
- mergeOptions 合并的方法，先递归把 extends 和 mixins 合并到 parent 上,在分情况合并其他配置
  - 合并生命周期,如果child和parent有相同的生命周期函数即,用parent.concat(child) 将两个生命周期放到数组内,先执行parent 在执行child的
```js
// 全局options
Vue.options.components = {}
Vue.options.directives = {}
Vue.options.filters = {}
```
## mixin
- mixin 原理就就是把函数 合并到options中 
```js
Vue.mixin = function(mixin){
  this.options = mergeOptions(this.options,mixin)
  return this
}
```
## 组件注册
- 全局注册和局部注册
```js
// 全局 
Vue.component('my-component', {
  // 选项
})

// 局部
import HelloWorld from './components/HelloWorld'

export default {
  components: {
    HelloWorld
  }
}
```
## 异步组件
- 异步组件实现的本质是2次渲染(2次及以上),先渲染注释节点,当组件加载成功后,在通过forceRender重新渲染
- 普通 就是 require 语法请求
- promise 通过 import 返回一个promise
- 高级异步组件
```js
// 普通
Vue.component('async-example', function (resolve, reject) {
   // 这个特殊的 require 语法告诉 webpack
   // 自动将编译后的代码分割成不同的块，
   // 这些块将通过 Ajax 请求自动下载。
   require(['./my-async-component'], resolve)
})
// promise
Vue.component(
  'async-webpack-example',
  // 该 `import` 函数返回一个 `Promise` 对象。
  () => import('./my-async-component')
)
// 高级异步组件
const AsyncComp = () => ({
  // 需要加载的组件。应当是一个 Promise
  component: import('./MyComp.vue'),
  // 加载中应当渲染的组件
  loading: LoadingComp,
  // 出错时渲染的组件
  error: ErrorComp,
  // 渲染加载中组件前的等待时间。默认：200ms。
  delay: 200,
  // 最长等待时间。超出此时间则渲染错误组件。默认：Infinity
  timeout: 3000
})
Vue.component('async-example', AsyncComp)
```
## 响应式注意事项
- 响应式数据中对于对象新增删除属性以及数组的下标访问修改和添加数据等变化观察不到
- 通过Vue.set以及数组的API可以解决这些问题,本质上他们内部手动去做了依赖更新的派发

## props
- 属性是连字符的时候 内部统一处理成驼峰
- 子组件props 接收属性 定义可以写成 数组 对象(对象可以自定义,也可以接收多个类型用数组表示)
- 当接收多个类型,内部会遍历先执行数组的第一个类型是否满足，在依次往后判断
- 特例 当传递的值(必须是连字符)和属性一样的时候,属性接收的第一个为布尔值,则为 true
- 当 传递<Test nick-name/>的时候  也是true

```js
//  parent
<Test nick-name='nick-name'/>
// child
<template>
  <div>
      123 => {{nickName}}
  </div>
</template>

<script>
  export default {
    props:{
      nickName:[Boolean,String]
    }
  }
</script>
```
- 内部优化
  - 当组件每次更新的时候  同时props用的默认值 不会重新出发watch

```html
  <Test :num='age'/>
    <button @click="btn">++++</button>

 data(){
    return{
    
      age:1,
    }
  },
  methods:{
      btn(){
        this.age++
      }
    },
 <!-- child -->
<template>
  <div>
      => {{num}} 
      <br/>
      =>{{data}}
  </div>
</template>

<script>
  export default {
    props:{
      num:[Number],
      data:{
        type:Object,
        default(){
          return{
            a:'123',
          }
        }
      }
    },
    watch: {
      num(){
        console.log('.....')
      }
    },
  }
</script>
```
## Vue中事件绑定的原理
- Vue中事件绑定分为两种,一种是原生的事件绑定,还有一种是组件的事件绑定
- 1、原生dom事件的绑定是 `@click.native=fn` 他会编译成`nativeOn` 他等价于普通元素的on
- 2、组件事件绑定是 `@click=fn` 他会转换成`$on` 组件的 on 会单独处理，`$on`他会收集定义的组件到_events数组中等待`$emit`遍历key获取到对应的_events事件触发
- 如果v-for 要给每个元素进行事件绑定可以用事件代理

## v-model 原理
- 下面两种区别，功能都是双项绑定, v-model 等待输入结束显示页面,value+@input在输入的时候就显示页面
```js
<input v-model='msg'/>
// 等价下面的
<input :value='msg' @input='$event.target.value'/>
```
### v-model 在组件中
- 组件等同于下面这个mode
```js
model: {
    prop: 'value',
    event: 'input'
  },
```
## vue 插件

## vue-lazyload
- 图片懒加载

## vue-router
- Vue编写插件的时候 通常要提供静态的install方法
- vue-router的install方法会给每一个组件注入beforeCreated(做初始化工作)和 destroyed钩子函数,
## vuex

## vuex
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