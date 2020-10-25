# webpack 总结
## base
### webpack是什么
- webpack是一个打包工具,它做的事情是就是,分析代码结构,找到js模块以及其他不能被浏览器识别的语法,打包成合适的合适供浏览器使用
### webpack打包流程
- 分位6步骤(配置,插件,run,make,seal,emitAssets)
- 1、执行npx webpack的时候 他会解析shell脚本和webpack配置
- 2、初始化内部和webpack配置的插件
- 3、run阶段 在compiler类内执行run方法 开始编译代码  他会初始化Compilation,他负责了整个编译过程,内部初始化一堆钩子,收集 entries,modules,chunks,assets  
  - 解释 entries就是入口文件,modules 每次require 的编译文件存放到modules中,chunks 指的是一个入口文件编译的所有资源,assets 是解析之后资源(chunks+模板组合) 用来输出到output中
- 4、make阶段 他通过工厂模式创建代码块 通过ast对源码进行解析,遇到`require`语法的时候 会替换成 `__webpack_require__`,(webpack内部实现了一套commonjs),同时会加入到依赖项,通过工厂模式再次创建
- 5、seal 封包  通过 chunks 和 module 创建代码块资源,通过模板,把chunk处理成`webpack_require()`需要格式,最终生成的代码
- 6、emit 把 assets 输出到 output中


### 懒加载
- 分2步骤 第一个是代码分割,第二个是jsonp加载数据
- 1、在ast语法解析,遇到`Import('xx')`的时候 webpack会将他替换成`__webpack_require__.e(chunkId).then(__webpack_require__.t.bind(xxxxx))`
- 2、`__webpack_require__.e`实现了jsonp的数据加载,内部会把加载过来的数据循环遍历注入到当前的modules(保存在require切割的代码带资源),`__webpack_require__.t`实际上是再次触发`__webpack_require__`加载数据到页面中

### 热更新
- 首先有server和client,平常我们配置的那个热更新插件,其实就是client
- server 他会创建一个socket.io 将所有的client存储起来 每次编译完成的时候 会遍历所有的client 告诉他们当前编译的hash,同时将compiler中文件输出修改为内存修改
- client
  - 1、也会创建一个socket.io 他监控server发送过来的hash,第一次会保存hash,第二次才能hot逻辑
  - 2、在更新的时候,他会发送一个请求 hash.hot-update.json 去问服务器有哪些代码块chunk变化了,服务器会返回一个对象 h是当前的hash值, c 是变化的chunk
  - 3、遍历c 获取到变化的chunkId 通过JSONP 请求变化的数据 chunkID.hash.hot-update.js ,client实现这个方法 webpackHotUpdate方法 加载有的数据

- 动态加载一般是运行时加载，静态加载是编译时加载
### es6
- 原理 利用es6 静态加载,分析依赖
- 特点1、只能作为模块顶层语句出现(不能放在{}内)
- 2、import的模块名只能是字符串常量
### loader
- 通过loader webpack把不同文件转换成js
- loader分为 normal/pitch,normal 接收的是源码 字符串 返回的是处理过后的字符串,同步用return,异步用this.async 回调,内部通过`loader-utils`获取loader的配置选项
- ['L1','L2','L3'] 执行顺序L1.pitch=>L2.pitch=>L1.pitch=>L1.normal=>L2.normal=>L3.normal
- css-loader 作用将 处理@import和url外部资源
- css-loader的原理 解析css 语法 找到 url 个 @import 将他们替换成 require 语法,将处理的数据 返回给 style-loader 处理
### 插件/tapable
- plugin 贯穿了整个webpack,插件的实现机制是要是: 创建各种钩子,插件注入到钩子中,webpack在执行的过程中,会触发对应的钩子执行函数
- 钩子就是table实现的,Hook 分同步和异步，异步又分并行和串行
### devtool 打包调试
- sourcemap性能最差 能定位到行和列
- eval 最能最好,最能映射到打包后的代码
### hash
- 作用是缓存,每次打包的时候 文件变动了,hash会变化,浏览器会重新请求
- 3类hash
  - hash 代表的每一次的编译(hash都会变)
  - chunkhash 代码块里面的内容变化了(chunkhash才会变)
  - contenthash 单个文件内容变化 他才变化
### resolve
- 配置文件的插件规则、别名等
### resolveLoader
- 配置loader的插件规则
### noParse 
- 可以用于配置哪些模块文件的内容不需要进行解析,提高构建速度
### 配置环境变量
- cross-env