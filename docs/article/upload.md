# upload
[[toc]]
- [实现代码](git@github.com:xiaoqi7777/upload.git)
- 分支master 前端代码 技术react hooks+ts
- 分支back 后端代码 express
## 跑通前后端
- 文件上传 前后端都基于ts,前端采用的react+hooks,后端用的express
### 前端
- 利用react脚手架搭建一个前端项目
```js
/*
  create-react-app client --template=typescript
  cd create-react-app
  cnpm i antd -S
*/
// App.tsx
import React, { useState } from 'react';
import {request} from './utils'
function App() {
  let  [number,setNumber]=useState<number>(0)
  async function btn(){
   let rs = await request({
     url:'/test/123?a=1'
   })
   setNumber(1)
   console.log('rs',rs)
  }
  return (
    <div className="App">
      <button onClick={btn}>接口测试</button>
        app=> {number}
    </div>
  );
}
export default App;
// /utils/request
// 封装 ajax
export { };
interface OPTIONS{
  method?:string,
  url?:string,
  headers?:any,
  data?:any
}
export function request(options:OPTIONS){
  let defaultOptions = {
    method:'GET',
    headers:{},//请求头
    baseUrl:'http://localhost:8000',
    data:{}
  }
  options = {...defaultOptions,...options,headers:{...defaultOptions.headers,...(options.headers||{})}}
  return new Promise((resolve:Function,reject:Function)=>{
    let xhr = new XMLHttpRequest()
    xhr.open(options.method!,defaultOptions.baseUrl+options.url);
    xhr.responseType = 'json'
    xhr.onreadystatechange = function(){
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          resolve(xhr.response)
        }else{
          reject(xhr.response)
        }
      }
    }
    xhr.send(options.data)
  })
}
export { };
```
### 后端
- 利用express 搭建一个后端项目
- nodemon 监听文件变化 自动重启服务
```js
/*
  npx tsconfig.json
  cnpm i fs-extra express morgan http-errors http-status-codes cors  multer multiparty -S
  cnpm i @types/fs-extra @types/node   @types/express @types/morgan @types/http-errors cross-env typescript ts-node ts-node-dev nodemon @types/cors @types/multer @types/multiparty -D
*/

// package.json
// "dev":"cross-env PROT=8000 nodemon --exec ts-node --files src/www.ts"

// www.ts
import app from './app';
import http from 'http';

const port = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
function onError(error: any) {
  console.error(error);
}
function onListening() {
  console.log('Listening on ' + port);
}

// app.ts
import express,{Request,Response,NextFunction} from 'express';
import cors from 'cors';

let app = express()
app.use(cors())
app.get('/test/:name',(req:Request,res:Response,next:NextFunction)=>{
  let {name} = req.params;
  console.log(name,req.query)
  res.json({success:true})
  next()
})
export default app
```
## 搭建一个图片上传功能
- 利用multiparty解析图片
### 后端增加接口
```js
import express,{Request,Response,NextFunction} from 'express';
import multiparty from 'multiparty';
import cors from 'cors';
// 把原生的fs包装加强
import fs from 'fs-extra';
import path from 'path';
const PUBLIC_DIR = path.resolve(__dirname,'public')
let app = express()
app.use(cors())
// 测试接口
app.get('/test/:name',(req:Request,res:Response,next:NextFunction)=>{
  let {name} = req.params;
  console.log(name,req.query)
  res.json({success:true})
  next()
})
// 图片上传 利用multiparty
app.post('/upload',(req:Request,res:Response,next:NextFunction)=>{
  let form = new multiparty.Form();
  form.parse(req,async(err:any,fields,files)=>{
    if(err){
      return next(err)
    }
    let filename = fields.chunk_name[0];//xxx.jpg
    let chunk = files.chunk[0];// 文件流
    console.log('fields',filename)
    console.log('files',chunk)
    await fs.move(chunk.path,path.resolve(PUBLIC_DIR,filename));
    res.json({success:true})
  })
})
export default app
```
### 前端
- 1、预览图片 
  - `window.URL.createObjectURL(file)` 这个方法可以将传入的图片对象 生成一个图片地址,会导致内存泄露,慎用
  - `FileReader`,reader.addEventListener 也可以获取图片的地址
- 2、图片上传
  -  `FormData`h5的api 这个和html的 form 传递是一样的,通过append添加即可
```js
// Upload.tsx
import React, { ChangeEvent, useState,useEffect } from 'react';
import { Row, Col, Input, Button, message } from 'antd'
import { request } from './utils'

function Upload() {
  let [currentFile, setCurrentFile] = useState<File>();
  let [objectURL,setObjectURL] = useState<string>();
  // 图片预览
  useEffect(()=>{
    if(!currentFile) return
    // 1、会导致内存泄露
    // let objectURL = window.URL.createObjectURL(currentFile)
    // setObjectURL(objectURL)
    // return () => window.URL.revokeObjectURL(objectURL)
    // 2、建议用这个
    const reader = new FileReader()
    reader.addEventListener('load',() => setObjectURL(reader.result as string))
    reader.readAsDataURL(currentFile);
  },[currentFile])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    // event.target.files![0] 就是上传文件的信息
    setCurrentFile(event.target.files![0])
  }
  async function handleUpload() {
    if (!currentFile) {
      return message.error(`你尚未选择文件`)
    }
    if (!allowUpload(currentFile)) {
      return message.error(`不支持本类型文件上传`)
    }
    let formData = new FormData()
    formData.append('chunk',currentFile)
    formData.append('chunk_name',currentFile.name)
    let result = await request({
      url:'/upload',
      method:'POST',
      data:formData
    });
    console.log('result',result)
    message.info('上传成功');
  }
  return (
    <>
      <Row>
        {/* 按钮点击 */}
        <Col span={12}>
          <Input type='file' style={{ width: 300 }} onChange={handleChange}></Input>
          <Button type="primary" onClick={handleUpload} style={{ marginLeft: 10 }}>上传图片</Button>
        </Col>
        {/* 图片预览 */}
        <Col span={12}>
          {objectURL && <img src={objectURL} style={{width:100}} alt='视频'/>}
        </Col>
      </Row>
    </>
  )
}
// 限制图片上传条件
function allowUpload(currentFile: File) {
  let fileType = currentFile.type;// type: "image/jpeg"
  let validFileTypes = ["image/jpeg", "image/png", "image/gif", "video/mp3"]
  let isLessThan2G = currentFile.size < 1024 * 1024 * 1024 * 2
  return validFileTypes.includes(fileType) && isLessThan2G
}
export default Upload
```
## 切片&&合并
- 视频/图片上传 遇到大文件 一般是前端进行切断处理,然后在分段传给后端处理
### node版本的切片
- 切片 读文件 循环写入文件 每次写入的大小自定义 用slice来切割流文件
- 合并 读文件 读取一个一个的片段 利用pipe 读一个片段就写一份内容
```js
// utils.ts
import path from 'path';
import fs, { WriteStream } from 'fs-extra';
const DEFAULT_SIZE = 1024 * 256;
export const PUBLIC_DIR = path.resolve(__dirname,'public')
export const TEMP_DIR = path.resolve(__dirname,'temp')

// 切片
// 读文件 循环写入文件 每次写入的大小自定义 用slice来切割流文件
export async function splitChunks(filename:string,size:number=DEFAULT_SIZE){
  // 读流
  const filePath = path.resolve(__dirname,filename)
  const content =await fs.readFile(filePath)
  // 写入的地址
  const chunksDir = path.resolve(TEMP_DIR,filename)
  // 创建文件
  await fs.mkdirp(chunksDir)
  let current=0;
  let length=content.length;
  let i = 0;
  while(current<length){
    await fs.writeFile(
      path.resolve(chunksDir,filename+'_'+i),
      content.slice(current,current+size)
    )
    i++;
    current+=size
  }
}
// splitChunks('2000574.jpg')

function pipeStream(filePath:string,ws:WriteStream){
  return new Promise(async(resolve:Function,_reject:Function)=>{
    let rs = fs.createReadStream(filePath)
    rs.on('end',async()=>{
      await fs.unlink(filePath)
      resolve()
    })
    rs.pipe(ws)
  })
}
// 合并
export const mergeChunks = async (filename:string, size:number = DEFAULT_SIZE) => {
  let filePath = path.resolve(PUBLIC_DIR,filename)
  let chunksDir = path.resolve(TEMP_DIR,filename)
  // fs.readdir 读目录
  const chunkFiles = await fs.readdir(chunksDir);
  chunkFiles.sort((a:any,b:any)=>Number(a.split('_')[1])-Number(b.split('_')[1]))
  // 合并
  await Promise.all(chunkFiles.map((chunkFile:string,index:number) => pipeStream (
    path.resolve(chunksDir,chunkFile),
    fs.createWriteStream(filePath,{
      start:index * size
    })
  )))
  // 删除目录
  await fs.rmdir(chunksDir)
}
mergeChunks('2000574.jpg')
```
## 断点续传
- [FileReader](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader) `实例.readAsArrayBuffer()`用来读取文件 `实例.onload=(event)=>{console.log(event.target.result)}`onload 加载完成 文件里的文本会在这里被打印出来
- XMLHttpRequest对象用到的方法
  - `xhr.upload.onprogress = ()=>{}`(xhr.upload 上传的过程有onprogress onprogress等处理事件),xhr每次上传的时候 执行传递过来的方法,让页面的进度条定期修改
  - `xhr.abort()` 如果请求已被发送，则立刻中止请求。如果继续接着调用之前的传递数据接口
- worker的用法
  - 他是多线程
  - `let worker = new Worker('/hash.js')`通过 worker.postMessage(data) 给另外一端传递数据,worker.onmessage=()=>{} 可以监听到另外一端传递过来的数据
  - `hash.js 文件`self.onmessage=()=>{} 监听到数据, 同样self.postMessage(data) 给外面发数据 
- 断点续传流程
  - 前端：
    - 1、前端上传图片到浏览器,进行片段切割,切割方法`createChunks`利用slice方法进行切片,
    - 2、利用`worker`多线程 去计算hash值, 切片后再计算hash是为了速度,若是文件特别大的时候计算就相当耗时`buffers.forEach(buffer => spark.append(buffer))`
    - 3、等待hash计算好之后,将总片段进行包装,加入`filename`&&`chunk_name`等值,主要`chunk_name`这个是单个切片的名字,他是有hash+数组中顺序的位子,在和切片的时候用到
    - 4、上传总切片,要校验当前的切片是否是续传,已经上传完成,则提示秒传成功,退出。若只传递了部分或者没有传递,则获取已经传递的信息,通过现在的总切片数据进行过滤,保留剩下没有传递的chunk,上传数据
    - 5、等待所有的数据上传之后,告诉服务器可以合并切片
    - 6、增加暂停按钮需要数据,在发送数据的时候,将回调函数传递过去`(xhr:XMLHttpRequest) => part.xhr = xhr`,把xhr实例赋到当前切片内,等按钮触发暂停的时候,遍历当前的切片获取到xhr实例,调用`xhr.abort()`停止发送
    - 6、恢复直接把当前的切片发送给后端,既可
  - 后端:
    - 文件片段传递到后端,他会先放到临时区域,等待前端发送合并片段的指令,此时后端将所有临时的片段合成完成的文件放到指定的区域,删除临时区域的所有文件
    - 接口1、`/verify/:filename`是否发生断点续传。第一个用hash值去文件保存的区域内查看文件是否存在,存在即之前已经上传成功。第二个去看临时区域内是否有hash值的的临时文件,若有则说明之前已经传递了部分数据,读取数据大小返回给前端既可以。若都没有则说明之前没传递过任何信息
    - 接口2、`/upload/:filename/:chunk_name/:start`上传文件，利用了node的 pipe双工流,`req.pipe(ws)` 创建可写流`fs.createWriteStream(chunkFilePath, {start,flags:'a'})`往临时文件内写 `start`是开始位子，每写入一个片段位子都在变化，就是他的长度,`flags`为a 则是追加的意思。最后要注意 监控可写流完成/关闭的时候关闭
    - 接口3、`/merge/:filename`合并所有的片段,到制定的文件夹内
### 前端切断
```js
// hash.js
  // self固定写法 代表当前窗口
  self.importScripts('https://cdn.bootcss.com/spark-md5/3.0.0/spark-md5.js');

  self.onmessage = async function(event){
    // partList 保存在所有的切片
    let {partList} = event.data
    const spark = new self.SparkMD5.ArrayBuffer()
    // 计算总体的hash百分比
    let percent = 0;
    // 每次计算完一个part 相当于完成了百分之几
    let perSize = 100/partList.length;
    let buffers = await Promise.all(partList.map(({chunk,size})=>new Promise((resolve)=>{
      // h5读取文件
      const reader = new FileReader()
      reader.readAsArrayBuffer(chunk)
      // 加载完成
      reader.onload = function(event){
        percent += perSize
        self.postMessage({percent:Number(percent.toFixed(2))})
        resolve(event.target.result)
      }
    })))
    buffers.forEach(buffer => spark.append(buffer))
    self.postMessage({percent:100,hash:spark.end()})
    self.close();
  }
// Upload.tsx
import React, { ChangeEvent, useState,useEffect } from 'react';
import { Row, Col, Input, Button, message, Progress, Table } from 'antd'
import { request } from './utils'
const DEFAULT_SIZE = 1024 * 1024 * 20
enum UploadStatus{
  INIT,
  PAUSE,
  UPLOADING
}
interface Part{
  chunk:Blob;
  size:number;
  filename?:string;
  chunk_name?:string;
  loaded?:number;
  percent?:number;
  xhr?:any;
}
interface Upload{
  filename:string;
  size:number
}
function Upload() {
  let [uploadStatus,setUploadStatus] = useState<UploadStatus>(UploadStatus.INIT)
  let [currentFile, setCurrentFile] = useState<File>();
  let [objectURL,setObjectURL] = useState<string>();
  let [hashPercent,setHashPercent] = useState<number>(0);
  let [filename,setFilename] = useState<string>();
  // PartList 存放切片的数据
  let [partList,setPartList] = useState<Part[]>([]);
  useEffect(()=>{
    if(!currentFile) return
    const reader = new FileReader()
    reader.addEventListener('load',() => setObjectURL(reader.result as string))
    reader.readAsDataURL(currentFile);
  },[currentFile])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    // event.target.files![0] 就是上传文件的信息
    setCurrentFile(event.target.files![0])
  }
  async function handleUpload() {
    if (!currentFile) {
      return message.error(`你尚未选择文件`)
    }
    if (!allowUpload(currentFile)) {
      return message.error(`不支持本类型文件上传`)
    }
    // 弹出进度条
    setUploadStatus(UploadStatus.UPLOADING)
    // 分片上传 createChunks根据切片的大小 将文件进行切割
    let partList:Part[] = createChunks(currentFile)
    // 将切割的文件 上传 hash计算 利用Worker创建一个子经常进行计算
    let fileHash = await calculateHash(partList)
    let lastDoIndex = currentFile.name.lastIndexOf('.')
    let extName = currentFile.name.slice(lastDoIndex)
    let filename = `${fileHash}${extName}`
    setFilename(filename)
    partList = partList.map(({chunk,size,loaded,percent},index)=>({
      filename, // hash.jpg
      chunk_name:`${filename}-${index}`,
      chunk,
      size,
      loaded:0,
      percent:0
    }))
    setPartList(partList);
    console.log('所有的切片集合',partList)
    await uploadParts(partList,filename)
  }
  function calculateHash(partList:Part[]){
    return new Promise((resolve:Function,reject:Function)=>{
      // /hash.js 他会找public/hash的位子
      let worker = new Worker('/hash.js')
      worker.postMessage({partList})
      worker.onmessage = function(event){
        let {percent,hash} = event.data
        setHashPercent(percent)
        // 有hash 就说明切割完成
        if(hash){
          resolve(hash)
        }
      }
    })
  }
  // verify 功能就是查看数据是否上传完成  已经返回已上传的数据大小 和 名字(当刷新页面的时候 会接着传递)
  async function verify(filename:string){
    return  request({
      url:`/verify/${filename}`,
      method:'get'
    })
  }
  async function uploadParts(partList:Part[],filename:string){
    // partList 是所有的切片
    // uploadList 已经上传过的所有信息
    let data = await verify(filename)
    console.log('uploadList',data)
    let  { needUpload,uploadList } = data

    console.log('needUpload',needUpload)
    if (!needUpload){
      reset()
      return message.success('秒传成功')
    }
    // uploadList 已经上传的数据包信息
    // partList 总的数据包
    let requests = createRequests(partList,uploadList,filename)
    await Promise.all(requests)
    await request({
      url:`/merge/${filename}`,
      method:'GET'
    })
    message.success('上传成功');
    reset();
  } 
  function reset() {
    setUploadStatus(UploadStatus.INIT);
    setHashPercent(0);
    setPartList([]);
    setFilename('');
  }
  function createRequests(partList:Part[],uploadList:Upload[],filename:string){
    return partList.filter((part:Part)=>{
      part.loaded = part.loaded?part.loaded:0;
      // uploadList 已经上传过的列表
      let uploadFile = uploadList.find(item=>item.filename === part.chunk_name);
      // 没有上传过 直接退出
      if(!uploadFile){
        part.loaded = 0;// 已经上传的字节数0
        part.percent = 0;// 已经上传的百分比就是0 分片上传过的半分比就是0
        return true
      }
      // 过滤已经上传过的
      if(uploadFile.size < part.chunk.size){
        part.loaded = uploadFile.size;// 已经上传的字节数0
        part.percent = Number((part.loaded/part.chunk.size * 100).toFixed(2));// 已经上传的百分比就是0 分片上传过的半分比就是0
        return true
      }
      return false
    }).map((part:Part)=>request({
      url:`/upload/${filename}/${part.chunk_name}/${part.loaded}`,
      method:'POST',
      // application/octet-stream 字节流
      headers:{'Content-Type':'application/octet-stream'},
      // 在发送请的时候 将xhr保存在partList中
      setXHR:(xhr:XMLHttpRequest) => part.xhr = xhr,
      onProgress: (event:ProgressEvent) => {
        part.percent = Number(((part.loaded! + event.loaded!)/part.chunk.size*100).toFixed(2))
        // 页面刷新
        setPartList([...partList])
      },
      data:part.chunk
    })
    )
  }
  // 暂停
  function handlePause(){
    // 如果请求已被发送，则立刻中止请求。
    partList.forEach((part:Part) => part.xhr && part.xhr.abort())
    setUploadStatus(UploadStatus.PAUSE)
  }
  // 恢复
  async function handleResume(){
    setUploadStatus(UploadStatus.UPLOADING)
    // 发送请求
    await uploadParts(partList,filename!) 
  }
  // 总进度
  let totalPercent = partList.length>0 ? partList.reduce(
    (a:number,b:Part)=>a+b.percent!,0)/partList.length  :0

  const columns = [
    {
      title:'切片名称',
      dataIndex:"filename",
      key:"filename",
      width:"20%"
    },
    {
      title:'进度',
      dataIndex:"percent",
      key:"percent",
      width:"80%",
      render:(value:number)=>{
        return <Progress percent={value} />
      }
    }
  ]
  let uploadProgress = uploadStatus !== UploadStatus.INIT ? (
    <>
     <Row>
        <Col span={4}>
          HASH总进度
        </Col>
        <Col span={20}>
          <Progress percent={hashPercent}/>
        </Col>
      </Row>
      <Row>
        <Col span={4}>
          总进度
        </Col>
        <Col span={20}>
          <Progress percent={totalPercent}/>
        </Col>
      </Row>
      <Table 
        columns= {columns}
        dataSource = {partList}
        rowKey={row => row.chunk_name!}
      />
    </>
  ):null;
  return (
    <>
      <Row>
        {/* 按钮点击 */}
        <Col span={12}>
          <Input type='file' style={{ width: 300 }} onChange={handleChange}></Input>
          <Button type="primary" onClick={handleUpload} style={{ marginLeft: 10 }}>上传图片</Button>
          {
            uploadStatus === UploadStatus.UPLOADING && <Button type="primary" onClick={handlePause} style={{marginLeft:10}}>暂停</Button>
          }
          {
            uploadStatus === UploadStatus.PAUSE && <Button type="primary" onClick={handleResume} style={{marginLeft:10}}>恢复</Button>
          }
        </Col>
        {/* 图片预览 */}
        <Col span={12}>
          {objectURL && <img src={objectURL} style={{width:100}} alt='视频'/>}
        </Col>
      </Row>
      {uploadProgress}
    </>
  )
}
function allowUpload(currentFile: File) {
  let fileType = currentFile.type;// type: "image/jpeg"
  let validFileTypes = ["image/jpeg", "image/png", "image/gif", "video/mp3", "video/avi"]
  let isLessThan2G = currentFile.size < 1024 * 1024 * 1024 * 2
  return validFileTypes.includes(fileType) && isLessThan2G
}
function createChunks(file:File):Part[]{
  let current = 0
  let partList:Part[] = []
  while(current<file.size){
    let chunk = file.slice(current,current+DEFAULT_SIZE)
    partList.push({chunk,size:chunk.size})
    current += DEFAULT_SIZE
  }
  return partList
}
export default Upload
// utils.tsx
export { };
interface OPTIONS{
  method?:string,
  url?:string,
  headers?:any,
  data?:any,
  onProgress?:any,
  setXHR?:any
}
export function request(options:OPTIONS):Promise<any>{
  let defaultOptions = {
    method:'GET',
    headers:{},//请求头
    baseUrl:'http://localhost:8000',
    data:{}
  }
  options = {...defaultOptions,...options,headers:{...defaultOptions.headers,...(options.headers||{})}}
  return new Promise((resolve:Function,reject:Function)=>{
    let xhr = new XMLHttpRequest()
    xhr.open(options.method!,defaultOptions.baseUrl+options.url);
    xhr.responseType = 'json'
    // xhr.upload 指上传的过程 onprogress onprogress处理事件
    xhr.upload.onprogress = options.onProgress
    xhr.onreadystatechange = function(){
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          console.log('1')
          resolve(xhr.response)
        }else{
          console.log('2')
          reject(xhr.response)
        }
      }
    }
    if(options.setXHR){
      options.setXHR(xhr);
    }
    xhr.send(options.data)
  })
}
export { };
```
### 后端接口对应
```js
// app.ts
import express,{Request,Response,NextFunction} from 'express';
import multiparty from 'multiparty';
import cors from 'cors';
import {INTERNAL_SERVER_ERROR} from 'http-status-codes';//500
import createError from 'http-errors';
import {mergeChunks, PUBLIC_DIR,TEMP_DIR} from './utils'
// 把原生的fs包装加强
import fs from 'fs-extra';
import path from 'path';

let app = express()
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.resolve(__dirname,'public')));

// 测试接口
app.get('/test/:name',(req:Request,res:Response,next:NextFunction)=>{
  let {name} = req.params;
  console.log('==>',name)
  res.json({success:true})
  next()
})
// 图片上传 利用multiparty
app.post('/upload',(req:Request,res:Response,next:NextFunction)=>{
  let form = new multiparty.Form();
  form.parse(req,async(err:any,fields,files)=>{
    if(err){
      return next(err)
    }
    let filename = fields.chunk_name[0];//xxx.jpg
    let chunk = files.chunk[0];// 文件流
    await fs.move(chunk.path,path.resolve(PUBLIC_DIR,filename));
    res.json({success:true})
  })
})
app.post('/upload/:filename/:chunk_name/:start',async function(req:Request, res:Response, _next:NextFunction){
  let { filename, chunk_name } = req.params; 
  let start:number = Number(req.params.start)
  let chunk_dir = path.resolve(TEMP_DIR,filename)  
  let exist = await fs.pathExists(chunk_dir)
  if(!exist){
    await fs.mkdirs(chunk_dir)
  } 
  let chunkFilePath = path.resolve(chunk_dir,chunk_name)
  // start 0 开始写入的位子 
  // flags 'a' 追加的意思
  let ws = fs.createWriteStream(chunkFilePath, {start,flags:'a'})
  req.on('end',()=>{
    ws.close()
    res.json({success:true})
  })
  req.on('error',()=>{
    ws.close()
  })
  req.on('close',()=>{
    ws.close()
  })
  req.pipe(ws);
})
// 每次先计算hash值
app.get('/verify/:filename',async function(req:Request, res:Response, _next:NextFunction):Promise<any>{
  let { filename } = req.params;
  let filePath = path.resolve(PUBLIC_DIR,filename)
  let exitFile = await fs.pathExists(filePath)
  console.log('文件是否合并',exitFile)
  // 只有传完 才会进去这 因为只有最后一个hash进行合并的时候 `PUBLIC_DIR`才会有数据
  if (exitFile){
    // 已经完整上传过了
    res.json ({
      success:true,
      needUpload:false,// 因为已经上传过了,所以不在上传了,可以实现秒传
    })
    return
  }
  // 片段
  let tempDir = path.resolve(TEMP_DIR,filename);
  let exist = await fs.pathExists(tempDir)
  let uploadList:any[] = []
  // 如果已经传入了片段 
  if (exist) {
    uploadList = await fs.readdir(tempDir)
    uploadList = await Promise.all(uploadList.map(async (filename:string)=>{
      // 读取 已经上传的文件信息 返回
      let stat = await fs.stat(path.resolve(tempDir, filename));
      return {
        filename,
        size:stat.size //现在的文件大小 
      }
    }))
  }
  res.json({
    success:true,
    needUpload:true,
    uploadList// 已经上传的文件列表
  })
})
app.get('/merge/:filename',async function(req:Request, res:Response, _next:NextFunction){
  let { filename } = req.params
  await mergeChunks(filename)
  res.json({success:true})
})
// 没有路由匹配 会进入这
app.use(function (_req:Request, _res:Response,next:NextFunction){
  next(createError(404))
})
// 错误中间件
app.use(function( error:any, _req:Request, res:Response, _next:NextFunction){
  res.status(error.status || INTERNAL_SERVER_ERROR)
  res.json({
    success:false,
    error
  });
});
export default app
```