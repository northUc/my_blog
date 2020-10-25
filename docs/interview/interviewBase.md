# html/css面试题
## html/css
## CSS预处理器的好处
- 1、css预处理后代码容易维护
- 2、可以使用变量,多出引用,一处动牵全身
- 3、css嵌套模式,减少大量的重复选择器
- 4、使用变量、mixin等提升样式的重复性

## Css预处理器的概念
- 1、为css增加编程特性的扩展性语言,可以使用变量,函数等
- 2、css预处理编译输出的还是css样式
- 3、less,sass都是动态样式语言,是css预处理器,css上的一种抽象层
- 4、less变量是@,sass遍历是$
- 解决的问题
- css语法不够强大,没法嵌套导致很多重复选择器
- 没有复用机制,难以维护

## 盒子模型
- 一个元素的构成:margin,border,padding,content他们一起构成css元素的盒子模型
- 标准盒子模型 
  - 内容
  - box-sizing:content-box
- IE盒子模型(怪异盒子)
  - 内容+border+padding
  - box-sizing:border-box
  - 当width 小于内容+border+padding 实际width 为内容+border+padding值
- 子元素100px高度,子元素与父元素的上边是10px,父元素的高度是多少
  - 100px(不开bfc,垂直边距会重叠) 或者 110px(开启bfc)
- 获取元素的宽高
```js
1、dom.style.width
2、dom.offsetWidth/clientWidth
3、window.getComputedStyle(dom).width
4、dom.getBoundingClientRect().width
```
## 响应式布局用到的技术有几种方式
- 1、媒体查询
  - CSS3媒体查询可以让我们针对不同的媒体类型定义不同的样式，当重置浏览器窗口大小的过程中，页面也会根据浏览器的宽度和高度重新渲染页面
- 2、百分比布局
- 3、rem布局
  - 在响应式布局中，必须通过js来动态控制根元素font-size的大小，也就是说css样式和js代码有一定的耦合性，且必须将改变font-size的代码放在css样式之前
```js
/* 这段代码是将视图容器分为10份，font-size用十分之一的宽度来表示
最后在header标签中执行这段代码，就可以动态定义font-size的大小
从而1rem在不同的视觉容器中表示不同的大小，用rem固定单位可以实现不同容器内布局的自适应 */
function refreshRem(){
    var docEl=doc.documentElement;
    var width=docEl.getBoundingClientRect().width;
    var rem=width/10;
    docEl.style.fontSize=rem+'px';
    flexible.rem=win.rem=rem;
}
win.addEventListener('resize',refreshRem)
```
  - Rem布局也是目前多屏幕适配的最佳方式。默认情况下html标签的font-size为16px，我们利用媒体查询，设置在不同设备下的字体大小
- 视口单位 
```js
// vw:相对于视图的宽度，1vw等于视口宽度的1%，即视图宽度是100vw
// vh:相对于视图的高度，1vh等于视口高度的1%，即视图高度是100vh
// vmin:vw和vh中较小的值
// vmax:vw和vh中较大的值
```
## 图片响应式
- 图片响应式包括两个方面，一个就是大小自适应，这样能够保证图片在不同的屏幕分辨率下出现压缩、拉伸的情况；一个就是根据不同的屏幕分辨率和设备像素比来尽可能选择高分辨率的图片，也就是当在小屏幕上不需要高清图或大图，这样我们用小图代替，就可以减少网络宽带了。
- 1.使用max-width(图片自适应) 图片自适应意思是图片能随着容器的大小进行缩放
```css
 img{
     display:inline-block;
     max-width:100%;
     height:auto;
 }
```
- 2.使用srcset 处理图片dir问题
```html
 <img srcset="photo_w350.jpg 1x,photo_w640.jpg 2x" src="地址" alt="" >
```
## 移动端需要注意什么
- 1、添加禁止浏览器主动缩放功能
```html
<meta name="viewport" content="width=device-width,user-scalable=no, initial-scale=1.0,minimum=1.0">
```
- 2、移动端1px的问题
  - 设备的物理像素(设备像素)和逻辑像素(css像素)可以使用viewport+rem或transform:scale(0.5)来实现。
- 3、移动端字体放大问题
  - 禁用html节点的字号自动调整。默认情况下，iPhone会将过小的字号放大，我们可以通过-webkit-text-size-adjust属性进行调整
```css
@media screen and (max-width:480px){
    html{
        -webkit-text-size-adjust:none
    }
    .main-nav a{
        font-size:90%;
        padding:10px 6px;
    }
}
```
## 布局都有什么方式，float和position有什么区别
- table/grid/flex/float/position
- 区别
```js
// 浮动会脱离文档流，并且会随着分辨率和窗口尺寸的变化而变化
// 浮动后面的元素如果是块级元素，会占据块级元素的文本位置，但会与块级元素背景和边框重叠
// 多个浮动不会产生重叠现象
// 会将块级元素和行内元素变为行内块元素
// >position：relative absolute fixed static 特性
// relative和static不会脱离文档流
// absolute和fixed会脱离文档流
// absolute根据relative定位。fixed根据body定位
// absolute和fixed会触发BFC
// 定位的优先级高于浮动
```
## CSS伪类和伪元素区别
- CSS伪类
  - 选择DOM树之外的信息,有状态,选择器比如 :hover :active :visited :first-child :focus
- CSS伪元素
  - DOM树没有定义的虚拟元素,选择器比如::before ::after 
- 相同之处
  - 伪类和伪元素都不会出现在源文件和DOM树中。也就是说在html源文件中是看不到伪类和伪元素的
- 不同之处
  - 伪类其实就是基于普通DOM元素而产生的不同状态，他是DOM元素的某一特征
  - 伪元素能够创建在DOM树中不存在的抽象对象，而且这些抽象对象是能够访问到的

## 简单说下你理解的语义化，怎样来保证你写的符合语义化？HTML5语义化标签了解下
- 而在html书写过程中，根据不同的内容使用合适的标签进行开发，即为语义化
- 一般的网站分为头部、导航、文章(或其他模块)、侧栏、底部，根据不同的部位，使用不同的标签进行书写。
- HTML5新增语义元素 article aside details figcaption figure footer> header main mark nav section summary time
- 优点：
  - 对搜索引擎友好
  - 其他开发者便于阅读代码
## 在css中link和@import的区别是什么
- link是属于html标签，而@import是css提供的
- 页面被加载时，link会同时加载，而@import引用的css会等到页面被加载完再加载
- import只在IE5以上才能识别，而link是html标签，无兼容问题
- link和@import，谁写在后面，谁的样式就被应用，后面的样式覆盖前面的样式

## CDN有哪些优化静态资源加载速度的机制
- CDN服务器使用高效的算法和数据结构，快速的检索资源和更新读取缓存；
- 网络优化：从OSI七层模型进行优化，达到网络优化的目的
- L1物理层：硬件设备升级提高速度
- L2数据链路层：寻找最快的网络节点，确保Lastmile尽量短
- L3路由层：路径优化，寻找两点间最优路径
- L4传输层：协议TCP优化，保持长连接、TCP快速打开
- L7应用层：静态资源压缩，请求合并

## 与HTTP相关的协议有哪些？TCP/IP DNS URI/URL HTTPS
- TCP/IP 是协议族
- DNS 把IP地址转换为便于人类记忆的协议的就是DNS 协议
- URI 统一资源标识符,URL 统一资源定位符
- HTTPS HTTPS在HTTP的基础上增加了SSL层，也就是说HTTPS = HTTP + SSL

## 说一下事件循环机制(node 浏览器)

## HTTP请求特征是什么？
- 无状态：HTTP协议是无状态协议。无状态是指协议对于事务处理没有记忆能力。缺少状态意味着如果后续处理需要前面的信息，则它必须重传，这样可能导致每次连接传送的数据量增大。另一方面，在服务器不需要前面信息时应答会很快。
- 无连接：限制每次连接只处理一个请求。服务器处理完客户的请求，并收到客户的应答后，即断开连接。采用这种方式可以节省传输时间
- 简单快速：客户向服务器请求服务时，只需传送方法和路径。请求方法常用的有GET、POST、HEAD。
- 灵活：HTTP允许传输任意类型的数据对象，正在传输的类型由Content-Type加以标记

## 浏览器缓存
### 强制缓存
- 在早期，也就是http/1.0时期，使用的是Expires，而http/1.1使用的是Cache-Contronl
- Expires 
  - Expries即过期的时间，存在于服务端返回的响应头中，告诉浏览器在这个过期时间之前可以直接从缓存里面获取数据，无需再次请求
- Cache-Control 
  - 在http1.1中，采用了一个非常关键的字段：Cache-Control。对应的字段是max-age
- 当Expires和Cache-Control同时存在的话，Cache-Control会优先考虑
```js
Expires: Wed, 22 Nov 2020 08:30:00 GMT
// 表示资源在2020年11月22号8点30分过期，过期了就得向服务端发送请求
// 这个方式看上去没什么问题，合情合理，但其实潜藏了一个坑，那就是服务器的时间和浏览器的时间可能并不一致，那服务器返回的这个过期时间可能就是不准确的，因此这种方式很快在后来的http/1.1版本就抛弃了。
Cache-Control:max-age=3600
// 代表这个响应返回后在3600秒，也就是一个小时之内可以直接使用缓存
```
### 协商缓存
- Last-Modified 
  - 最后的修改时间。如果再次请求，服务器拿到请求头中的If-Modified-Since的字段后，请求头中的这个值小于最后修改时间，说明是时候更新了。返回新的资源，跟常规的http请求响应的流程一样 否则返回304，告诉浏览器直接用缓存
- ETag
  - 是服务器根据当前文件的内容，给文件生成的唯一标识，只要里面的内容有改动，这个值就会变。并放到请求头中，然后发送给服务器 服务器接接收到If-None-Match后，会跟服务器上该资源的ETag进行对比： 如果两者不一样，说明要更新了。返回新的资源，跟常规的http请求响应的流程一样 否则返回304，告诉浏览器直接用缓存
- 如果两种方式都支持的话，服务器优先考虑ETag

## 缓存位置
- 当强缓存命中或者协商缓存中服务器返回304的时候，我们直接从缓存中获取资源。那么这些资源究竟缓存在什么位置呢？
- Service Worker
  - 既让js运行在主线程之外，由于它脱离了浏览器的窗体，因此无法直接访问DOM,其中的离线缓存就是Service Worker Cache
- MEmory Cache
  - 内存缓存,效率高,当渲染进程结束后，内存缓存也就不存在了
- Disk Cache
  - 磁盘缓存,从存取效率上讲是比内存缓存慢的，但是它的优势在于存储容量和存储时长。
  - 内存使用率比较高的时候，文件优先进入磁盘
- Push Cache
  - 推送缓存,当以上三种缓存都没有命中时，它才会被使用。它只在会话（Session）中存在，一旦会话结束就被释放，并且缓存时间也很短暂，它是http/2中的内容
