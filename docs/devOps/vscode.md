# vscode

## 文件格式化
- 1、安装好beautify插件
- 2、选择要格式的代码部分,ctrl+shift+p
- 3、在弹出的弹框中选择Beautiful selection
- 4、接下来会弹出格式化JS还是HTML 还是css 选择就完事了

## 配置 babel
- 基础配置
- cnpm i eslint  babel-eslint  eslint-loader  -D 
```js
// vscode 配置
  // #让vue中的js按编辑器自带的ts格式进行格式化  这个和下面的有冲突 在vue中配合 vetur 使用
  "vetur.format.defaultFormatter.js": "vscode-typescript",

  // #每次保存的时候自动格式化 他eslint保存 还有点冲突(格式化代码的时候 会把最后一行空格删除,eslint 需要保存这一行)
  "editor.formatOnSave": true,
  // #每次保存的时候将代码按eslint格式进行修复
  "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
  }

// 创建 .eslintrc.js 文件
module.exports = {
  root: true,
  env: {
    node: true
  },
  // 规则
  extends: [
    'airbnb'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': 'error',
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
```