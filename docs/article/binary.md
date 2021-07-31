# 二进制
[[toc]]
## 十进制转二进制
- 整数部分:除2取余,直到商为0,最先得到的余数是最低位,最后的余数是高位
- 小数部分:乘2取整,直到积为0或者精确度要求为止,最先得到的整数是高位
- (3.5)10 = (11.1)2 
- 原码:二进制数,3个bit能表示8个数 +0+1+2+3-0-1-2-3,4正4负(最高位1即为负数,0为正数)
- 反码:正数不变,负数的除符号外其他位数取反
- 补码:正数不变,负数在反码的基础上加1(最高位要舍掉)
- 计算机 只有补码 一种,正数+他负数的补码=0,计算机中通过补码进行计算
```js
  // 负数的补码 + 正数的补码 = 0

  // 负数              正数
  // 原码  1 001011    0 001011
  // 反码  1 110100    1 110101
  // 补码  1 110101

  // 4     +   (-4)  = 0
  // 00100 +   10100 
  // 00100 +   11011(反码)
  // 00100 +   11100(补码)
```
<img :src="$withBase('/img/file.jpg')" >

## ArrayBuffer(最基本的)
- 8位 == 1个字节,ArrayBuffer字节数组(每个都是8位),他里面存放的就是字节
```js
// 8个字节*8个位 = 64位
let buffer = new ArrayBuffer(8)
```
## TypedArray 类型数据
```js
let buffer = new ArrayBuffer(8);// 8个字节的ArrayBuffer
const int8Array = new Int8Array(buffer)// 1个整数占据8个位 
console.log(int8Array.length)//  元素的长度8,1个字节占据8个位

console.log(int8Array.buffer === buffer)// true

const int16Array = new Int16Array(buffer)// 1个整数占据16个位 
console.log(int16Array.length)// 元素的长度4,1个字节占据16个位
```
## DataView 对象
- DataView 视图是一个可以从二进制ArrayBuffer对象中读写多种数值类型的底层接口
- setInt8()从DataView起始位置以byte为计数的指定偏移量(byteOffset)处储存一个8-bit数(一个字节)
- getInt8()从DataView起始位置以byte为计数的指定偏移量(byteOffset)处获取一个8-bit数(一个字节)
- DataView和TypeArray 内部都引用了buffer,buffer不能直接用
<img :src="$withBase('/img/DataView.jpg')" >

```js
const buffer = new ArrayBuffer(8);
// 创建一个8字节的 arrayBuffer
console.log(buffer.byteLength);//8个字节
const view1 = new DataView(buffer);
// 第一个 整数为8个字节 值为1
view1.setInt8(0, 1); // 0 是开始位子 存入1
console.log(view1.getInt8(0));//1
// 第二个 整数为8个字节 值为1
view1.setInt8(1, 2); // 1 是开始位子 跳过8个字节 存入2
// 读取第二个字节的时候  二进制位 0000 0010 为2
console.log(view1.getInt8(1));//2

// 读取 16位的时候 把图上面的2个二进制拼接上去  得到的是258
console.log(view1.getInt16(0));//258

console.log(view1.buffer === buffer)
```
## 字符&&base64 转化
- window.btoa && window.atob
  - 它存在window上
  - btoa 阔以将 字符串转化成一个base64
  - atob 将base64 转化成 字符串
```js
let rs =  btoa('xxx')
// rs 是一个base64字符串

let s = atob(rs)
// atob 把base64转成字符串 s==='xxx'
```
## FileReader && Blob/File 转化
-  FileReader函数, 读取Blob,他有3个读取的方式,分别生成ArrayBuffer,base64字符串,文本
  - readAsArrayBuffer生成的是 ArrayBuffer
  - readAsDataURL生成的是 base64字符串
  - readAsText生成的是 生成的是一个文本
```js
function readBlob(blob,type){
  return new Promise((resolve)=>{
    let reader = new FileReader()
    reader.onload = function(event){
      resolve(event.target.result)
    }
    switch(type){
      case 'ArrayBuffer':
      // readAsArrayBuffer生成的是 ArrayBuffer
        reader.readAsArrayBuffer(blob);
        break;
      case 'DataURL':
      // 二进制数据转换成可读的字符串 base64字符串
        reader.readAsDataURL(blob);
        break;
      case 'Text':
      // 生成的是一个文本
        reader.readAsText(blob,'utf-8');
        break;
      default:
        break;
    }
  })
}
readBlob(blob,'ArrayBuffer').then(rs=>{
  console.log('ArrayBuffer',rs)
})
readBlob(blob,'DataURL').then(rs=>{
  console.log('DataURL',rs)
})
readBlob(blob,'Text').then(rs=>{
  console.log('Text',rs)
})
```
## File && Blob 转换
### Blob=>File
- 用法
```js
var file = new File([blob], "foo.png", {
  type: "image/png",
});
```
### Blob=>File
```js
let blob = new Blob([file],{
    type:'image/png'
})
```
## Blob
- 文件传输,上传下载,都是 Blob格式
- Blob函数
- 构造函数 var aBlob = new Blob( array, options );
  - array 是一个由ArrayBuffer, ArrayBufferView, Blob, DOMString(js string) 等对象构成的 Array ，或者其他类似对象的混合体，它将会被放进 Blob。DOMStrings会被编码为UTF-8。
  - options 是一个可选的BlobPropertyBag字典
  - type 默认值为 "",它代表了将会被放入到blob中的数组内容的MIME类型

## OjectURL
- URL.createObjectURL
  - 可以获取当前文件的一个内存URL
  - 利用 DOMString 生成一个 blob 文件下载成json
```js
// DOMString
function download(){
    let data = 'xxxxx'
    let blob = new Blob([data],{type:'application/json'})
    let a = document.createElement('a')
      a.download = 'user.json'//下载名
      a.rel = 'noopener'
      a.href = URL.createObjectURL(blob)
      a.dispatchEvent(new MouseEvent('click'));
      URL.revokeObjectURL(blob);//销毁objectURL 也会销毁Blob
    console.log(blob,URL.createObjectURL(blob))
  }
```
- 利用上传图片下载
```js
<input type="file" onchange="handleChange(event)">
<button onclick="download()">下载</button>

<script>
  function download(data){
  let bytes = new ArrayBuffer(data.length)
  let arr = new Uint8Array(bytes)
  for(let i=0;i<data.length;i++){
    arr[i] = data.charCodeAt(i)
  }
  let blob = new Blob([arr],{type:'image/png'})
  let a = document.createElement('a')
    a.download = 'user.png'//下载名
    a.rel = 'noopener'
    // a.href = blob;
    a.href = URL.createObjectURL(blob)
    a.dispatchEvent(new MouseEvent('click'));
    URL.revokeObjectURL(blob);//销毁objectURL 也会销毁Blob
}
  function handleChange(e){
    let file = null;
    file = e.target.files[0];
    let fileReader = new FileReader()
      fileReader.onload = e =>{
        // atob 是一个全局方法
        // base64 必须要转换成 字符数 
        let bytes = atob(e.target.result.split(',')[1])
        download(bytes)
      }
      fileReader.readAsDataURL(file)
  }
</script>
```

## DataURL
- base64 字符串
### Blob生成DataURL
- DataURL阔以直接给img.src 使用
```js
function readBlob(blob,type){
  return new Promise((resolve)=>{
    let reader = new FileReader()
    reader.onload = function(event){
      resolve(event.target.result)
    }
    switch(type){
      case 'ArrayBuffer':
      // readAsArrayBuffer生成的是 ArrayBuffer
        reader.readAsArrayBuffer(blob);
        break;
      case 'DataURL':
      // 二进制数据转换成可读的字符串 base64字符串
        reader.readAsDataURL(blob);
        break;
      case 'Text':
      // 生成的是一个文本
        reader.readAsText(blob,'utf-8');
        break;
      default:
        break;
    }
  })
}
readBlob(blob,'ArrayBuffer').then(rs=>{
  console.log('ArrayBuffer',rs)
})
readBlob(blob,'DataURL').then(rs=>{
  console.log('DataURL',rs)
})
readBlob(blob,'Text').then(rs=>{
  console.log('Text',rs)
})
```
### input 上传的文件(图片,xlsx等)如何转换成 array
-  FileReader函数,他有3个读取的方式,分别生成`ArrayBuffer`,`base64字符串`,`文本`
-  input 上传文件就是一个 Blob
```js
function readBlob(blob,type){
  return new Promise((resolve)=>{
    let reader = new FileReader()
    reader.onload = function(event){
      resolve(event.target.result)
    }
    switch(type){
      case 'ArrayBuffer':
      // readAsArrayBuffer生成的是 ArrayBuffer
        reader.readAsArrayBuffer(blob);
        break;
      case 'DataURL':
      // 二进制数据转换成可读的字符串 base64字符串
        reader.readAsDataURL(blob);
        break;
      case 'Text':
      // 生成的是一个文本
        reader.readAsText(blob,'utf-8');
        break;
      default:
        break;
    }
  })
}
readBlob(blob,'ArrayBuffer').then(rs=>{
  console.log('ArrayBuffer',rs)
})
readBlob(blob,'DataURL').then(rs=>{
  console.log('DataURL',rs)
})
readBlob(blob,'Text').then(rs=>{
  console.log('Text',rs)
})
```
-  basr64 => ArrayBuffer => blob,下载图片
```html
  <input type="file" onchange="handleChange(event)">
  <button onclick="download()">下载</button>


  <script>
    function download(data){
    let bytes = new ArrayBuffer(data.length)
    let arr = new Uint8Array(bytes)
    for(let i=0;i<data.length;i++){
      arr[i] = data.charCodeAt(i)
    }
    let blob = new Blob([arr],{type:'image/png'})
    let a = document.createElement('a')
      a.download = 'user.png'//下载名
      a.rel = 'noopener'
      // a.href = blob;
      a.href = URL.createObjectURL(blob)
      a.dispatchEvent(new MouseEvent('click'));
      URL.revokeObjectURL(blob);//销毁objectURL 也会销毁Blob
  }
    function handleChange(e){
      let file = null;
      file = e.target.files[0];
      let fileReader = new FileReader()
        fileReader.onload = e =>{
          // atob 是一个全局方法
          // base64 必须要转换成 字符数 
          let bytes = atob(e.target.result.split(',')[1])
          download(bytes)
        }
        fileReader.readAsDataURL(file)
    }
  </script>
```
### Blob 转换 base64或者image
- URL.createObjectURL
- reader.readAsDataURL
```html
  <input type="file" onchange="handleChange(event)">
  <img src='' id='img'>
<script>
  function handleChange(e){
    let file = null;
    file = e.target.files[0];
    let url = URL.createObjectURL(file)
    img.src=  url
  }

  function handleChange(e){
    let file = null;
    file = e.target.files[0];
    let fileReader = new FileReader()
      fileReader.onload = e =>{
        img.src = e.target.result
        console.log(img.src)
      }
      fileReader.readAsDataURL(file)
  }
</script>
```
## Canvas
### imageData => canvas 应用
### canvas => imageData 应用
- 图片截图上传 对照上图的api进行
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body{
      display: flex;
    }
    .div1 img{
      border: 2px dashed green;
      width: 500px;
    }
    .div1{
      display: flex;
      width: 500px;
      flex-wrap: wrap;
    }
  </style>
</head>
<body>
    <div class="div1">
        <input type="file" accept="image/*" onchange="handleChange(event)">
        <img src="" alt="" id='img'>
    </div>

    <style>
      .div2{
        margin-left: 50px;
        position: relative;
      }
      #can{
        border: 2px dashed blue;
      }
      .divCenter{
        position: absolute;
        width: 100px;
        height: 100px;
        background: yellow;
        opacity: 0.3;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
      }
    </style>

    <div class="div2" onmousedown="handleMouseDown(event)" onmousemove="handleMouseMove(event)" onmouseup="handleMouseUp(event)">
      <canvas
        id="can"
        width="300px"
        height="300px"
      ></canvas>
      <div class="divCenter"></div>
      <div class="btn-group">
        <button type="button" onclick="bigger()">变大</button>
        <button type="button" onclick="smaller()">变小</button>
        <button type="button" onclick="confirm()">剪辑</button>
      </div>
    </div>

    <div class="div3">
      <img width="100px" src="" alt="" id='img1'>
      <button onclick="upload()">上传</button>
    </div>
    <script>
      let state = {
        timer:1,// 放大倍数
        startX:0,// 鼠标按下的开始X坐标
        startY:0,
        startDrag:false,//开始拖动
        lastX:0,// 上一次鼠标抬起的位子
        lastY:0,
        avatarDataURL:''
      }
      let img = document.querySelector('#img')
      let img1 = document.querySelector('#img1')
      let can = document.querySelector('canvas')
      upload = ()=>{
        // base64格式:类型+,+数据 
        // atob 转换的时候只能对base64的数据进行处理
        let bytes = atob(state.avatarDataURL.split(',')[1])

        let arrayBuffer = new ArrayBuffer(bytes.length)
        let uint8Array = new Uint8Array(arrayBuffer);
        for(let i=0;i<bytes.length;i++){
          uint8Array[i] = bytes.charCodeAt(i)
        }
        let blob = new Blob([uint8Array],{type:'image/png',ss:'xxx'});
        let xhr = new XMLHttpRequest
        let formData = new FormData();
        formData.append('avatar',blob)
        xhr.open('POST','http://localhost:4000/upload',true);
        xhr.send(formData);
      }
      
      bigger = ()=>{
        state.timer +=0.1 
        drawImage()
      }
      smaller = ()=>{
        state.timer -=0.1 
        drawImage()
      }
      confirm = (event)=>{
        let ctx = can.getContext('2d')
        // 复制画布上指定矩形的像素数据
        // canvas => imageData
        const imageData = ctx.getImageData(100,100,100,100)
        let avatar =  document.createElement('canvas')
        avatar.width =100
        avatar.height= 100
        let avatarCtx = avatar.getContext('2d');
        // 然后通过 putImageData() 将图像数据放回画布
        // imageData => canvas
        avatarCtx.putImageData(imageData,0,0)
        // base64
        let avatarDataURL = avatar.toDataURL()
        state.avatarDataURL = avatarDataURL
        img1.src = avatarDataURL
      }
      handleMouseDown = (event)=>{
        state.startX = event.clientX
        state.startY = event.clientY
        state.startDrag = true
      }
      handleMouseMove = (event)=>{
        // X仿效移动的量 Y方向移动的量
        if(state.startDrag)
        drawImage(
          event.clientX-state.startX+state.lastX,
          event.clientY-state.startY+state.lastY  )
      }
      handleMouseUp = (event)=>{
        state.startDrag = false
        state.lastX = event.clientX - state.startX +state.lastX
        state.lastY = event.clientY - state.startY +state.lastY
      }
      drawImage = (left=state.lastX,top=state.lastY)=>{
        let ctx = can.getContext('2d')
        ctx.clearRect(0,0,can.width,can.height)
        let imageWidth = img.width
        let imageHeight = img.height
        if(imageWidth>imageHeight){// 如果宽度比高度达 图片的宽度调整为canvas宽度
          let scale = can.width/imageWidth
          imageWidth = can.width*state.timer
          imageHeight = can.height*scale*state.timer
        }else{
          let scale = can.height/imageHeight
          imageHeight = can.height*state.timer
          imageWidth = can.width*scale*state.timer
        }
        // 画图片
        ctx.drawImage(img,(can.width-imageWidth)/2+left,(can.height-imageHeight)/2+top,imageWidth,imageHeight)
      }

      function handleChange(e){
        let file = e.target.files[0];
        let fileReader = new FileReader()
        fileReader.onload = e =>{
          img.src = e.target.result
          // 图片加载成功之后 执行回调 绘制canvas
          img.onload=()=>drawImage()
        }
        fileReader.readAsDataURL(file)
      }
    </script>
</body>
</html>
```
## 后台
- express
```js
// 图片上传
let express = require('express');
let multer = require('multer')
let fs = require('fs')
let cors = require('cors');
let path = require('path')
let app = express();
// 处理json格式的请求体
app.use(express.json());
// 处理表单格式的请求体
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// 文件上传 upload req.file获取文件的流   dest req.file 获取的保存路径
let upload = multer({ upload: 'upload/' })

app.post('/post', (req, res) => {
  let body = req.body
  console.log(body)
  res.send(body)
})
app.post('/form', (req, res) => {
  let body = req.body
  res.send(body)
})
// 只有一个文件类型的用upload.single('avatar') 处理
app.post('/upload', upload.single('avatar'), (req, res) => {
  // req.file 里面存放的文件类型的数据
  // req.body 里面存放的普通类型的数据
  if (req.file) {
    let rs = '.'+req.file.mimetype.match(/.+\/(.+)/)[1]
	console.log('rs', req.file);
	console.log('req.file.originalname', req.file.originalname);
    fs.writeFileSync(path.join(__dirname, `/${req.file.fieldname}${rs}`), req.file.buffer)
  }
  res.send(req.body)
})

// xls
app.post('/xls', upload.single('avatar'), (req, res) => {
  if (req.file) {
    fs.writeFileSync(path.join(__dirname, `/${req.file.fieldname}.xls`), req.file.buffer)
  }
  res.send(req.body)
})

app.listen(4000)
```