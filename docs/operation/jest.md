# jest base
[[toc]]

## 配置
### jest 配置
- 安装 cnpm i -D jest
- 配置文件 npx jest --init(npx 调用的是node_modules下的jest)
- npx jest coverage 生成测试覆盖率(或者脚本配置 jest coverage)
```js
module.exports = {
  // true时，当前引入文件时候 首先会到__mocks__ 目录下查找,在到当前文件下查找
  automock: true,
  // 每次清空 每次的mock数据
  clearMocks: true,
  // 当测试覆盖率的文件 名字
  coverageDirectory: "coverage",
  // 要测试文件的位子
  testMatch: [
    '**/tests/**/*.(js|jsx|tsx)'
  ]
};
```

### babel 配置
- 安装babel @babel/core@7.4.5 @babel/preset-env@7.4.5
- 创建.babelrc文件
- jest 内部有一个(babel-jest)插件 他会去找babelrc的配置
```js
{
  "presets":[
    ["@babel/preset-env",{
      "targets":{
        "node":"current"
      }
    }]
  ]
}
```
### vscode 配置
- vscode jest  不用跑脚本了
###  脚本 配置
-  package.json => jest --watch 配置后 没有o模式 自带，
-  package.json => jest --watchAll 配置后 有o模式 有a模式，
## jest 命令行
- w切换模式
- f模式 过滤没有通过的测试 再次按f即退出这个模式
- 0模式 只测试修改过的文件 但是需要git commit 配合
- a模式 跑一遍所有的测试
- p模式 通过filename 进行过滤
- t模式 通过test用例的名字 进行过滤
- q模式 就是退出
- Enter模式 重新跑

## base
### 基本结构
```js
describe('目录',()=>{
  //....生命周期
  describe('多层目录',()=>{
    //....生命周期
    test('单个测试1',()=>{

    })
    test('单个测试2',()=>{

    })
  })
})

```
### 生命周期
- beforeAll 他作用于所有的test 最新执行
- beforeEach 他作用于当个test 在每一个test前执行
- afterEach 他作用于当个test 在每一个test后执行
- afterAll 他作用于所有的test 每一个test执行完成后他在执行
- 特例 describe&&test 里面的`console.log()`在生命周期之前执行
```js
describe('xx',()=>{
  beforeAll(()=>{

  })
  beforeEach(()=>{

  })
  afterEach(()=>{

  })
  afterAll(()=>{

  })
})
```
### 断言
- 匹配器
  - toBe 判断值是否相同:expect(1).toBe(1)  类似`===`
  - toEqual 判断对象的是否相等 expect({one:1}).toBe({one:1}) 并非比较引用地址,他会递归比较
  - 0.1+0.3 上面2个都不能处理 用toBeCloseTo处理
- 真假相关
  - toBeNull  `const a = null; expect(a).toBeNull()` 判断null
  - toBeDefined  `const a = null; expect(a).toBeDefined()` 判断是否被定义
  - toBeTruthy  `const a = 1; expect(a).toBeTruthy()` 判断为true
  - toBeFalsy  `const a = 0; expect(a).toBeFalsy()` 判断为false
  - not  `const a = 1; expect(a).not.toBeFalsy()` 取反
- 数字相关的匹配器 大小
  - toBeGreaterThan `const a = 12; expect(a).toBeGreaterThan(11)` 大于
  - toBeLessThan 小于
  - toBeGreaterThanOrEqual 大于等于
- 字符串 匹配里面放正则
  - toMatch `const str = 'http://www.dell-le.com'; expect(str).toMatch(/www/)`
- Array Set
  - toContain ` const arr = ['dell','lee','imooc'];const data = new Set(arr);expect(arr).toContain('dell'); expect(data).toContain('dell')`
- 异常
  - toThrow 里面的值如果写的话要个报错保持一致 `const fn =()=>{throw new Error('this is a new error')};expect(fn).toThrow('this is a new error')` 
```js
// 工具库
export default class Counter{
  constructor(){
    this.number = 0
  }
  addOne(){
    this.number +=1
  }
  addTwo(){
    this.number += 2
  }
  minusOne(){
    this.number -=1
  }
  minusTwo(){
    this.number -= 2
  }
}
test('测试 Counter 中的 addOne 方法',()=>{
  counter = new Counter()
  expect(counter.number).toBe(1)
})
```
## mock
- mock 即模仿 当`jest.mock('./demo')` 之后的引用 `'./demo'`都会去__mocks__目录下查找文件,若没有在去当前目录下查找,就是对原文件进行了一个拦截,一般就是模拟处理我们的异步，`jest.mock('./xx')`他会默认提升位子 执行的时候会跑到import之前执行
- `jest.unmock('./demo')`取消模拟
- `const {fetchData} = jest.requireActual('./demo')` 即引入当前真正的文件
### 测试接口的小例子
  - only 表示只测试当前的一个test用例
```js
// 真实例子
export const fetchData = ()=>{
  return axios.get('/').then(rs=>rs.data)
}
// 拦截例子 不会等待真实接口发送请求  时间太长了
export const fetchData = ()=>{
  return new Promise((resolved,reject)=>{
    resolved("123")
  })
}
// 测试 
jest.mock('./demo')
import { fetchData } from './demo';
test.only('mock',()=>{
  return fetchData().then(data => {
      expect(data).toEqual("123");
    })
})
```
### 函数处理
- jest.fn 内置函数 捕获函数的调用 同时携带一些参数
- jest.fn().mock 
  - calls 被执行 返回的参数和个数
  - results 是jest.fn 里面的执行结果
  - instances 在写类的时候 才有用 函数无效, 指的是当前this
- mockImplementation/mockImplementationOnce,mockReturnValueOnce/mockReturnValue,都可以设置mock函数的返回值
- jest.mock('axios') 拦截axios请求
```js
import axios from 'axios';
export const runCallback = (cb)=>{
  cb('123');
}

export const createObject = (cb) => {
 new cb()
}

export const getData = () => {
  return axios.get('/api').then(rs => rs.data)
}

export const fetchData = ()=>{
  return axios.get('/').then(rs=>rs.data)
}
// test
test('测试函数被执行',()=>{
  const func = jest.fn(()=>123)
  runCallback(func)
  console.log(func.mock,'里面保存了返回的参数以及mock函数返回的参数')
  // func.mock.calls.length
  // func.mock.results[0].value
  // 此函数被调用
  expect(func).toBeCalled()
})

test('测试 createObject',()=>{
  const func = jest.fn();
  createObject(func)
  console.log(func.mock)
})

// 拦截axios请求
jest.mock('axios')
test('测试 getData',async ()=>{
  // 拦截axios真正的请求
  // mockResolvedValueOnce 设置一次 
  // mockResolvedValue 设置所有 
  axios.get.mockResolvedValueOnce({data:'hello'})
  axios.get.mockResolvedValueOnce({data:'hello1'})
  await getData().then(data=>{
    expect(data).toBe('hello')
  })
  await getData().then(data=>{
    expect(data).toBe('hello1')
  })
})
```
## 处理异步
- 回调函数用
- promise
```js
// 回调
export const fetchData = (fn) => {
  axios.get('http://www.dell-lee.com/react/api/demo.json').then(rs=>{
    fn(rs.data)
  });
}
// promise
export const fetchData = () => axios.get('http://www.dell-lee.com/react/api/demo.json')
// 404
export const fetchData = () => axios.get('http://www.dell-lee.com/react/api/demo1.json')

// test
// 回调函数
test('回调',(done)=>{
  fetchData((data)=>{
    expect(data).toEqual({
      success:true
    })
    done()
  })
})
// promise
test(`promise`,async()=>{
  const rs = await fetchData()
  expect(rs.data).toEqual({
    success:true
  })
})

// 404 一般要单独测试
test(`404`,async()=>{
  // 下面的expect 要执行一次 如果返回成功的情况下 是不会走catch语句的 
  expect.assertions(1)
  try {
    await fetchData()
  }catch(e){
    expect(e.toString()).toMatch('404')
  }
})
```
- 定时器测试
```js
export default (cb)=>{
  setTimeout(()=>{
    cb()
  },3000)
}

jest.useFakeTimers();

test('timer 测试',()=>{
  const fn = jest.fn();
  console.log(fn)
  timer(fn);
  // 快进秒数 这个时间要大于异步函数执行的时间
  jest.advanceTimersByTime(4000)
  expect(fn).toHaveBeenCalledTimes(1)
})
```
## class
```js
// util 
class Util {
  init(){
    // .... 复杂
  } 
  a(){
    // .... 复杂
  } 
  b(){
    // .... 复杂
  }
}
const demoFunction = (a,b)=>{
  const util = new Util();
  util.a(a);
  util.b(b);
}

// __mocks__/util 拦截处理
const Util = jest.fn(()=>{
  console.log('a,b')
})
Util.prototype.a = jest.fn(()=>{
  console.log('a,b')
})
Util.prototype.b = jest.fn(()=>{
  console.log('a,b')
})
export default Util;


// 默认提高 可以自定义类 在__mocks__ 下创建一个util
jest.mock('./util');
import Util from './util';
test('测试类',()=>{
  domeFunction()
  // class 被执行
  expect(Util).toHaveBeenCalled()
  // 内中的方法被执行
  expect(Util.mock.instances[0].a).toHaveBeenCalled()
  expect(Util.mock.instances[0].b).toHaveBeenCalled()
})
```
## snapshot 快照
- 处理config配置文件 当第一次保存的时候  会生成一个快照  之后只要修改config 都会提醒配置文件变更了 
- 安装 `prettier` 快照会在当前文件内打印下来 默认情况下 会单独生成配置文件
```js
export const generateConfig = () => {
  return {
    server:'http://localhost',
    port:8080,
    domain:'localhost',
    time:new Date()
  }
}
// test
test("snapshot config", () => {
  expect(generateConfig()).toMatchInlineSnapshot(
    {
      // 处理每次变化的数据 例如time
      time: expect.any(Date)
    },
  );
});
// toMatchSnapshot 监控配置项
// 第一次的配置项保存起来 下次修改的时候  会提示报错
// u 操作能清除报错
// i 当多个快照存在的时候 i是分部处理

// 如果一直变动的情况  比如Date
/*
  可以写成
  toMatchSnapshot({
    // Date 这里写的是类型
    time:expect.any(Date)
  })
*/
```