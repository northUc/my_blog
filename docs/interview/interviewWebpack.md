# webpack面试题
## Loader和Plugin的区别是什么？
- Loader直译为"加载器"，webpack原生是只能解析js文件，如果想将其他文件也打包的话，就会用到loader。比如处理sass和less等
- Loader在module.rules中配置，也就是说作为模块的解析规则而存在。 类型为数组，每一项都是一个Object，里面描述了对于什么类型的文件（test），使用什么加载(loader)和使用的参数（options）
- Plugin直译为"插件"。Plugin可以扩展webpack的功能，在 Webpack 运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果。
- Plugin在plugins中单独配置。 类型为数组，每一项是一个plugin的实例，参数都通过构造函数传入。
## 常用的loader
```js
// raw-loader：加载文件原始内容（utf-8）
// file-loader：把文件输出到一个文件夹中，在代码中通过相对URL去引用输出的文件
// url-loader:和file-loader类似，但是能在文件很小的情况下以base64的方式把文件内容注入到代码中
// source-map-loader:加载额外的Source Map文件，以方便断点调试
// svg-inline-loader：将压缩后的 SVG 内容注入代码中
// image-loader：加载并且压缩图片文件
// json-loader 加载 JSON 文件（默认包含）
// handlebars-loader: 将 Handlebars 模版编译成函数并返回
// babel-loader：把ES6转化成ES5
// ts-loader: 将 TypeScript 转换成 JavaScript
// awesome-typescript-loader：将 TypeScript 转换成 JavaScript，性能优于 ts-loader
// css-loader：加载css，支持模块化、压缩、文件导入等特性
// style-loader：把css代码注入到js中，通过DOM操作去加载css
// eslint-loader：通过ESLint检查JS代码
// tslint-loader：通过 TSLint检查 TypeScript 代码
// postcss-loader：扩展 CSS 语法，使用下一代 CSS，可以配合 autoprefixer 插件自动补齐 CSS3 前缀
// vue-loader：加载 Vue.js 单文件组件
// cache-loader: 可以在一些性能开销较大的 Loader 之前添加，目的是将结果缓存到磁盘里
```
## 常见的plugin以及作用的总结
```js
// define-plugin：定义环境变量(Webpack4 之后指定 mode 会自动配置)
// ignore-plugin：忽略部分文件
// commons-chunk-plugin：提取公共代码
// html-webpack-plugin：简化 HTML 文件创建 (依赖于 html-loader)
// web-webpack-plugin：可方便地为单页应用输出 HTML，比 html-webpack-plugin 好用
// uglifyjs-webpack-plugin：不支持 ES6 压缩 (Webpack4 以前)
// terser-webpack-plugin: 支持压缩 ES6 (Webpack4)
// mini-css-extract-plugin: 分离样式文件，CSS 提取为独立文件，支持按需加载 (替代extract-text-webpack-plugin)
// webpack-parallel-uglify-plugin: 多进程执行代码压缩，提升构建速度
// serviceworker-webpack-plugin：为网页应用增加离线缓存功能
// clean-webpack-plugin: 目录清理
// ModuleConcatenationPlugin: 开启 Scope Hoisting
// speed-measure-webpack-plugin: 可以看到每个 Loader 和 Plugin 执行耗时 (整个打包耗时、每个 Plugin 和 Loader 耗时)
// webpack-bundle-analyzer: 可视化 Webpack 输出文件的体积 (业务组件、依赖第三方模块)
```
## webpack中source map是什么？生产环境怎么用
- source map是将编译、打包、压缩后的代码映射回源代码的过程。打包压缩后的代码不具备良好的可读性，想要调试源码就需要 soucre map。
- map文件只要不打开开发者工具，浏览器是不会加载的
- 线上环境一般有三种处理方案：
  - hidden-source-map：借助第三方错误监控平台Sentry使用
  - nosources-source-map：只会显示具体行数以及查看源代码的错误栈。安全性比source map高
  - source：通过nginx设置将.map文件只对白名单开放(公司内网)
