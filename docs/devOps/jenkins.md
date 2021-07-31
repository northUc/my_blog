# jenkins

## git

### 搭建git服务器
- 安装git
```js
yum install -y git
```
- 创建git用户
```js
useradd git
passwd git
```
- 创建仓库
  - git init 会创建一个.git配置文件 提交代码用
  - git init --bare  只会创建一个仓库 让别人提交代码
```js
su - git
mkdir -p ~/repos/app.git
cd ~/repos/app.git
git --bare init
``` 

### 创建git客户端
```js
cd /usr/local/src
// clone 刚才创建的 git服务器  
// git(是用户名) @后面接服务器的地址 : 后面接git服务器的路径
git clone git@192.168.20.131:/home/git/repos/app.git

// 创建文件 提交就可以了
```

- 实现SsH无密码 提交
  - 需要在客户端生成一个公钥
    - 生产公钥 
    - ssh-keygen -t rsa
    - 在`~/.ssh/` 目录生成2个密钥 id_rsa 是私钥 id_rsa.pub 是公钥
    - copy 公钥即可
  - 在服务端，把客户端的公钥添加到authorize_keys文件里 
    - 同样在服务器端生成配置文件`ssh-keygen -t rsa`
    - 创建一个文件，定时的名字 `vi authorized_keys`
    - 将客户端的公钥粘贴进去就可以了

## Jenkins 

### 安装java
- 安装JDK
```JS
// 下载包
wget http://img.zhufengpeixun.cn/jdk1.8.0_211.tar.gz
// 解压包 x解压 z原来是一个gz的包 v显示解压的过程 f指定文件名
tar -xzvf jdk1.8.0_211.tar.gz 
// 将解压的文件 cp 走
cp -r jdk1.8.0_211 /usr/java
// java的执行文件
/use/java/jdk1.8.0_211/bin/java
// 执行查看版本
/use/java/jdk1.8.0_211/bin/java -version 

// 将java执行文件 链接到一个文件 /usr/bin/java 就指代java执行文件
ln -s /use/java/jdk1.8.0_211/bin/java /usr/bin/java

// 配置环境变量  java 就可以在全局访问到了
vi /etc/profile
// 在文件最后加入 下面的 路径根据自己的情况
JAVA_HOME=/usr/java/jdk1.8.0_211
export CLASSPATH=.:${JAVA_HOME}/jre/lib/rt.jar:${JAVA_HOME}/lib/dt.jar:${JAVA_HOME}/lib/tools.jar
export PATH=$PATH:${JAVA_HOME}/bin

// 使刚才的配置文件生效
source /etc/profile

// 这样全局就可以使用 java了
java -version
```

### 安装jenkins
[下载](https://pkg.jenkins.io/redhat-stable/)
```js
// 1
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
// 2
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
// 3
yum install jenkins
// 卸载
service jenkins stop
yum clean all
yum -y remove jenkins

// 启动
systemctl start jenkins
// 重启
systemctl restart jenkins
// 查看状态
systemctl status jenkins


// 密码存放位子
/var/lib/jenkins/secrets/initialAdminPassword

// 修改jenkins 默认端口
vim /etc/sysconfig/jenkins
// 找到 JENKINS_PORT="8080" 这个就是默认的8080  将他修改即可 

```

- 关闭防火墙
```js
systemctl stop firewalld.service
systemctl disable firewalld.service
```
## jenkins使用
### 角色和用户管理 
- 安装 Role-based Authorization Strategy 插件
- 首先注册2个账号分别 zhangsan/lisi 
- `系统管理->Manage Roles` 配置管理角色
<img :src="$withBase('/img/manageroles.jpg')" >

- `系统管理->Assign Roles` 配置分配角色
<img :src="$withBase('/img/assignroles.jpg')" >

- 新建任务`dev-first&&qa-first`
 - 新建任务 构建过程加上git，配置如下
 - 有几点要注意
 - 1、jenkins 拉去git代码 需要jenkins 获取ssh公钥,配置到git服务器中 
 - 2、修改jenkins配置文件 将用户修改成root,`vim /etc/sysconfig/jenkins`,修改为`JENKINS_USER="root"`
 - 3、Repository URL 写git的地址 
 - 只要服务器有新的分支 jenkins 就能更新到
<img :src="$withBase('/img/jenkinstasks.jpg')" >
<img :src="$withBase('/img/managecode.jpg')" >
<img :src="$withBase('/img/parameter.jpg')" >

## 安装 Nodejs 环境
- 我们其实并没有在服务端安装 Node 环境。如果想要安装 Node 环境，有以下两个办法：
  -  源码编译：这种方式是将 Node     源码拉下来后，在服务器端编译完成后才可以使用。时间比较长，流程也略复杂
  -  使用 Jenkins Plugin 中 NodeJS 插件自动配置安装
- 我们打开 Jenkins 首页，找到左侧的系统配置 => 插件管理 => 可选插件，搜索 Node 。选中 NodeJS 后，点击左下角的 直接安装 开始安装插件
<img :src="$withBase('/img/jenkins_node.png')" >

<img :src="$withBase('/img/jenkins_node1.png')" >

- 等待安装完毕后，返回 Jenkins 首页。找到 `Global Tool Configuration` => `NodeJS` => `新增NodeJS`

- 接着回到 Jenkins 首页，找到左侧的 `系统配置` ，选择 `全局工具配置`
<img :src="$withBase('/img/jenkins_node2.png')" >

- 找到下面的 NodeJS ，点击 NodeJS 安装，选择相应的版本填写信息保存即可。
<img :src="$withBase('/img/jenkins_node3.png')" >

## 如何使用
- 那我们在任务中如何使用呢？我们只需要在任务的配置中，找到构建环境，选中 Provide Node & npm bin/ folder to PATH ，选择刚才配置好的 NodeJS 即可。
- 第一次执行会下载对应的 Node 版本，后续不会下载。
<img :src="$withBase('/img/jenkins_node4.png')" >

### 使用 SSH 协议集成 Git 仓库源
- 这一步，我们使用 Jenkins 集成外部 Git 仓库，实现对真实代码的拉取和构建。在这里，我们选用 Gitee  作为我们的代码源 。这里准备一个 vue-cli 项目来演示构建。
### 生成公钥私钥
- 首先，我们先来配置公钥和私钥。这是 Jenkins 访问 Git 私有库的常用认证方式。我们可以使用 ssh-keygen 命令即可生成公钥私钥。在本地机器执行生成即可。这里的邮箱可以换成你自己的邮箱：
```yaml
ssh-keygen -t rsa -C "xxx@qq.com"
```
<img :src="$withBase('/img/jenkins_node5.png')" >
- 一路回车即可。
- 结束后，你会得到两个文件。分别是 xxx 和 xxx.pub。
- 其中，xxx 是私钥文件，xxx.pub 是对应的公钥文件。我们需要在 Git 端配置公钥，在 Jenkins 端使用私钥与 Git 进行身份校验

### 在 Gitee 配置公钥
- 在 Gitee 中，如果你要配置公钥有2种方式：仓库公钥 和 个人公钥。其中，如果配置了仓库公钥，则该公钥只能对配置的仓库进行访问。如果配置了个人公钥，则账号下所有私有仓库都可以访问。
- 这里我们就以配置个人公钥为例子。首先打开右上角的设置 ，点击下面的 安全设置 => SSH公钥
- 在下方有个添加公钥，填入信息即可。
- 其中的标题为公钥标题，这里可以自定义标题；公钥则为刚才生成的 xxx.pub 文件。使用 cat 命令查看下文件内容，将内容填入输入框并保存。接着去 Jenkins  端配置私钥
<img :src="$withBase('/img/jenkins_node6.png')" >

### 在 Jenkins 配置私钥
- 回到 Jenkins。在 Jenkins 中，私钥/密码 等认证信息都是以 凭证 的方式管理的，所以可以做到全局都通用。
- 我们可以在配置任务时，来添加一个自己的凭证。点击项目的 配置，依次找到 源码管理 => Git => Repositories 
<img :src="$withBase('/img/jenkins_node7.png')" >
<img :src="$withBase('/img/jenkins_node8.png')" >
- 保存后，在 Credentials 下拉列表中选择你添加的凭证。
- 如果没有出现红色无权限提示，则代表身份校验成功，可以正常访问。

<img :src="$withBase('/img/jenkins_node9.png')" >

## 构建镜像
### 编写 DockerFile
- 基于 nginx:1.15 镜像做底座。
- 拷贝本地 html 文件夹内的文件，到镜像内 /etc/nginx/html 文件夹。
- 拷贝本地 conf 文件夹内的文件，到镜像内 /etc/nginx/  文件夹。
```yaml
FROM nginx:1.15-alpine
COPY html /etc/nginx/html
COPY conf /etc/nginx/
WORKDIR /etc/nginx/html
```
- 编写完成后，怎么生成镜像呢？我们只需要使用 docker build 命令就可以构建一个镜像了：
  -  -t: 声明要打一个镜像的Tag标签，紧跟着的后面就是标签。标签格式为 镜像名:版本
```yaml
docker build -t imagename:version .
```
-  因为我们的镜像只包含一个 nginx，所以 dockerfile 内容比较简单。我们只需要在代码根目录下新建一个名为 DockerFile 的文件，输入以下内容，并将其提交到代码库即可。
```yaml
vi DockerFile
```
```yaml
FROM nginx:1.15-alpine
COPY html /etc/nginx/html
COPY conf /etc/nginx/
WORKDIR /etc/nginx/html
```
```yaml
git add ./DockerFile
git commit -m "chore: add dockerfile"
git push
```
## Jenkins 端配置
- 在代码源和 DockerFile 准备就绪后，我们只需在 Jenkins 端配置下要执行的 Shell 脚本即可。找到项目的配置，依次找到 构建 => Execute shell。输入以下脚本：
```yaml
#!/bin/sh -l

npm install --registry=https://registry.npm.taobao.org
npm run build
docker build -t jenkins-test .
```
- 这里脚本很简单，主要就是 安装依赖 => 构建文件 => 构建镜像。填写完毕后保存
