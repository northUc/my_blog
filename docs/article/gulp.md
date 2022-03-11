# gulp
- [手写原理](https://github.com/songge7777/styleGulp)
- gulp是可以自动化执行任务的工具 在平时开发的流程里面,一定有一些任务需要手工重复得执行
- 快速构建 利用 node.js 流的威力,你可以快速构建项目并减少频繁的 IO 操作
- 安装
```js
npm install --g gulp-cli
npm install --save-dev gulp
```
- `gulpfile.js` 默认的文件
- gulp 默认执行`gulpfile.js`里的`exports.default = xxx`
- gulp bulid 执行`exports.bulid = build`
- series 是窜行执行
- parallel 是并行执行
```js
const fs = require('fs');
const through = require('through2');
const { series, parallel } = require('gulp');
function callbackTask(done) {
    setTimeout(() => {
        console.log('callbackTask');
        done();
    }, 1000);
}
function promiseTask() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('promiseTask');
            resolve();
        }, 1000);
    });
}
async function asyncTask() {
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
    console.log('asyncTask');
}
function streamTask() {
    return fs.createReadStream('input.txt')
        .pipe(through((chunk, encoding, next) => {
            setTimeout(() => {
                next(null, chunk);
            }, 1000);
        }))
        .pipe(fs.createWriteStream('output.txt'))
}

const parallelTask = parallel(callbackTask, promiseTask, asyncTask, streamTask);
const seriesTask = series(callbackTask, promiseTask, asyncTask, streamTask);
exports.callback = callbackTask
exports.promise = promiseTask
exports.async = asyncTask
exports.stream = streamTask
exports.parallel = parallelTask
exports.series = seriesTask
```
## 用法 src dest
- gulp.src() 用来获取流
- gulp.dest() 用来输出流(向硬盘写入文件的)
## glob 
- gulp内部使用了node-glob模块来实现其文件匹配功能
```yaml
# *	能匹配 a.js,x.y,abc,abc/,但不能匹配a/b.js
# .	a.js,style.css,a.b,x.y
# //*.js	能匹配 a/b/c.js,x/y/z.js,不能匹配a/b.js,a/b/c/d.js
# **	能匹配 abc,a/b.js,a/b/c.js,x/y/z,x/y/z/a.b,能用来匹配所有的目录和文件
# a/**/z	能匹配 a/z,a/b/z,a/b/c/z,a/d/g/h/j/k/z
# a/**b/z	能匹配 a/b/z,a/sb/z,但不能匹配a/x/sb/z,因为只有单**单独出现才能匹配多级目录
# ?.js	能匹配 a.js,b.js,c.js
# a??	能匹配 a.b,abc,但不能匹配ab/,因为它不会匹配路径分隔符
# [xyz].js	只能匹配 x.js,y.js,z.js,不会匹配xy.js,xyz.js等,整个中括号只代表一个字符
# [^xyz].js	能匹配 a.js,b.js,c.js等,不能匹配x.js,y.js,z.js
```

## 插件
- 他的插件就是一个函数,接收流经过处理在返回
```js

var {PluginError} = require('gulp-util');
var through = require('through2');
function gulpPrefixer(prefixText) {
    if(!prefixText){
        return new PluginError('gulpPrefixer', '要加信息前缀')
    }
    prefixText = Buffer.from(prefixText);
    var stream = through.obj(function (file, enc, next) {
        if (file.isBuffer()) {
            file.contents = Buffer.concat([prefixText, file.contents]);
        }
        // 往下游放
        this.push(file);
        next();
        // next(null, file);
    });
    return stream;
};
module.exports = gulpPrefixer;


const prefix = require('./gulpPrefix');
const { series, parallel, src, dest } = require('./lib/index');
const defaultTask = () => {
    return src('../src/scripts/**/*.js')
        .pipe(prefix('/**xxxxxxsxsxsx**/'))
        .pipe(dest('dist'));
}

exports.default = defaultTask;
```
