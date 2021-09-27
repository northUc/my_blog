# cicd

## 安装git
```yaml
yum install git -y
```
## 安装 Jenkins
### 安装java
```yaml
yum install -y java
```
### 安装jenkins 
```yaml
sudo wget -O /etc/yum.repos.d/jenkins.repo https://img.zhufengpeixun.com/jenkins.repo
sudo rpm --import https://img.zhufengpeixun.com/jenkins.io.key
yum install jenkins -y
```
### 启动 Jenkins
```yaml
systemctl start jenkins.service
```
- 开放端口
```yaml
firewall-cmd --zone=public --add-port=8080/tcp --permanent
firewall-cmd --zone=public --add-port=50000/tcp --permanent
systemctl reload firewalld
```
- 打开浏览器访问
```yaml
http://ip:8080/
```
- 查看密码
```yaml
cat /var/lib/jenkins/secrets/initialAdminPassword
```
- 修改插件镜像
```yaml
sed -i 's/http:\/\/updates.jenkins-ci.org\/download/https:\/\/mirrors.tuna.tsinghua.edu.cn\/jenkins/g' /var/lib/jenkins/updates/default.json && sed -i 's/http:\/\/www.google.com/https:\/\/www.baidu.com/g' /var/lib/jenkins/updates/default.json
```
- 添加到docker用户组里
```yaml
sudo gpasswd -a jenkins docker  #将当前用户添加至docker用户组
newgrp docker                 #更新docker用户组

sudo service jenkins restart # 重启
```
### 新建任务
- 新建任务=>构建一个自由风格的软件项目=>配置>增加构建步骤
```yaml
docker -v
docker pull node:latest
```
- 再次执行脚本。此时执行成功
## 安装Nodejs
- 系统管理 => 插件管理 => 可选插件 =》 安装NodeJS插件
- 系统管理 => 全局工具配置 => NodeJS => 新增NodeJS
- 任务的配置=>构建环境=>选中 Provide Node & npm bin/ folder to PATH

## Jenkins 测试第一个dome
### git 仓库 保存一份代码
- /build/index.html
```yaml
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    1111
</body>
</html>
```
- conf/nginx.conf
```yaml
events{
	worker_connections 1024;
}

http {
    server {
        listen       80;
        listen       [::]:80;
        server_name  _;
        root         /etc/nginx/html;
    }
}
```
- Dockerfile
```yaml
FROM nginx:1.15
COPY build /etc/nginx/html
COPY conf /etc/nginx/
WORKDIR /etc/nginx/html
```
### Jenkins 配置私钥
- 我们可以在配置任务时，来添加一个自己的凭证。点击项目的 配置，依次找到 源码管理 => Git => Repositories 
    -   Repository URL, 地址格式为 `git@gitee.com:xxx/xxx.git`,(可以将上面的保存代码的地址复制过来)
-  重点是 Credentials 这一项，这里则是我们选择认证凭证的地方。我们可以点击右侧 添加 => Jenkins 按钮添加一条新的凭证认证信息。
- 点击后会打开一个弹窗，这是 Jenkins 添加凭证的弹窗。选择类型中的 SSH Username with private key 这一项。接着填写信息即可：
    -   D：这条认证凭证在 Jenkins 中的名称是什么
    -   描述：描述信息
    -   Username：用户名（邮箱）
    -   Private Key：这里则是我们填写私钥的地方。点击 Add 按钮，将 xxx 私钥文件内所有文件内容全部复制过去（包含开头的 BEGIN OPENSSH PRIVATE KEY 和结尾的 END OPENSSH PRIVATE KEY）
    -   私钥 ~/.ssh/id_rsa`
    -   如果没有出现红色无权限提示，则代表身份校验成功，可以正常访问。
### 构建镜像
- 构建 => Execute shell。输入以下脚本：
```yaml
#!/bin/sh -l
docker build -t test .
docker run -p 8888:80 test
```
- 在如果构建成功 在服务里可以看到这个镜像,同时容器运行成功
## 镜像库
- 部署 Nexus 服务
- 在部署 Nexus 之前，需要先下载 Nexus 的安装包（这里需要另外找个托管服务）
- 解压后，我们可以看到有2个文件夹。分别是 nexus-3.29.0-02 和 sonatype-work 。其中，nexus-3.29.0-02 是nexus主程序文件夹，sonatype-work 则是数据文件。
```yaml
wget https://dependency-fe.oss-cn-beijing.aliyuncs.com/nexus-3.29.0-02-unix.tar.gz

tar -zxvf ./nexus-3.29.0-02-unix.tar.gz
```
## 启动 Nexus
- 我们进入 nexus-3.29.0-02 下面的 bin 目录，这里就是 nexus 的主命令目录。我们在 bin 目录下，执行 ./nexus start 命令即可启动 nexus ：
- nexus 还支持停止，重启等命令。可以在 bin 目录下执行 ./nexus help 查看更多命令
```yaml
./nexus start
```
- 由于 nexus 默认服务端口是 8081，稍后我们还需要给镜像库访问单独开放一个 8082 端口。这里将 8081，8082 端口添加到防火墙放行规则内（没开防火墙则可以略过）：
```yaml
firewall-cmd --zone=public --add-port=8081/tcp --permanent
firewall-cmd --zone=public --add-port=8082/tcp --permanent
```
- 打开浏览器地址栏，访问 IP:8081 。启动时间比较长，需要耐心等待。在 Nexus 启动后，会进入这个欢迎页面：
## 配置 Nexus
- 进入欢迎页后，点击右上角的登录，会打开登录框。这里需要我们输入 默认管理员密码 进行初始化配置。
- 可以在这里找到：
- 将文件中获取到的密码输入进去，登录用户名是 admin 。
- 注意请立即更改密码
- Enable anonymous access
```yaml
# 注意  /root/这个是安装的目录  根据自己的情况
cat /root/sonatype-work/nexus3/admin.password 
```
### 创建Docker私服
- 登录 => 齿轮图标 => Repositories => Create repository => docker(hosted) => HTTP(8082)
- proxy: 此类型制品库原则上只下载，不允许用户推送
- hosted：此类型制品库和 proxy 相反，原则上 只允许用户推送，不允许缓存。这里只存放自己的私有镜像或制品
- group：此类型制品库可以将以上两种类型的制品库组合起来
### 添加访问权限
- 齿轮图标 => Realms => Docker Bearer Token Realm => 添加到右边的 Active =>保存
- copy http://106.15.106.83:8081/repository/study/
### 登录制品库
- vi /etc/docker/daemon.json
```yaml
{
  "insecure-registries" : [
    "106.15.106.83:8082"
  ],
  "registry-mirrors": ["https://fwvjnv59.mirror.aliyuncs.com"]
}
```
```yaml
systemctl restart docker
docker login 106.15.106.83:8082 //注意此处要和insecure-registries里的地址一致
Username: admin
Password: 123456
```
## 利用 Jenkins推送镜像到制品库
### 利用凭据给 Shell 注入镜像库用户名密码
- 设置界面 => 构建环境 => 勾选 Use secret text(s) or file(s) => 新增选择 => Username and password (separated)
    -   DOCKER_LOGIN_USERNAME
    -   DOCKER_LOGIN_PASSWORD
- 接着在下面指定凭据=>添加jenkins=>选择类型Username with password,输入用户名和密码然后点添加确定,这里的账号`admin`对应`DOCKER_LOGIN_USERNAME`, `DOCKER_LOGIN_PASSWORD`对应输入密码`123456`
- 修改 shell 执行
```yaml
#!/bin/sh -l
docker build -t 106.15.106.83:8082/test .
docker login -u $DOCKER_LOGIN_USERNAME -p $DOCKER_LOGIN_PASSWORD 106.15.106.83:8082
docker push 106.15.106.83:8082/test
```