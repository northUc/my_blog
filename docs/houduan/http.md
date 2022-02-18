# http
[[toc]]

## http
- http创建 简易服务
- http.get 发送get请求
  - let http = require('http')
  - let app = http.createServer(function(req,res){})
  - app.listen(80)})
```js
let http = require('http')

//req 相当于是客户端的请求  可读流
//res 是代表响应的东西      可写流
http.createServer(function(req,res){
  // 设置请求头
  res.setHeader('Access-Control-Allow-Orign','*')
  console.log(req.method)
  //请求头 都是小写 content-type
  console.log(req.headers) // 是一个对象

  //怎么获取 传递过来的请求体
  //相当于取请求体 取数据  也就是 req是可读流   on('data')
  //没有请求体 不会触发data事件
  let arr = []
  req.on('data',function(data){
    arr.push(data)
      console.log('获取到的请求体',data)
  })
  req.on('end',function(data){
    console.log(Buffer.concat(arr).toString())
    // res.write('hello')
    // res.end(); //表示结束了
    res.statusCode = 200
    res.end('hello')// 他会先调用write写入 在调end返回
  })
}).listen(3000,'localhost',function(data){
  console.log('3000端口启动了')
})
```
### requset
- 创建一个客户端
```js
let client = http.request({
  host:'localhost',
  method:'post',
  port:3000,
  path:'/user',
  headers:{
    name:'zfpx'
  }
},function(){

})
// 请求体
client.end('age=9')
```

## url
<img :src="$withBase('/img/httpurl.png')" >
- 格式：http://user:pass@wwww.example.jp:80/dir/index.html?uid=1#ch1
- http 协议，user:pass 登陆信息，wwww.example.jp 服务器地址，80 端口号，dir/index.html 文件路径，uid查询参数,ch1 hash发送的时候 后台拿不到

## 状态码
| 类别 | 原因短语 |
| ------------- |:-------------:| -----:|
| 1XX |	Informational(信息性状态码)	|
| 2XX |	Success(成功状态码)	|
| 3XX |	Redirection(重定向)	|
| 4XX |	Client Error(客户端错误状态码)	|
| 5XX	| Server Error(服务器错误状态吗) |

### 2xx 成功
- 200(OK 客户端发过来的数据被正常处理
- 204(Not Content 正常响应，没有实体
- 206(Partial Content 范围请求，返回部分数据，响应报文中由Content-Range指定实体内容

### 3XX 重定向 
- 301(Moved Permanently) 永久重定向
- 302(Found) 临时重定向，规范要求方法名不变，但是都会改变
- 303(See Other) 和302类似，但必须用GET方法
- 304(Not Modified) 状态未改变 配合(If-Match、If-Modified-Since、If-None_Match、If-Range、If-Unmodified-Since)
- 307(Temporary Redirect) 临时重定向，不该改变请求方法

### 4XX 客户端错误
- 400(Bad Request) 请求报文语法错误
- 401 (unauthorized) 需要认证
- 403(Forbidden) 服务器拒绝访问对应的资源
- 404(Not Found) 服务器上无法找到资源

### 5XX 服务器端错误 
- 500(Internal Server Error)服务器故障
- 503(Service Unavailable) 服务器处于超负载或正在停机维护

## 首部


## tcp
- 优化策略
### 滑动窗口
- tcp 是全双工, 客户端和服务端 都有自己的缓存区域, 会根据网络调整发送数据的多少, 数据是乱序发送的,当接受到某个包,可能之前的包没有收到,此时需要等待前面序号的包到了才可以(队头堵塞)
- 如果某个数据丢包了  那需要重新发送(超时重传 RTO) 
- 当接收方的缓存区满了 每隔一段时间 发送方会 会发送一个探索包 来询问能否调整窗口大小，同时上层协议消耗掉了接收方的数据,接收方也会主动通知发送方调整窗口 继续发送数据
- 一帧 大 概1500 个字节: ip 20字节 tcp头 20字节  tcp剩下的 1460字节
- 问题: 每次去咨询窗口大小 都会发送一次请求 比较浪费 性能差

### 粘包
- nagle 算法 在同一时间内，最多只能有一个未被确认的小段 (TCP 内部控制) node 默认用它
  - 发送和确认的很快 nagle无法控制到
- cork算法(粘包) 当达到最大值时统一进行发送(此时就是帧的大小 - ip头  - tcp头 = 1460个字节) 理论值

### 拥塞处理
- 拥塞处理 快重传 快恢复(Reno算法)
  - 快重传: 可能在发送的过程中出现丢包现象,此时不要立即回退到慢阶段开始,而是对已接受到的报文进行重复确认,如果达到3次,则立即进行重复传, 快恢复算法(减少超时重传机制出现),降低cwnd的频率
  - 先从指数增长,达到一定的值,在线性增长
  - 恢复成原来的一半

## http的一些问题
- TCP顺序问题 后面的包先到达需要等待前面的包返回之后才可以继续传输(队头堵塞问题)
- 慢启动的过程 非常消耗性能
- time-wait 客户端链接服务器最后不会立即断开 在高并发 短链接的情况下啊 会出现端口全被占用

## http/1.1 (纯文本协议,安全问题 明文 => https)
- 基于tcp 传输层 半双工通讯(请求应答模式),http 默认是无状态(默认tcp 不能在没有应答完成后复用tcp 通道继续发送消息)
- tcp的规范 就是固定的组成结构
  - 请求行  响应行  请求行 响应行 主要的目的就说是描述我要做什么事  服务端告诉客户端ok
  - 请求头  响应头  描述我们传输的数据内容 自定义我们的header (http中自己所做的规范)
  - 请求体  响应体  两者的数据

## 请求头和 响应头
- 客户端    服务端
- Accept   Content-Type  数据类型
- Accept-encoding  Content-Encoding  发的数据是用什么格式压缩(gzip,deflate,br)
- Accept-language   语言
- Range    Content-Range  范围请求数据


- 核心在于内容协商
- http 实现长链接 会默认在请求的时候 增加 connection:keep-alive, connection:close 复用tcp通道传递数据(必须在一次请求应答后才能复用) (队头阻塞 http1.1中的)
- 多个请求
 ## 管线化方式传递数据
- 我们针对每个域名 分配6 个 tcp 通道(域名分片 域名不宜过多,过多会导致dns解析大量域名)
- 问题在与 虽然请求是并发的但是 应答依然是按顺序 (管道的特点就是先发送的先回来) (队头阻塞 http1.1中的)

## 可以采用cookie使用用户身份
## 协商缓存