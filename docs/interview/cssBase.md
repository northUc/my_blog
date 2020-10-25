# css

[[toc]]
- 分9类别
## 基础选择器
- #id .class div * p,span
## 层次选择器
- 上下级  E F   E>F
- 兄弟级  E+F   E~F
## 属性选择器
- E[attr]
## 伪元素
- E::after
- E::before
## 伪类
### 目标伪类
### 动态伪类
- a:link
- a:visited
- a:hover
- a:active
### 状态伪类
- E:disabled 
- E:checked 
### 否定伪类
- div:not(.class)

### 结构伪类
- E:first-child E的第一个元素
- E:nth-of-type(n) 第几类


# 优先级
- id>class>伪元素>其他
- 属性>style>样式表

# doctype 意义
- 让浏览器以标准模式渲染
- 让浏览器知道元素的合法性

# em和i区别
- em是语义化标签 表强调
- i是纯样式标签 表示斜体

# 哪些标签可以不加子闭合
- img script input hr br mate link

# property和attribute的区别
- property是js中的
- attribute是html中的

# 移动端
- dpr = 物理像素/css像素
- viewport 3个理论
- layout viewport 网页宽度
  - document.documentElement.clientWidth 获取
- visual viewport 可视区域宽度
  -  window.innerWidth
- ideal viewport 设备的理想宽度
```js
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
```

# 行高&&空白处理
- line-height > line-box 就会垂直居中
- 3个 大小不同的字体 对齐方式 vertical-align:middle
- 字体和图片有空白
  - vertical-align:bottom
  - font-size:0
  - 设置成块元素

# 三角形
```js
  div{
    width: 10px;
    height: 10px;
    border: 10px solid;
    border-color: red transparent transparent;
  }
```
# background
- background-size
  - cover 保持长宽比 不变 覆盖整个画面 
  - contain 保持长宽比 不变 全部显示出来 会有空白位子
- 雪碧图 设置位子即可(border-box  变成位子)
```js
 background: url('./u=1906269766,117925167&fm=26&gp=0.jpg') no-repeat border-box ,url('./u=1906269766,117925167&fm=26&gp=0.jpg') no-repeat border-box  ;
```
# 文字折行
```js
  // 一行显示
  .div{
    overflow: hidden;
    white-space:nowrap;
    text-overflow: ellipsis;
  }
  // 单词 转行
  .div{
    word-wrap:break-word 
  }
```
# float
- 影响:
- 1文字环绕,2影响其他块级内部的文本和位子,3从布局上消失
- 清除float影响
  - 解决 overflow:hidden/atuo(开启bfc)
```js
// 给父级增加一个伪元素
.clear:after{
  content:'';
  clear:both;
  display:block;
  overflow:hidden;
  height:0
}
```
# 如何实现圆形元素
- border-redius:50%

# clip-path(裁剪)
- circle 剪切的是圆
```js
  clip-path:circle(50px at 100px 100px);
```
# 动画
- 过度动画(transition):要求元素状态有变化
```css
  div{
    width: 100px;
    height: 100px;
    background: red;
    transition: width 3s;
  }
  div:hover{
    width: 300px;
  }
```
- 关键帧动画(animation)
  
- 逐帧动画,去掉补间 (steps)
  - animation-timing-function: steps(1)
# css盒子模型
- 标准模型 margin+border+padding+content
- IE模型 margin+border+padding+content
- 区别  标准模型的 宽高就是content IE的宽高:content+padding+border
- 切换 box-sizing:content-box/border-box
# BFC 
- 特性
- BFC 整个元素的垂直方向会发生重叠
- BFC 不会与float元素发生重叠
- BFC 是一个独立的容器
- BFC 计算宽高的时候 float元素也会参与
- 创建BFC
- 1、float不为none
- 2、overflow不是visible
- 3、position值不是static和relative
- 4、display值是table相关的值
# margin 问题
- 父级和第一子元素/最后一个子元素margin-top/margin-bottom 合并到父级
- 处理 给元素加一个border/中间添加一个内联元素分离/父元素设置为BFC
# url到输入浏览器 的过程
- 1、浏览器缓存
- 2、DNS域名解析
- 3、浏览器向服务器IP地址请求数据，服务器返回数据
- 4、浏览器根据返回的html生成DOM 树,返回的css生成css 模型
- 5、DOM 树和css 模型 组合成渲染树,开始渲染
- 6、遇到script标签会堵塞渲染
# a标签预解析
```js
  <mate http-equiv='x-dns-prefect-control'  content='on' />
```
# @import 和 link
- @import 属于css 只能加载css, 需要页面加载完成后在加载
- link 属于html 在页面加载的时候 同时加载

# 图片预加载 onload跟complete 的区别
- onload 是加载成功 触发的回调事件
- complete 是加载完成 不管成功与否 出回调事件

# 布局
## 三栏式布局
```js
// flex
<style>
    .set{
      display: flex;
    }
    .div{
      width: 100px;
      height: 100px;
    }
    .div1{
      border: 1px solid red;
    }
    .div2{
      flex: 1;
      border: 1px solid green;
    }
    .div3{
      border: 1px solid red;
    }
</style>
<section class="set">
  <div class="div1">11</div>
  <div class="div2">22</div>
  <div class="div3">33</div>
</section>

// position

<style>
     div{
      position: absolute;
    }
    .div1,.div3{
      width: 100px;
      height: 100px;
    }
    .div1{
      left: 0;
      border: 1px solid red;
    }
    .div2{
      left: 100px;
      right: 100px;
      border: 1px solid green;
    }
    .div3{
      right: 0px;
      position: absolute;
      border: 1px solid red;
    }
</style>
<section class="set">
  <div class="div1">11</div>
  <div class="div2">22</div>
  <div class="div3">33</div>
</section>

// float
<style>
 .div1,.div3{
   width: 100px;
   height: 100px;
 }
 .div1{
   float: left;
   border: 1px solid red;
 }
 .div2{
   float: left;
   border: 1px solid green;
 }
 .div3{
   float: right;
   border: 1px solid red;
 }
</style>
<section class="set">
<div class="div3">33</div>
<div class="div1">11</div>
<div class="div2">22</div>
</section>

// grid
<style>
  .left,.right{
  background: red;
 }
  .one{
    display: grid;
    width: 100%;
    grid-template-columns:300px auto 300px;
    grid-template-rows:300px
  }
</style>
<section class="one">
  <div class="left">左</div>
  <div class="center">中</div>
  <div class="right">右</div>
</section>

```