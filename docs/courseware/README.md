
# 课件
- `react` 列表渲染与`key`的问题
[[toc]]

## 准备工作
### 环境
- `node、mac(或者windows)`
### 编辑器
- `vscode`
### 安装环境
- 安装脚手架`npm install create-react-app -g`
    -   如果是`mac` 可能需要加`sudo`
- 快速生成项目`create-react-app react-test`

- 日志
```js
Creating a new React app in /Users/edz/Desktop/react-test.

Installing packages. This might take a couple of minutes.
Installing react, react-dom, and react-scripts with cra-template...

.................
.................

Success! Created react-test at /Users/edz/Desktop/react-test
Inside that directory, you can run several commands:

  npm start
    Starts the development server.

  npm run build
    Bundles the app into static files for production.

  npm test
    Starts the test runner.

  npm run eject
    Removes this tool and copies build dependencies, configuration files
    and scripts into the app directory. If you do this, you can’t go back!

We suggest that you begin by typing:

  cd react-test
  npm start

Happy hacking!
```

## 列表渲染
- 简单粗暴的遍历
```js
import { useState } from 'react';
import './App.css';
function App() {
  const [list, setList] = useState(['吃饭','喝水','睡觉','打豆豆']);
  const mapList = (item,index) => <li>{item}</li>
  return (
    <div className="App">
      <li>
      {
        list[0]
      }
      </li>
      <li>
      {
        list[1]
      }
      </li>
      <li>
      {
        list[2]
      }
      </li>
      <li>
      {
        list[3]
      }
      </li>
    </div>
  );
}
export default App;
```
- 优雅遍历: 利用函数的`map`遍历
```js
import { useState } from 'react';
import './App.css';
function App() {
  const [list, setList] = useState(['吃饭','喝水','睡觉','打豆豆']);
  const mapList = (item,index) => <li>{item}</li>
  return (
    <div className="App">
      {
        list.map(mapList)
      }
    </div>
  );
}

export default App;
```

## key问题
- input问题
```js
import { useState } from 'react';
import './App.css';
function App() {
  const [flag,setFlag] = useState(true)
  const isTest = () => setFlag(!flag)
  return (
    <div className="App">
       { 
        flag ?
        <div>
        <span>测试1</span>
        <input type="text" key='1'/>
      </div>
      :
      <div>
        <span>测试2</span>
        <input type="text"  key='2'/>
      </div>
      }
    <button onClick={isTest}>按钮</button>
    </div>
  );
}
export default App;
```
- map 问题
```js
import { useState } from 'react';
import './App.css';
function App() {
  const [list, setList] = useState([
    {
      id:1,
      value:'吃饭'
    },
    {
      id:2,
      value:'喝水'
    },
    {
      id:3,
      value:'睡觉'
    },
    {
      id:4,
      value:'打豆豆'
    },
    ]);
  const mapList = (item,index) => <div>{item.value} : <input  key={item.id} /></div>
  const listReverse = () => {
    setList([
      {
        id:4,
        value:'打豆豆'
      },
      {
        id:1,
        value:'吃饭'
      },
      {
        id:2,
        value:'喝水'
      },
      {
        id:3,
        value:'睡觉'
      },
    ])
  }
  return (
    <div className="App">
      {
        list.map(mapList)
      }
      <button onClick={listReverse}>旋转</button>
    </div>
  );
}

export default App;
```