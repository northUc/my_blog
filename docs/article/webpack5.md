# webpack5 更新版本
[[toc]]
## mode 
- 有三个 null development production
- 默认优先级(production) < 文件mode配置 < package.json中的--mode配置
- development/production 开启的时候都加入了默认参数
## 资源loader 处理
- type:'asset'
```js
{
    // webpack4 用file-loader  url-loader raw-loader
    // webpack5 统一成 type:'asset'
    test:/\.png$/,
    type:'asset/resource'// 对标file-loader
},
{
    test:/\.ico$/,
    type:'asset/inline'// 对标url-loader
},
{
    test:/\.txt$/,
    type:'asset/source'// 对标raw-loader
},
{
    test:/\.jpg$/,
    type:'asset',// 对标raw-loader
    parser:{
        dataurlCondition:{
            maxSize:4*1024
        }
    }
}
```
## polyfill
```js
presets: [["@babel/preset-env",{
    useBuiltIns: 'usage',
    corejs: {version: 3}
}]]
useBuiltIns: entry usage
    // entry 会把所有的兼容包引入进来
    // usage 会按需引入 原理在 方法的原型上修改方法, 问题会造成 全部方法的 污染
```
- 项目开发
```js
项目开发 
    // @babel/preset-env 提供 polyfill  corejs 3.0
    // @babel/plugin-transform-runtime 提供 helpers 减少体积
    // 可能会污染全局 但是体积减少 由于项目开发 所有影响不大
    {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
            // 最佳配置
            loader: 'babel-loader',
            options: {
                targets: {
                    "browsers": ["IE 6","chrome 80"]
                },
                presets: [["@babel/preset-env",{
                    useBuiltIns: 'usage',
                    corejs: {version: 3}
                }]],
                plugins: [
                    [
                        "@babel/plugin-transform-runtime",
                        {
                            corejs: false,
                            helpers: true,
                            regenerator: false
                        }
                    ],
                ]
            }
        }
    }
```
- 类库开发
```js
    // 类库
    // @babel/plugin-transform-runtime  提供 polyfill  corejs 3.0  regenerator 用来转化函数
    {
        "presets": [
            [
                "@babel/preset-env"
            ]
        ],
        "plugins": [
            [
                "@babel/plugin-transform-runtime",
                {
                    "corejs": {
                        "version": 3
                    },
                    helpers: true,
                    regenerator: true, // 不会污染全局
                }
            ]
        ]
    }

```
### cnd处理 polyfill-service
- polyfill.io自动化的 JavaScript Polyfill 服务
- polyfill.io通过分析请求头信息中的 UserAgent 实现自动加载浏览器所需的 polyfills
```js
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
```

## cache(缓存)
- 在5中 持久化 里面内置了,以前需要插件
```js
cache: 
{
    // 用filesystem  不能用cnpm  用来安装了  会卡死 因为npm @babel...(这个是标准)   cnpm下载的是 _@babel  导致webpack5 里面 无法识别
    type: 'filesystem',  //  'memory' | 'filesystem'
    // 默认将缓存存储在 node_modules/.cache/webpack
    // cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack'), 
},
```

## tree shaking
- 怎么开启
- 1、使用es module的模块规范、使用解构赋值
- 2、开启 optimization.usedExports
- 3、开启 production 模式
- 上面都开启 会删的很干净 `window.a = '1'` 不会被删除
- pack.json => "sideEffects": [".css'] 如果是css 不做 tree shaking,如果是js还是要, 
- `import './a';` 会删除 `window.a = '1'` 这个, 也就是说除了到出的东西都会被删除
```js
// index.js
import './a';
console.log(a1)

// a.js
window.a = '1'
export function a1(){
}
```