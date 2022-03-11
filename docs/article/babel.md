# babel

## babel 插件
- `@babel/core`这个模块主要对语法进行ast解析,插件的作用是在解析的时候 对需要处理的语法进行转化
- 写法:
    -   每个`babel`插件都需要提供一个`visitor`对象,对象里面存放的是 babel 解析之后 要捕获的类型名称的函数,比如`import`解析后是`ImportDeclaration`等(文档),当遇到 `import` 语法,就会插件
```js
const visitor = {
    ImportDeclaration(path,state){
    }
}
```
- webpack 里面的用法
```js
module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options:{
            plugins:[
                [
                    path.resolve(__dirname,'plugins/babel-plugin-import.js'),
                    {
                        libraryName:'lodash',
                        libraryDirectory:''
                    }
                ],
                [
                    path.resolve(__dirname,'plugins/log.js'),
                    {
                        libraryName:'lodash',
                        libraryDirectory:''
                    }
                ],
            ]
            }
        },
      },
    ],
  },
```

- `log`
```js
// babel核心模块
const core = require('@babel/core');
// 用来生成或者判断节点的ast语法树节点
let types = require('@babel/types');
const path = require('path');
const visitor = {
    CallExpression(nodePath,state){
        const {node} = nodePath;
        if(types.isMemberExpression(node.callee)){
            if(node.callee.object.name === 'console'){
                if (['log', 'info', 'warn', 'error', 'debug'].includes(node.callee.property.name)) {
                    const { line, column } = node.loc.start;
                    const relativeFileName = path.relative(__dirname, state.file.opts.filename).replace(/\\/g, '/');
                    node.arguments.unshift(types.stringLiteral(`${relativeFileName} ${line}:${column}`));
                }
            }
        }
    }
}
module.exports = function (){
    return {
        visitor
    }
}
```
- 处理 部分库将 批量导入转成默认导入
- `babel-plugin-import` 
```js
// babel核心模块
const core = require('@babel/core');
// 用来生成或者判断节点的ast语法树节点
let types = require('@babel/types');

const visitor = {
    ImportDeclaration(path,state){
        const {node} = path;
        const { specifiers } = node;
        const { libraryName, libraryDirectory } = state.opts;
        //如果当前的节点的模块名称是我们需要的库的名称, 并且导入不是默认导入才会进来
        if (node.source.value === libraryName && !types.isImportDefaultSpecifier(specifiers[0])){
            //遍历批量导入声明数组
            const declarations = specifiers.map(specifier => {
                //返回一个importDeclaration节点
                return types.importDeclaration(
                    //创建一个 导入声明importDefaultSpecifier 的节点 flatten
                    [types.importDefaultSpecifier(specifier.local)],
                    //导入模块source lodash/flatten  对应Literal ast 节点
                    types.stringLiteral(libraryDirectory ? `${libraryName}/${libraryDirectory}/${specifier.nimportedame}` : `${libraryName}/${specifier.imported.name}`)
                );
            })
            path.replaceWithMultiple(declarations);//替换当前节点
        }
    }
}

module.exports = function (){
    return {
        visitor
    }
}
```

- webpack 插件
- complier 代表当前webpack编译的主体文件
- compilation 代表每个文件编译的当前主体
```js
const JSZip = require('jszip');
const { RawSource } = require('webpack-sources');
class ArchivePlugin {
    constructor(options) {
        this.options = options;
    }
    apply(complier) {
        //emit当webpack确定好输出的内容后会触发一次emit钩子，这里你修改输出文件列表最后的机会，因为这个钩子执行完后就开始把编译后的结果输出到文件系统中去
        //const processAssetsHook = new AsyncSeriesHook(["assets"]);
        complier.hooks.compilation.tap('ArchivePlugin', (compilation) => {
            // Compilation.assets will be frozen in future, all modifications are deprecated.
            compilation.hooks.processAssets.tapPromise( {
                name: 'ArchivePlugin',
                stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS, // see below for more stages
              }, (assets) => {
                //assets 本次编译出来的资源文件
                // let assets = compilation.assets;
                var zip = new JSZip();

                for (let filename in assets) {
                    let cacheSource = assets[filename];
                    //获取此文件对应的源代码
                    const source = cacheSource.source();
                    console.log('filename', filename, cacheSource, source)
                    //向压缩包里添加文件，文件名叫filename,文件内容叫source
                    zip.file(filename, source);
                }
                return zip.generateAsync({ type: 'nodebuffer' }).then(content => {
                    //向输出的文件列表中添加一个新的文件 key
                    /*  assets['archive_' + Date.now() + '.zip'] = {
                         source() {
                             return content;
                         }
                     }; */
                    //assets的值必须是一个对象，对象需要有一个source方法，返回源代码
                    assets['archive_' + Date.now() + '.zip'] = new RawSource(content);
                });
            }); 
        });
    }
}
module.exports = ArchivePlugin;
```