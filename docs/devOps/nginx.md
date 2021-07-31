# nginx 
[[toc]] 


## 安装
- 安装模块
- yum  -y install gcc gcc-c++ autoconf pcre pcre-devel make automake
- yum  -y install wget httpd-tools vim
- [nginx安装文档](http://nginx.org/en/linux_packages.html#stable)
## CentOS下YUM安装
```js 
vim 
    /etc/yum.repos.d/nginx.repo

写入:
    [nginx]
    name=nginx repo
    baseurl=http://nginx.org/packages/centos/7/$basearch/
    gpgcheck=0
    enabled=1

运行
    yum install nginx -y
    nginx -v
```
## nginx 架构
- Nginx 采用的是多进程(单线程)和多路IO复用模型
- 源代码只包含核心模块
- 其它非核心功能都是通过模块实现，可以自由选择
### 工作流程
- 1、Nginx 在启动后，会有一个 master 进程和多个相互独立的 worker 进程。
- 2、接收来自外界的信号,向各worker进程发送信号,每个进程都有可能来处理这个连接。
- 3、master 进程能监控 worker 进程的运行状态，当 worker 进程退出后(异常情况下)，会自动启动新的 worker 进程。
- worker 进程数，一般会设置成机器 cpu 核数。因为更多的worker 数，只会导致进程相互竞争 cpu，从而带来不必要的上下文切换
- 使用多进程模式，不仅能提高并发率，而且进程之间相互独立，一个 worker 进程挂了不会影响到其他 worker 进程
## 安装目录
- 查看nginx安装的配置文件和目录
```yaml
rpm -ql nginx
```
```yaml
--prefix=/etc/nginx //安装目录
--sbin-path=/usr/sbin/nginx //可执行文件
--modules-path=/usr/lib64/nginx/modules //安装模块
--conf-path=/etc/nginx/nginx.conf  //配置文件路径
--error-log-path=/var/log/nginx/error.log  //错误日志
--http-log-path=/var/log/nginx/access.log  //访问日志
--pid-path=/var/run/nginx.pid //进程ID
--lock-path=/var/run/nginx.lock //加锁对象
```
## 日志切割文件
- /etc/logrotate.d/nginx
- 对访问日志进行切割
```yaml
/var/log/nginx/*.log {
    create 0640 nginx root
    # 每天 切割一份日志
    daily
    rotate 10
    missingok
    notifempty
    compress
    sharedscripts
    postrotate
        /bin/kill -USR1 `cat /run/nginx.pid 2>/dev/null` 2>/dev/null || true
    endscript
}
```
### 日志存放
- 默认情况下 日志都存放在 => `/var/log/nginx`
### 日志类型
- /var/log/nginx/access.log 访问日志
- /var/log/nginx/error.log 错误日志
### 内置变量

| 名称        | 含义           | 
| ----------- | :----------|
|$remote_addr |	客户端地址 |
|$remote_user |	客户端用户名称 |
|$time_local |	访问时间和时区 |
|$request |	请求的URI和HTTP协议 |
|$http_host |	请求地址，即浏览器中你输入的地址（IP或域名）|
|$status |	HTTP请求状态 |
|$body_bytes_sent |	发送给客户端文件内容大小 |
### HTTP请求变量
- 注意要把-转成下划线,比如User-Agent对应于$http_user_agent
|名称 |	含义 |	例子|
| ----------- | :----------|
|arg_PARAMETER |	请求参数 |	$arg_name |
|http_HEADER |	请求头 |	$http_referer $http_host $http_user_agent $http_x_forwarded_for(代理过程) |
|sent_http_HEADER |	响应头 |	sent_http_cookie |
- IP1->IP2(代理)->IP3 会记录IP地址的代理过程
```yaml
http_x_forwarded_for=Client IP,Proxy(1) IP,Proxy(2) IP
```
- 示例
```yaml
# 定义一种日志格式 
log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

log_format  zfpx  '$arg_name $http_referer sent_http_date"';
# 指定写入的文件名和日志格式
access_log  /var/log/nginx/access.log  main;   
```
## nginx 命令

- rpm -ql nginx  查看所有目录
- 文件配置目录
  - /etc/nginx/nginx.conf
  - /etc/nginx/conf.d/*.conf /etc/nginx/conf.d/default.conf
### 值指令继承规则
- 值指令是向上覆盖的，子配置不存在，可以使用父配置块的指令，如果子指令存在，会覆盖父配置块中的指令

## 主配置文件
- `/etc/nginx/conf.d/default.conf`默认http服务器配置文件
- `/etc/nginx/nginx.conf`核心配置文件
```yaml
# 启动nginx 用户
user nginx;
# work进程数 一般和cpu核数相等
worker_processes auto;
# 错误日志路径
error_log /var/log/nginx/error.log;
# 进程id写入的文件
pid /run/nginx.pid;

# Load dynamic modules. See /usr/share/doc/nginx/README.dynamic.
include /usr/share/nginx/modules/*.conf;
# 事件模块 和node类似  单进程单线程 事件驱动的  注意制作镜像的时候 events要配置 否则会有问题
events {
    # 工作进程的 最大链接数 超过这个就不扔掉了
    # 1024并发量
    # 每个进程允许的最大连接数 10000
    worker_connections 1024;
}
# http配置
http {
    # 定义日志的格式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    # 访问日志
    access_log  /var/log/nginx/access.log  main;

    # 打开 零拷贝
    sendfile            on;
    # 后面
    tcp_nopush          on;
    tcp_nodelay         on;
    # 保持连接的超时时间
    keepalive_timeout   65;
    types_hash_max_size 4096;
    # 是否启动gzip压缩
    #gzip               on;

    # 包含mime文件 根据文件后缀 找服务器的相应头 Content-type
    include             /etc/nginx/mime.types;
    # 默认类型 二进制文件
    default_type        application/octet-stream;

    # Load modular configuration files from the /etc/nginx/conf.d directory.
    # See http://nginx.org/en/docs/ngx_core_module.html#include
    # for more information.
    # 包含里面的所有文件
    include /etc/nginx/conf.d/*.conf;

    # server 配置服务的
    server {
        listen       80; 
        listen       [::]:80;
        server_name  _;
        root         /usr/share/nginx/html;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;

        error_page 404 /404.html;
        location = /404.html {
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
        }
    }
```
### server
- `/etc/nginx/conf.d/default.conf`
- 一个server下面可以配置多个location
```yaml
# 服务配置 他是最核心的配置文件
server {
    #监听的端口号
    listen       80;  
    #服务名字 后者域名 或者IP
    server_name  localhost;  

    #俄语字符集
    #charset koi8-r; 
    #访问日志文件和名称
    #access_log  /var/log/nginx/host.access.log  main;

    # 重点 location是路径的意思 / 匹配所有
    location / {
        #静态文件根目录
        root   /usr/share/nginx/html;  
        #首页的索引文件
        index  index.html index.htm;  
    }
    # = 代表路径全等 不加等号 则匹配前缀 /a/d能匹配到
    location = /a {
        #静态文件根目录
        root   /usr/share/nginx/html;  
        #首页的索引文件
        index  index.html index.htm;  
    }
    #指定错误页面
    #error_page  404              /404.html;  

    # redirect server error pages to the static page /50x.html
    # 把后台错误重定向到静态的50x.html页面
    error_page   500 502 503 504  /50x.html; 
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```
## 启动和重新加载
- systemctl restart nginx.service
- systemctl reload nginx.service
- nginx -s reload
## 静态资源服务器
- 静态资源：一般客户端发送请求到web服务器，web服务器从内存在取到相应的文件，返回给客户端，客户端解析并渲染显示出来。
- 动态资源：一般客户端请求的动态资源，先将请求交于web容器，web容器连接数据库，数据库处理数据之后，将内容交给web服务器，web服务器返回给客户端解析渲染处理。
```yaml
浏览器渲染	HTML、CSS、JS
图片	JPEG、GIF、PNG
视频	FLV、MPEG
下载文件	Word、Excel
```
## CDN
- CDN的全称是Content Delivery Network，即内容分发网络。
- CDN系统能够实时地根据网络流量和各节点的连接、负载状况以及到用户的距离和响应时间等综合信息将用户的请求重新导向离用户最近的服务节点上。其目的是使用户可就近取得所需内容，解决 Internet网络拥挤的状况，提高用户访问网站的响应速度。
## 语法配置
### sendfile
- 不经过用户内核发送文件
- 零拷贝传输模式
```yaml
语法	sendfile on / off
默认	sendfile off;
上下文	http,server,location,if in location
```
### tcp_nopush
- 在sendfile开启的情况下，合并多个数据包，提高网络包的传输效率
- 延迟高，合适大文件
```yaml
语法	tcp_nopush on / off
默认	tcp_nopush off;
上下文	http,server,location
```
### tcp_nodelay
- 在keepalive连接下，提高网络包的传输实时性
- 实时性,和tcp_nopush相反
```yaml
语法	tcp_nodelay on / off
默认	tcp_nodelay on;
上下文	http,server,location
```
### gzip
- 压缩文件可以节约带宽和提高网络传输效率
```yaml
语法	gzip on / off
默认	gzip off;
上下文	http,server,location

location / {
        index index.html;
        # 开始压缩
        gzip on;
        # 如果只开启上面  浏览器 拿到的只是一个压缩后的文件
        # 下面开启后 后浏览器才会读取压缩文件 index.html.gz
        gzip_static on;
    }

```
### gzip_comp_level
- 压缩比率越高，文件被压缩的体积越小
```yaml
语法	gzip_comp_level level
默认	gzip_comp_level 1;
上下文	http,server,location
```
### gzip_http_version
- 压缩版本
```yaml
语法	gzip_http_version 1.0/1.1
默认	gzip_http_version 1.1;
上下文	http,server,location
```
### http_gzip-static_module
- 先找磁盘上找同名的.gz这个文件是否存在,节约CPU的压缩时间和性能损耗
- http_gzip_static_module 预计gzip模块
- http_gunzip_module 应用支持gunzip的压缩方式
```yaml
语法	gzip_static on/off
默认	gzip_static off;
上下文	http,server,location
```

## 实战
### 防盗链
需要区别哪些请求是非正常的用户请求
使用`http_refer`防盗链
```yaml
location ~ .*\.(jpg|png|gif)$ {
        expires 1h;
        gzip off;
        gzip_http_version 1.1;
        gzip_comp_level 3;
        gzip_types image/jpeg image/png image/gif;
        # 直接请求的情况下没有refer
        # none没有写refer blocked非正式HTTP请求 特定IP valid_referers设置ip白名单
        valid_referers none blocked 115.29.148.6;
        if ($invalid_referer) { # 验证通过为0，不通过为1
            return 403;
        }
        root /data/images;
    }
```
```yaml
-e, --referer       Referer URL (H)
curl -v -e "115.29.148.6" http://115.29.148.6/kf.jpg
curl -v -e "http://www.baidu.com" http://115.29.148.6/kf.jpg
```
### 跨域
- 跨域是指一个域下的文档或脚本试图去请求另一个域下的资源
- 默认nginx 不支持使用post 请求 静态文件
```yaml
语法	add_header name value
默认	add_header --;
上下文	http,server,location
```
```yaml
mkdir -p /data/json
cd /data/json
vi user.json
{"name":"sg"}

location ~ .*\.json$ {
     add_header Access-Control-Allow-Origin http://127.0.0.1:8080;
     add_header Access-Control-Allow-Methods GET,POST,PUT,DELETE,OPTIONS;
     root /data/json;
}
```
- index.html
```yaml
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
<head>
</head>
<body>
<script>
let xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://115.29.148.6/user.json', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.responseText);
        }
    }
xhr.send();
</script>
</body>
</html>
```
### 浏览器缓存
```yaml
检验是否过期	Expires、Cache-Control(max-age)
Etag	Etag
Last-Modified	Last-Modified
语法	expires time
默认	expires off;
上下文	http,server,location
```yaml
location ~ .*\.(jpg|png|gif)$ {
    expires 24h;
}
```
### 基本设置

| 语法 | 作用|上下文|
| ----------- | :----------: | :----------|
|sendfile>on/off|不经过用户内核发送文件| http,server,location,if in location|
|tcp_nopush>on/off|在sendfile开启的情况 下，提高网络包的传输效率|   http,server,location|
|tcp_nodelay>on/off| 在keepalive连接下，提高网络包的传输实时性|http,server,location|
|gzip>on/off|压缩文件可以节约带宽和提高网络传输效率|http,server,location|
|gzip_comp_level>level|压缩比率越高，文件被压缩的体积越小|http,server,location|
|gzip_http_version>1.0/1.1|压缩HTTP版本|http,server,location|
|gzip_static>on/off| 先找磁盘上找同名的.gz这个文件是否存在,节约CPU的压缩时间和性能损耗|http,server,location|
|expires>time|添加Cache-Control、Expires头|http,server,location|
|add_header>name value|增加请求头|http,server,location|
|valid_referers>none block	server_names|使用http_refer防盗链 |server,location|
```yaml
server {
    listen       80;  //监听的端口号
    server_name  localhost;  //用域名方式访问的地址

    # 图片处理
    location ~ .*\.(jpg|png|gif)$ {
        gzip off; #关闭压缩
        gzip_http_version 1.1;
        gzip_comp_level 3; 
        gzip_types image/jpeg image/png image/gif;
        # 浏览器缓存
        expires 24h;
        root /data/images;
    }

    # 下面 比上面多了一个防盗链
    # 47.104.184.134 服务器id
    location ~ .*\.(jpg|png|gif)$ {
        expires 1h;
        gzip off;
        gzip_http_version 1.1;
        gzip_comp_level 3;
        gzip_types image/jpeg image/png image/gif;
        # valid_referers 防盗链
        valid_referers none blocked 47.104.184.134;
        if ($invalid_referer) {
           return 403;
        }
        root /data/images;
    }

    # html等代码处理
    location ~ .*\.(html|js|css)$ {
        gzip_static on;
        gzip on; #启用压缩
        gzip_min_length 1k;    #只压缩超过1K的文件
        gzip_http_version 1.1; #启用gzip压缩所需的HTTP最低版本
        gzip_comp_level 9;     #压缩级别，压缩比率越高文件被压缩的体积越小
        gzip_types  text/css application/javascript; #进行压缩的文件类型
        root /data/www/html;
    }

    # 下载
    location ~ ^/download {
        gzip_static on; #启用压缩
        tcp_nopush on;  # 不要着急发，攒一波再发
        root /data/www; # 注意此处目录是`/data/www`而不是`/data/www/download`
    }

    
    # 跨域
    location ~ .*\.json$ {
        add_header Access-Control-Allow-Origin http://localhost:3000;
        add_header Access-Control-Allow-Methods GET,POST,PUT,DELETE,OPTIONS;
        add_header Access-Control-Allow-Headers Content-Type;
        #允许携带凭证 
        add_header Access-Control-Allow-Credentials true;
        root /data/json;
    }
    # 配置跨域的demo

    let xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://47.104.184.134/users.json', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                console.log(xhr.responseText);
            }
        }
    xhr.send();

}
```
### 正向代理
- 正向代理的对象是客户端,服务器端看不到真正的客户端
```yaml
resolver 8.8.8.8; #谷歌的域名解析地址
location / {
    # $http_host 要访问的主机名 $request_uri请求路径
    proxy_pass http://$http_host$request_uri;
}
```
 
### 负载均衡&& 反向代理
- 反向代理的对象的服务端,客户端看不到真正的服务端
| 语法 | 作用|上下文|
| ----------- | :----------: | :----------|
|proxy_pass>URL|代理服务|server,location|
|upstream>name {}|负载均衡|http|

:::tip 负载均衡分配方式
| 方法 | 作用|
| ----------- | :----------: | 
|轮询（默认） | 每个请求按时间顺序逐一分配到不同的后端服务器，如果后端服务器down掉，能自动剔除。 | 
|weight(加权轮询) | 指定轮询几率，weight和访问比率成正比，用于后端服务器性能不均的情况。 | 
|ip_hash | 每个请求按访问ip的hash结果分配，这样每个访客固定访问一个后端服务器，可以解决session的问题。 | 
|url_hash（第三方） | 按访问的URL地址来分配 请求，每个URL都定向到同一个后端 服务器上(缓存) | 
|fair（第三方） | 按后端服务器的响应时间来分配请求，响应时间短的优先分配。 | 
|least_conn | 最小连接数，哪个连接少就分给谁 | 
|自定义hash | hash自定义key | 
:::

```js
upstream zfpx {
  ip_hash;
  server localhost:3000;
  server localhost:4000;
  server localhost:5000;
}
server {
    listen       80;  //监听的端口号
    server_name  localhost;  //用域名方式访问的地址
    # 反向代理
    resolver 8.8.8.8;
    location ~ ^/api {
        proxy_pass http://127.0.0.1:3000;
    }
}
server {
    listen 8080;
    server_name locahost;
    # 负载均衡
    location / {
        proxy_pass http://zfpx;
    }
}
```
## 缓存

-  proxy_cache
```yaml
http{  
    proxy_cache_path /data/nginx/tmp-test levels=1:2 keys_zone=tmp-test:100m inactive=7d max_size=1000g;  
}  
- proxy_cache_path 缓存文件路径
- levels 设置缓存文件目录层次；levels=1:2 表示两级目录
- keys_zone 设置缓存名字和共享内存大小
- inactive 在指定时间内没人访问则被删除
- max_size 最大缓存空间，如果缓存空间满，默认覆盖掉缓存时间最长的资源。

location /tmp-test/ {  
  proxy_cache tmp-test;  
  proxy_cache_valid  200 206 304 301 302 10d;  
  proxy_cache_key $uri;  
  proxy_set_header Host $host:$server_port;  
  proxy_set_header X-Real-IP $remote_addr;  
  proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;  
  proxy_pass http://127.0.0.1:8081/media_store.php/tmp-test/;  
}

- proxy_cache tmp-test 使用名为tmp-test的对应缓存配置
- proxy_cache_valid 200 206 304 301 302 10d; 对httpcode为200…的缓存10天
- proxy_cache_key $uri 定义缓存唯一key,通过唯一key来进行hash存取
- proxy_set_header 自定义http header头，用于发送给后端真实服务器。
- proxy_pass 指代理后转发的路径，注意是否需要最后的/
```

## location
- 正则表达式
```yaml
类型	种类
.	匹配除换行符之外的任意字符
?	重复0次或1次
+	重复1次或更多次
*	重复零次或多次
^	匹配字符串的开始
$	匹配字符串的结束
{n}	重复n次
{n,}	重复n次或更多次
[abc]	匹配单个字符a或者b或者c
a-z	匹配a-z小写字母的任意一个
\	转义字符
()	用于匹配括号之间的内容，可以通过$1、$2引用
\w	的释义都是指包含大 小写字母数字和下划线 相当于([0-9a-zA-Z])
```
## 匹配规则
- 等号类型（=）的优先级最高。一旦匹配成功，则不再查找其他匹配项。
- ^~类型表达式。一旦匹配成功，则不再查找其他匹配项。
- 正则表达式类型（~ ~*）的优先级次之。如果有多个location的正则能匹配的话，则使用正则表达式最长的那个。
- 常规字符串匹配类型按前缀匹配

<img :src="$withBase('/img/location.jpg')" >

## rewrite
- 实现ur的重写以及重定向
```yaml
# rewrite 他会 匹配 ^(.*)$ => 满足所有正则 返回 => /usr/share/nginx/html + /test.html 
root /usr/share/nginx/html;

location /test {
        rewrite ^(.*)$ /test.html break;
}
```
### 表示符
- last
  - 先匹配自己的location,然后通过rewrite规则新建一个请求再次请求服务端,做了一个内部跳转
  - 结束当前的请求处理,用替换后的URI重新匹配location
  - 可理解为重写（rewrite）后，发起了一个新请求，进入server模块，匹配location
  - 如果重新匹配循环的次数超过10次，nginx会返回500错误
  - 返回302 http状态码
  - 浏览器地址栏显示重定向后的url
```yaml
location ~ ^/last {
    rewrite ^/last /test last;
}

location /test {
      default_type application/json;
      return 200 '{"code":0,"msg":"success"}';
}
```
- break
  - 先匹配自己的location,然后生命周期会在当前的location结束,不再进行后续的匹配
```yaml
location ~ ^/break {
    rewrite ^/break /test break;
    root /data/html;
}
```
- redirect
  - 返回302昨时重定向,以后还会请求这个服务器
```yaml
location ~ ^/permanent {
 rewrite ^/permanent http://www.baidu.com permanent;
}
```
- permanent
  - 返回301永久重定向,以后会直接请求永久重定向后的域名
```yaml
location ~ ^/redirect {
 rewrite ^/redirect http://www.baidu.com redirect;
}
```
## 核心模块
### 监控nginx客户端的状态
- --with-http_stub_status_module 监控nginx客户端的状态
```yaml
# 语法
Syntax: stub_status on/off;
Default: -
Context: server->location

server {
        listen       80;
        server_name  localhost;
        location = /status {
                stub_status on;
        }
    }
```
- nagios 开源的监听系统, 可以监听服务的状态
```yaml
systemctl reload nginx.service

http://192.171.207.104/status

Active connections: 2            
server accepts handled requests  
 3 3 10 
Reading: 0 Writing: 1 Waiting: 1 

参数	含义
Active connections	当前nginx正在处理的活动连接数
accepts	总共处理的连接数
handled	成功创建握手数
requests	总共处理请求数
Reading	读取到客户端的Header信息数
Writing	返回给客户端的Header信息数
Waiting	开启keep-alive的情况下,这个值等于 active – (reading + writing)
```
### 随机主页
- --with-http_random_index_module 在根目录里随机选择一个主页显示
```yaml
Syntax: random_index on/off;
Default: -
Context: server->location

server {
        listen       80;
        server_name  localhost;
        location / {
            root /usr/share/nginx/html;
            # 他会在root 目录下随机 返回一个
            random_index on ;
            #index index.html index.htm
        }
    }
```
### 内容替换
- --with-http_sub_module 内容替换
```yaml
Syntax: sub_filter string replacement;
Default: --
Context: http,service,location

location / {
    root   /usr/share/nginx/html;
    index  index.html index.htm;
    # 他会把啊 文件里面的name 全部替换成sg
    sub_filter 'name' 'sg';
}
```
### 请求连接限制
- --with-limit_conn_module 连接频率限制
- --with-limit_req_module 请求频率限制
- 一次TCP请求至少产生一个HTTP请求
- SYN > SYN,ACK->ACK->REQUEST->RESPONSE->FIN->ACK->FIN->ACK
- 三次握手 四次挥手 本质是在一个不可靠的通信世界建立可靠的链接
### ab 测试
- Apache的ab命令模拟多线程并发请求，测试服务器负载压力，也可以测试nginx、lighthttp、IIS等其它Web服务器的压力
- -n 总共的请求数
- -c 并发的请求数
```yaml
yum -y install httpd-tools
ab -n 40 -c 20 http://127.0.0.1/
```
### 连接限制
- --ngx_http_limit_conn_module 模块会在NGX_HTTP_PREACCESS_PHASE阶段生效
- 针对全部的worker生效，依赖realip模块获得到的真实IP
- limit_conn_zone 定义共享内存(大小)，以及key关键字
```yaml
# 可以 以IP为key zone为空间的名称 size为申请空间的大小
Syntax: limit_conn_zone key zone=name:size;   
Default: --
Context: http(定义在server以外)
```
limit_conn 限制域
```yaml
# zone名称 number限制的数量
Syntax: limit_conn  zone number;
Default: --
Context: http,server,location

Syntax: limit_conn_log_level  info|notice|warn|error;
Default: limit_conn_log_level error;
Context: http,server,location

Syntax: limit_conn_status  code;
Default: limit_conn_status 503;
Context: http,server,location

# 案例
limit_conn_zone $binary_remote_addr zone=conn_zone:10m;
server {
  location /{
      root   /usr/share/nginx/html;  
      #首页的索引文件
      index  index.html index.htm;  
      # 失败 返回的状态码  默认是503
      limit_conn_status 500;
      # 日志级别是 warn
      limit_conn_log_level warn;
      # 每秒最多返回50字节 注意这个 会卡
      limit_rate 50;
      # 并发连接数最多是1
      limit_conn conn_zone 1;
  }
}
```

### 并发请求数限制
- ngx_http_limit_req_module模块是在NGX_HTTP_PREACCESS_PHASE阶段生效
- 生效算法是漏斗算法(Leaky Bucket) 把突出的流量限定为每秒恒定多少个请求
- Traffic Shaping的核心理念是等待，Traffic Policing的核心理念是丢弃
- limit_req生效是在limit_conn之前的

limit_req 限制并发请求数

```yaml
# 可以以IP为key zone为空间的名称 size为申请空间的大小
Syntax: limit_req_zone key zone=name:size rate=rate;   
Default: --
Context: http(定义在server以外)
```
- limit_req_zone 定义共享内存，以及key和限制速度
```yaml
# zone名称 number限制的数量
Syntax: limit_req  zone=name [burst=number] [nodelay];
Default: --
Context: http,server,location

# 案例
# zone=req_zone:10m 共享大小10m rate=1r/s 速率每秒1个
limit_req_zone $binary_remote_addr zone=req_zone:10m rate=1r/s;

server {
  location / {
      root   /usr/share/nginx/html;
      #首页的索引文件
      index  index.html index.htm;
      limit_req zone=req_zone;
      # burst 表示缓存为5 
      # 即每秒最多可处理rate+burst个.同时处理rate个
      # 如果有burst的情况 会有延迟 
      # ab -n 20 -c 4 http://127.0.0.1/ 一起发送20个 每次并发4
      # 如果nodelay 不做延迟 他会将 burst+rate 一起处理(3+1)个 但是后面3秒内都会处理请求 在5秒开始 失败的次数和rate 有关系
      limit_req zone=one burst=3 nodelay;
  }
}
```
### 访问控制
- 基于IP的访问控制 -http_access_module
```yaml
Syntax: allow address|all;
Default: --
Context: http,server,location,limit_except

Syntax: deny address|CIDR|all;
Default: --
Context: http,server,location,limit_except

server {
 location ~ ^/admin.html{
      # 拒绝
      deny 192.171.207.100;
      # 允许
      allow all;
    }
}
```