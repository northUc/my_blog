[[toc]]
# Kubernetes
- Kubernetes 看作是用来是一个部署镜像的平台

```js
// master
47.100.74.198:31234
172.28.240.100

// node 1
47.102.114.8
172.28.240.102

// node 2
120.55.168.40
172.28.240.101
```
## 基础安装
- 准备 master 1台   node 2台 以下软件全部安装(要同一个内网)
```yaml
# lunix 安装必备的软件
yum install vim wget ntpdate -y

# kubernetes 会创建防火墙规则,先关闭firewalld
systemctl stop firewalld & systemctl disable firewalld

# 关闭 Swap 分区
# Swap 是 Linux 的交换分区，在系统资源不足时，Swap 分区会启用,这个我们不需要
# 应该让新创建的服务自动调度到集群的其他 Node 节点中去，而不是使用 Swap 分区
# 临时关闭
swapoff -a

# 关闭 Selinux
# 关闭Selinux是为了支持容器可以访问宿主机文件系统
setenforce 0

# 统一我们的系统时间和时区
# 统一时区，为上海时区
ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
bash -c "echo 'Asia/Shanghai' > /etc/timezone"

# 统一使用阿里服务器进行时间更新
ntpdate ntp1.aliyun.com

# 安装 Docker
# 在 kubernetes 中的组件，服务都可以 Docker 镜像方式部署的,所以需要安装Docker
# device-mapper-persistent-data: 存储驱动，Linux上的许多高级卷管理技术
# lvm: 逻辑卷管理器，用于创建逻辑磁盘分区使用
yum install -y yum-utils device-mapper-persistent-data lvm2

sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

yum install docker-ce -y

systemctl start docker

systemctl enable docker

sudo mkdir -p /etc/docker

sudo tee /etc/docker/daemon.yamlon <<-'EOF'
{
  "registry-mirrors": ["https://fwvjnv59.mirror.aliyuncs.com"]
}
EOF

sudo systemctl daemon-reload

sudo systemctl restart docker.service

# Kubernetes
# 切换阿里云源
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
        http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
```
### Kubernetes组件
- kubelet 是 Kubernetes 中的核心组件。它会运行在集群的所有节点上，并负责创建启动服务容器
- kubectl 则是Kubernetes的命令行工具。可以用来管理，删除，创建资源
- kubeadm 则是用来初始化集群，子节点加入的工具
- 其他的组件后面在处理
```yaml
#  直接安装下面这个会有问题 k8s.gcr.io/coredns 版本下载有问题
#  yum install -y kubelet kubeadm kubectl
yum install -y kubelet-1.20.0-0 kubeadm-1.20.0-0 kubectl-1.20.0-0
# 启动kubelet
systemctl enable kubelet && systemctl start kubelet
```
### 设置bridge-nf-call-iptables
- 配置内核参数，将桥接的IPV4浏览传递到iptables链
- 开启了bridge-nf-call-iptables
```yaml
echo 1 > /proc/sys/net/bridge/bridge-nf-call-iptables
```

## Master节点配置
- 修改主机名称为 master
- 配置hosts
```yaml
hostnamectl set-hostname  master

# ip addr 查看
# vim /etc/hosts
172.31.178.169  master  master
```
### 配置 Kubernetes 初始化文件
- 更换 Kubernetes 镜像仓库为阿里云镜像仓库，加速组件拉取
- 替换 ip 为自己主机 ip
- 配置 pod 网络为 flannel 网段
- 为了让集群之间可以互相通信，需要配置子网络,这些在后面的flannel网络中需要用到
  - 10.96.0.0/12 是Kubernetes内部的网络pods需要的网络
  - 10.244.0.0/16 是Kubernetes内部services需要的网络
```yaml
kubeadm config print init-defaults > init-kubeadm.conf
vim init-kubeadm.conf

- imageRepository: k8s.gcr.io 更换k8s镜像仓库
+ imageRepository: registry.cn-hangzhou.aliyuncs.com/google_containers
- localAPIEndpointc，advertiseAddress为master ip ,port默认不修改
localAPIEndpoint:
+ advertiseAddress: 172.31.178.169  # 此处为master的IP(内网)
  bindPort: 6443
# 配置子网络
networking:
  dnsDomain: cluster.local
  serviceSubnet: 10.96.0.0/12
+ podSubnet: 10.244.0.0/16    # 添加这个
```
### 拉取其它组件
- kubeadm 可以用来拉取我们的默认组件镜像
- kube-apiserver 提供接口服务，可以让外网访问集群
- kube-controller-manager 内部的控制指令工具
- kube-scheduler 内部的任务调度器
- kube-proxy 反向代理和负载均衡，流量转发
- pause 进程管理工具
- etcd 保持 集群内部的数据一致性
- coredns 集群内网通信
```js
// 查看缺少的组件
kubeadm config images list --config init-kubeadm.conf
// 拉取缺少的组件
kubeadm config images pull --config init-kubeadm.conf
```
### 初始化 Kubernetes
- Master 节点需要执行的初始化命令
- 将默认的 Kubernetes 认证文件拷贝进 .kube 文件夹内，才能默认使用该配置文件
- kubeadm join 可以快速将 Node 节点加入到 Master 集群内 (需要将.kube/config 拷贝到当前工作的目录内)
```yaml
kubeadm init --config init-kubeadm.conf
# -----------------以下是日志
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 172.31.178.169:6443 --token abcdef.0123456789abcdef \
    --discovery-token-ca-cert-hash sha256:8aac19f4dbe68f1e15ba3d80e141acdc912e353f9757ad69187e8fb9780bc975 
```
## 如果上面的配置 终断了  删除文件 在重新init 安装Kubernetes
```yaml
rm -rf /etc/kubernetes/*
rm -rf ~/.kube/*

kubeadm reset
```
### 安装 Flannel 
- flannel 主要的作用是通过创建一个虚拟网络，让不同节点下的服务有着全局唯一的IP地址，且服务之前可以互相访问和连接。
- 集群内网网络通信协议通信模式采用了Flannel协议
```yaml
#wget https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
wget https://img.zhufengpeixun.com/kube-flannel.yml
docker pull quay.io/coreos/flannel:v0.13.0-rc2
kubectl apply -f kube-flannel.yml
```
- vim kube-flannel.yml 可以查看 flannel 网络配置和前面的初始化配置文件进行关联
```yaml
net-conf.json: |
    {
      "Network": "10.244.0.0/16",
      "Backend": {
        "Type": "vxlan"
      }
    }
```
### 查看master 启动情况
- 查看启动情况,后面node 加入后 会多一条记录
```yaml
kubectl get nodes

NAME     STATUS   ROLES                  AGE     VERSION
master   Ready    control-plane,master   9m34s   v1.20.4
```
### Node节点配置
- Node 节点的地位则是负责运行服务容器，负责接收调度的。
- 先执行基础安装
```js
hostnamectl set-hostname node1
```
- 将 master 节点的配置文件拷贝 k8s 到 node1 节点
```js
scp $HOME/.kube/config root@172.31.178.170:~/
```
- 在node1节点归档配置文件
```js
mkdir -p $HOME/.kube
sudo mv $HOME/config $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```
### 加入 Master 节点
- 让 Node 节点加入到 master 集群内
- 如果 join 失败 阔以 执行kubeadm reset初始化在执行
```js
// 这是初始化 配置的时候 显示出来的 
kubeadm join 172.16.81.164:6443 --token abcdef.0123456789abcdef \
    --discovery-token-ca-cert-hash sha256:b4a059eeffa2e52f2eea7a5d592be10c994c7715c17bda57bbc3757d4f13903d
```
- 如果刚才的命令丢了，可以在 master 机器上使用 kubeadm token create 重新生成一条命令
```js
kubeadm token create --print-join-command
```
### 安装 Flannel
```js
scp ~/kube-flannel.yml root@172.31.178.170:~/
kubectl apply -f kube-flannel.yml
```
### 查看状态
```js
kubectl get nodes
NAME     STATUS   ROLES                  AGE    VERSION
master   Ready    control-plane,master   24m    v1.20.4
node1    Ready    <none>                 101s   v1.20.4
```


## Kubernetes介绍
- Master是控制节点,负责编排、管理、调度用户提交的作业
  - 负责API服务的`kube-apiserver`
  - 负责调度的`kube-scheduler`
  - 负责容器编排的`kube-controller-manager`
  - `kube-apiserver`会处理集群的持久化数据并保存在`etcd`中
- Node是计算节点
  - CRI(Container Runtime Interface)的远程调用接口，这个接口定义了容器运行时的各项核心操作
  - OCI(Open Container Initiative) 容器运行时通过OCI同底层的Linux操作系统进行交互
  - 设备插件是用来管理宿主机物理设备的组件
  - gRPC是可以在任何环境中运行的现代开源高性能 RPC 框架
  - RPC是指远程过程调用，也就是说两台服务器A，B，一个应用部署在A服务器上，想要调用B服务器上应用提供的函数/方法，由于不在一个内存空间，不能直接调用，需要通过网络来表达调用的语义和传达调用的数据
<img :src="$withBase('/img/kubernetes_produce.jpg')" >
<img :src="$withBase('/img/kubernetes_ingress.jpg')" >

## 制作简单的镜像
### docker/build/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    1号
</body>
</html>
```
### docker/conf/nginx.conf
```yaml
# 这个不能删除
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
### docker/Dockerfile
- 打包成镜像  docker build -t songge/nginx-dome1:1.0.0 ./Dockerfile
```yaml
FROM nginx:1.15
COPY build /etc/nginx/html
COPY conf /etc/nginx/
WORKDIR /etc/nginx/html
```
### 发布
```yaml
docker login
# songge songge  账号密码 https://hub.docker.com
Login Succeeded
docker push songge/nginx-dome1:1.0.0
```

## Pod
- Pod 是 K8S 中最小的可调度单元（可操作/可部署单元）
- 它里面可以包含1个或者多个 Docker 容器
- 在 Pod 内的所有 Docker 容器，都会共享同一个网络、存储卷、端口映射规则
- 一个 Pod 拥有一个 IP,但这个 IP 会随着Pod的重启，创建，删除等跟着改变，所以不固定且不完全可靠,这也就是 Pod 的 IP 漂移问题。这个问题我们可以使用下面的 Service 去自动映射
- Pod 是一个容器组，里面有很多容器，容器组内共享资源
### deployment
- 希望批量启动和管理多个Pod实例，就可以使用deployment
### 创建 deployment
-   mkdir deployment && cd deployment
-   vim deployment-user-v1.yaml
```yaml
apiVersion: apps/v1  #API 配置版本
kind: Deployment     #资源类型
metadata:
  name: user-v1     #资源名称
spec:
  selector:
    matchLabels:
      app: user-v1 #告诉deployment根据规则匹配相应的Pod进行控制和管理，matchLabels字段匹配Pod的label值
  replicas: 3 #声明一个 Pod,副本的数量
  template:
    metadata:
      labels:
        app: user-v1 #Pod的名称
    spec:   #组内创建的 Pod 信息
      containers:
      - name: nginx #容器的名称
        image: songge/nginx-dome1 #使用哪个镜像
        ports:
        - containerPort: 80 #容器内映射的端口
```
### 部署 deployment
- kubectl apply -f deployment-user-v1.yaml
- 查看部署的 deploment
  - kubectl get deploy  user-v1(过滤可选,deploment的名字)
- 查看部署的pod
 - kubectl get pods
- 查看pod的详情
 - kubectl describe pod user-v1-5895c69847-lzpg6
```yaml
    kubectl get deploy
NAME      READY   UP-TO-DATE   AVAILABLE   AGE
user-v1   3/3     3            3           2m30s

    kubectl get pods
NAME                       READY   STATUS    RESTARTS   AGE
user-v1-5895c69847-lzpg6   1/1     Running   0          11s
user-v1-5895c69847-m7q88   1/1     Running   0          11s
user-v1-5895c69847-pgqnb   1/1     Running   0          11s
```
## Service
- 有了Pod实例后就需要以固定的IP地址以负载均衡的方式访问多个Pod实例，就有了Service
### 创建服务
- deployment 是无状态的
- deployment 并不会对 pod 进行网络通信和分发
- Pod 的 IP 在运行时还会经常进行漂移且不固定
- 想访问服务需要使用 Service 组织统一的 Pod 访问入口
- 可以定义Service 来进行统一组织 Pod 服务访问
- 负责自动调度和组织deployment中 Pod 的服务访问，由于自动映射 Pod 的IP，同时也解决了 Pod 的IP漂移问题
- 创建一个service
  -  protocol	通信类型（TCP/UDP）
  -  targetPort	原本 Pod 开放的端口
  -  port	Kubernetes容器之间互相访问的端口
  -  type	NodePort，Service的一种访问方式
  -  nodePort  指定service 的开放端口(若没有则 随机给 范围30000-32000多)
```yaml
# mkdir service-user-v1.yaml
apiVersion: v1
kind: Service
metadata:
  name: service-user-v1
spec:
  selector:
    app: user-v1 # 这个和pod的名称对应上
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 30001 # 若不写 则随机给一个 30000-32000中间的一个
  type: NodePort
```
- 创建应用
- kubectl apply -f service-user-v1.yaml
### 查看服务
- kubectl get svc
```yaml
NAME              TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service-user-v1   NodePort    10.110.219.57   <none>        80:30001/TCP   2m12s
```
- 访问
- 可以在任何节点上访问 curl http://ip:30001
- 公网ip:30001 就能访问到部署的 deployment 里面的 pod
```yaml
NAME                                 TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
ingress-nginx-controller             NodePort    10.110.159.227   <none>        80:31234/TCP,443:31245/TCP   8d
ingress-nginx-controller-admission   ClusterIP   10.111.176.223   <none>        443/TCP                      8d
```
## 编写 ingress配置文件
- ingress 服务的配置也是使用 yaml 文件进行管理
- annotations 是 ingress 的主要配置项目，可以用来修改这些配置来修改 ingress 的行为。我们可以通过修改这些配置来实现灰度发布，跨域资源，甚至将 www.abc.com 重定向到 abc.com
- rules 是 ingress 配置路径转发规则的地方,当我们去访问 /front 时， ingress 就会帮我们调度到 front-service-v1 这个 service 上面
- path 可以是一个路径字符串，也可以是一个正则表达式
- backend 则是 k8s 的 service 服务， serviceName 是服务名称， servicePort 是服务端口
- backend 可以用来给 ingress 设置默认访问的 Service 服务。当请求不匹配 rules 中任何一条规则时，则会去走 backend 中的配置
```yaml
# vi ingress.yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: nginx-demo
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    kubernetes.io/ingress.class: nginx
spec:
  rules:
  - http:
      paths: 
       - path: /user
         backend:
          serviceName: svc-nginx-1
          servicePort: 80
       - path: /pay
         backend:
          serviceName: svc-nginx-2
          servicePort: 80    
  backend:
     serviceName: svc-nginx-3
     servicePort: 80
```
## 查看 ingress-nginx和普通pod 操作
- 创建应用服务
- kubectl apply -f ./ingress.yaml
- 此时可以通过 公网IP:30001/user 访问到 service-user-v1 service
- 查看 ingress 详情
- kubectl  describe ingress
```yaml
# 查看ingress节点情况
kubectl get pod -n ingress-nginx -o wide

# 查看节点详细情况 
kubectl describe pod -n ingress-nginx ingress-nginx-admission-create-bfjt9


#查看当前的deployment
kubectl get deploy 
#删除deploy 删除后ReplicateSet和pod也没有了
kubectl delete deploy nginx

#查看Replication Controller
kubectl get rc
#删除Replication Controller,删除后Pod也没有了
kubectl delete rc mysql

#查看pod
kubectl get pod
#删除pod
kubectl delete pod mysql-77w7z

#查看服务
kubectl get svc
#删除服务
kubectl delete service nginx

#查看pod详情
kubectl describe pod fail-1034443984-jerry
```

## 灰度发布
### 根据 Cookie 切分流量
- 基于 Cookie 切分流量。这种实现原理主要根据用户请求中的 Cookie 是否存在灰度标示 Cookie去判断是否为灰度用户，再决定是否返回灰度版本服务
- nginx.ingress.kubernetes.io/canary：可选值为 true / false 。代表是否开启灰度功能
- nginx.ingress.kubernetes.io/canary-by-cookie：灰度发布 cookie 的 key。当 key 值等于 always 时，灰度触发生效。等于其他值时，则不会走灰度环境 
### 准备新版本Service
```yaml
# cp deployment-user-v1.yaml deployment-user-v2.yaml
apiVersion: apps/v1  #API 配置版本
kind: Deployment     #资源类型
metadata:
+  name: user-v2     #资源名称
spec:
  selector:
    matchLabels:
+      app: user-v2 #告诉deployment根据规则匹配相应的Pod进行控制和管理，matchLabels字段匹配Pod的label值
  replicas: 3 #声明一个 Pod,副本的数量
  template:
    metadata:
      labels:
+        app: user-v2 #Pod的名称
    spec:   #组内创建的 Pod 信息
      containers:
      - name: nginx #容器的名称
+        image: songge/nginx-dome2
        ports:
        - containerPort: 80 #容器内映射的端口

# service-user-v2.yaml
apiVersion: v1
kind: Service
metadata:
+  name: service-user-v2
spec:
  selector:
+    app: user-v2
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: NodePort
# kubectl apply -f deployment-user-v2.yaml service-user-v2.yaml
```
### 配置 ingress-gray
- kubectl apply -f ./ingress-gray.yaml 
```yaml
vim ingress-gray.yaml

apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: nginx-demo-canary
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-cookie: "vip_user"
spec:
  rules:
  - http:
     paths:
     - backend: # 默认走这里 cookie 
        serviceName: svc-nginx-5
        servicePort: 80
  backend: # 加 cookie 走这里
     serviceName: svc-nginx-5
     servicePort: 80
```
- `curl --cookie "vip_user=always"  http://47.100.74.198:31234/user` 
  - 如果加了 cookie 配置他会访问 灰度配置的路由,否则就访问原来的路由
- `curl http://47.100.74.198:31234/user` 
- `curl http://47.100.74.198:31234`
### 基于 Header 切分流量
- 基于 Header 切分流量，这种实现原理主要根据用户请求中的 header 是否存在灰度标示 header去判断是否为灰度用户，再决定是否返回灰度版本服务。
- vi ingress-gray.yaml 
```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: user-canary
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-header: "name"
    nginx.ingress.kubernetes.io/canary-by-header-value: "vip"
spec:
  rules:
  - http:
      paths: 
       - backend:
          serviceName: svc-nginx-4
          servicePort: 80
  backend:
     serviceName: svc-nginx-4
     servicePort: 80
```
- `curl --header 'name:vip' http://47.100.74.198:31234/user`
  - 如果加了 cookie 配置他会访问 灰度配置的路由,否则就访问原来的路由

### 基于权重切分流量
- `nginx.ingress.kubernetes.io/canary-weight: "50"`
- `for ((i=1; i<=10; i++)); do curl 127.0.0.1:端口值;echo; done`
- `for ((i=1; i<=10; i++)); do curl http://47.100.74.198:31234;echo; done`
### 优先级
- canary-by-header -> canary-by-cookie -> canary-weight
- k8s 会优先去匹配 header ，如果未匹配则去匹配 cookie ，最后是 weight
## 滚动发布
- k8s每次使用一个新的副本控制器(replication controller)来替换已存在的副本控制器，从而始终使用一个新的Pod模板来替换旧的pod模板
  - 创建一个新的replication controller
  - 增加或减少pod副本数量，直到满足当前批次期望的数量
  - 删除旧的replication controller
### 发布流程和策略
- 优点
  - 不需要停机更新，无感知平滑更新。
  - 版本更新成本小,不需要新旧版本共存
- 缺点
  - 更新时间长：每次只更新一个/多个镜像，需要频繁连续等待服务启动缓冲
  - 旧版本环境无法得到备份：始终只有一个环境存在
  - 回滚版本异常痛苦：如果滚动发布到一半出了问题，回滚时需要使用同样的滚动策略回滚旧版本
### 先扩容为10个副本
```yaml
kubectl get deploy
kubectl scale deployment nginx-1  --replicas=10
```
### 配置文件
- `minReadySeconds`	
  - 容器接受流量延缓时间：单位为秒，默认为0。如果没有设置的话，k8s会认为容器启动成功后就可以用了。设置该值可以延缓容器流量切分
- `strategy.type = RollingUpdate`	
  - ReplicaSet 发布类型，声明为滚动发布，默认也为滚动发布
- `strategy.rollingUpdate.maxSurge`
  - 最多Pod数量：为数字类型/百分比。如果 maxSurge 设置为1，replicas 设置为10，则在发布过程中pod数量最多为10 + 1个（多出来的为旧版本pod，平滑期不可用状态）。maxUnavailable 为 0 时，该值也不能设置为0
- `strategy.rollingUpdate.maxUnavailable`
  - 升级中最多不可用pod的数量：为数字类型/百分比。
  - 当 maxSurge 为 0 时，该值也不能设置为0。
```yaml
# 增加
minReadySeconds: 1
strategy:
  type: RollingUpdate
  rollingUpdate:
  maxSurge: 1
  maxUnavailable: 0
replicas: 10

# 增加后的     
apiVersion: apps/v1  #API 配置版本
kind: Deployment     #资源类型
metadata:
  name: nginx-1     #资源名称
spec:
  minReadySeconds: 1
  strategy:
   type: RollingUpdate
   rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
  replicas: 10
  selector:
    matchLabels:
      app: nginx-1 #告诉deployment根据规则匹配相应的Pod进行控制和管理，matchLabels字段匹配Pod的label值
  replicas: 3 #声明一个 Pod,副本的数量
  template:
    metadata:
      labels:
        app: nginx-1 #Pod的名称
    spec:   #组内创建的 Pod 信息
      containers:
      - name: nginx #容器的名称
        image: songge/nginx-dome3 #使用哪个镜像
        ports:
        - containerPort: 80 #容器内映射的端口
```
- 保存后 监控&&查看效果
- `kubectl apply -f ./depnginx1.yaml && kubectl rollout status deployment/nginx-1`

### 另一种发布模式
- 在 Kubernetes 中，有一种发布方式为 Recreate 。这种发布方式比较暴力，它会直接把所有旧的 Pod 全部杀死。杀死后再批量创建新的 Pod 。
- 我们只需要将  strategy.type  改为 Recreate 即可：
```yaml
type: Recreate
```
## kubectl rollout
- kubectl rollout 命令可以用来操纵 deployment 的资源进行管理。包括对版本的快速回退，暂停/恢复版本更新，根据更新历史回退版本等功能。
- 暂停
  - `kubectl rollout pause deployment/名称`
- 继续
  - `kubectl rollout resume deployment/名称`
- 查看一个 deployment 的发布状态：
  - `kubectl rollout status deployment/名称`

## Kubernetes Secret：储存你的机密信息
### Secret 的几种类型
### Opaque 类型
- 第一种是 opaque 类型，这种类型比较常用，一般拿来存放密码，密钥等信息，存储格式为 base64 。但是请注意：base64并不是加密格式，依然可以通过decode来解开它。
- `kubectl create secret generic` 命令式创建
  - default-auth 为 自定义的名称
  - --from-literal 的后面则跟随一组 key=value
- `kubectl create secret generic default-auth --from-literal=username=sg --from-literal=password=123456`
- `kubectl get secret` 查看
```yaml
NAME                  TYPE                                  DATA   AGE
default-auth          Opaque                                2      7s
default-token-kqdc8   kubernetes.io/service-account-token   3      7d
```
- `kubectl edit secret default-auth` 编辑
- 这里也可以用 kubectl get secret [secret名称] -o yaml 命令，将内容打印到终端上查看。其中 -o yaml 代表输出为 yaml 格式内容，当然也可以输出 json 等格式内容
```yaml
# Please edit the object below. Lines beginning with a '#' will be ignored,
# and an empty file will abort the edit. If an error occurs while saving this file will be
# reopened with the relevant failures.
#
apiVersion: v1
data:
  password: MTIzNDU2
  username: c2c=
kind: Secret
metadata:
  creationTimestamp: "2021-09-25T08:58:52Z"
  name: default-auth
  namespace: default
  resourceVersion: "942128"
  uid: 4214d3eb-2f33-421d-bdd0-98cf593c0807
type: Opaque
```
- 这里可以使用 Linux 自带的 base64 命令进行解码。其中 -d 代表 --decode，解码的意思
- `echo MTIzNDU2 | base64 -d` 查看
- `echo c2c= | base64 -d` 查看

- 声明式创建
- vim admin-auth.yaml
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: admin-auth
stringData:
  username: sg
  password: 123@1234
type: Opaque


kubectl apply -f admin-auth.yaml
kubectl get secret admin-auth -o yaml
```
### 私有镜像库认证
- 第二种是私有镜像库认证类型，这种类型也比较常用，一般在拉取私有库的镜像时使用。
- 在这里我们依然可以通过命令行进行创建。只不过类型变成了 docker-registry
```yaml
vim docker-registry.yaml

kubectl create secret docker-registry private-registry \
--docker-username=[sg] \
--docker-password=[123456] \
--docker-email=[123@qq.com] \
--docker-server=[www]

kubectl get secret private-registry -o yaml
```
- 可以看到，k8s 自动帮我们填写了一个key，为 .dockerconfigjson ；value则是一串 base64 值。我们依然可以使用 base64 -d 命令查看下里面到底是啥：
```yaml
echo [value] | base64 -d
```

- 当然，私有镜像库密钥组也可以通过配置文件创建。编辑文件名为 private-registry-file.yaml 文件，并输入以下内容：
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: private-registry-file
data:
  .dockerconfigjson: eyJhdXRocyI6eyJodHRwczovL2luZGV4LmRvY2tlci5pby92MS8iOnsidXNlcm5hbWUiOiJhZG1pbiIsInBhc3N3b3JkIjoiMzY3NzM0IiwiZW1haWwiOiJqYW5sYXk4ODQxODEzMTdAZ21haWwuY29tIiwiYXV0aCI6IllXUnRhVzQ2TXpZM056TTAifX19
type: kubernetes.io/dockerconfigjson
```
- 在这里， data内的字段必须为 .dockerconfigjson，值则是一串 dockerconfigjson 的 base64 值；type 则为 kubernetes.io/dockerconfigjson ，意思是声明一份 dockerconfig 的配置
```yaml
kubectl apply -f ./private-registry-file.yaml
kubectl get secret private-registry-file -o yaml
```
## 密钥的使用方法
- 上面我们写了如何声明一个 Secret。在声明后，我们需要在实际的配置中使用，才有实际意义。在 K8S 中，一共有三种可以使用 Secret 的方式。
### Volume 挂载
- 第一种是通过存储卷的方式挂载进去。我们可以编辑下 `depnginx1.yaml` 的 deployment 配置文件去配置下。
- 第一步：在Pod层面设置一个外部存储卷，存储卷类型为 secret 。在 template.spec 下填写。这里代表声明了一个外置存储卷，存储卷名称为 admincert ，类型为 secret；Secret 的名称为 admin-auth ：
```yaml
volumes:
- name: admincert
  secret:
    secretName: admin-auth
```
- 第二步：在容器配置配置存储卷。在 containers.name[] 下填写字段 volumeMounts 。这里的 name 值和上面的卷名是对应的。 mountPath 是要挂载到容器内哪个目录下，这里代表挂载到用户目录下； readonly 则代表文件是不是只读：
```yaml
volumeMounts:
- name: admincert
  mountPath: /root
  readOnly: true
```
- 修改 vim depnginx1.yaml 配置
```yaml
apiVersion: apps/v1  #API 配置版本
kind: Deployment     #资源类型
metadata:
  name: nginx-1     #资源名称
spec:
  minReadySeconds: 1
  strategy:
   type: RollingUpdate
   rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
  replicas: 10
  selector:
    matchLabels:
      app: nginx-1 #告诉deployment根据规则匹配相应的Pod进行控制和管理，matchLabels字段匹配Pod的label值
  template:
    metadata:
      labels:
        app: nginx-1 #Pod的名称
    spec:   #组内创建的 Pod 信息
      containers:
       - name: nginx #容器的名称
         image: songge/nginx-dome3 #使用哪个镜像
         volumeMounts:
         - name: admincert
           mountPath: /root
           readOnly: true
         ports:
          - containerPort: 80 #容器内映射的端口
      volumes:
       - name: admincert
         secret:
           secretName: admin-auth
```
- 在运行正常的情况下，我们可以使用 kubectl exec 命令在 Pod 容器内执行我们要执行的命令。在这里，我们查看下 Pod 镜像内的 /root 文件夹里面都有啥文件：
- `kubectl exec 命令格式：kubectl exec [POD] -- [COMMAND]`
- `kubectl exec -it [POD_NAME] -- ls /root` 或者 `kubectl exec -it [POD_NAME] /bin/bash`
- kubectl exec -it [POD_NAME] -- cat /root/password
- kubectl exec -it [POD_NAME] -- cat /root/username

### 环境变量注入
- 第二种是将 Secret 注入进容器的环境变量。同样需要配置下 deployment 文件。找到 containers ，下面新加一个 env 字段：
- 其中， env[].name 为环境变量的 key ， valueFrom 为值； secretKeyRef 则代表是一个 Secret 类型的 value。
- secretKeyRef.name  则是要引用的 secret 的名称，key 则是 secret 中配置的 key 值。
```yaml
env:
	- name: USERNAME
  	valueFrom:
  		secretKeyRef:
    		name: admin-auth
      	key: username
	- name: PASSWORD
    valueFrom:
    	secretKeyRef:
      	name: admin-auth
        key: password



apiVersion: apps/v1  #API 配置版本
kind: Deployment     #资源类型
metadata:
  name: nginx-1     #资源名称
spec:
  minReadySeconds: 1
  strategy:
   type: RollingUpdate
   rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
  replicas: 10
  selector:
    matchLabels:
      app: nginx-1 #告诉deployment根据规则匹配相应的Pod进行控制和管理，matchLabels字段匹配Pod的label值
  template:
    metadata:
      labels:
        app: nginx-1 #Pod的名称
    spec:   #组内创建的 Pod 信息
      containers:
       - name: nginx #容器的名称
         env:
          - name: USERNAME
            valueFrom:
              secretKeyRef:
               name: admin-auth
               key: username
          - name: PASSWORD
            valueFrom:
              secretKeyRef:
               name: admin-auth
               key: password
         image: songge/nginx-dome3 #使用哪个镜像        
         ports:
          - containerPort: 80 #容器内映射的端口
      volumes:
       - name: admincert
         secret:
           secretName: admin-auth

kubectl apply -f ./v1.yaml
kubectl get pods
# 查看所有的环境变量
kubectl exec -it nginx-1-5864ff7-55hc7 -- env
# 打印
echo $USERNAME
# 查看所有环境变量
env
```
### Docker 私有库认证
- 第三种是 Docker 私有库类型，这种方法只能用来配置 私有镜像库认证。
- 首先，我们先尝试不加认证去拉取一个私有库镜像。编辑下 `depnginx1.yaml` 的 deployment，把镜像换成私有库的镜像。保存后使用 kubectl apply 生效配置：
```yaml
image: [镜像库地址]/jenkins-test:latest
# 查看状态
kubectl get pods
```
- 可以看到， `depnginx1.yaml`  的 Pod 并无法拉取下来镜像。我们使用 kubectl describe 命令查看下该 Pod 的具体状态：
- 找到 Events 那一块，可以其中一条 message 写着：unauthorized: access to the requested resource is not authorized（要请求的资源没有认证）。此时不登录，无法拉取私有镜像。
- 这里我们需要配置下 deployment 文件。
- 找到 spec ，下面新加一个 imagePullSecrets 字段。该字段代表了在拉取Pod所需要的镜像时，需要的认证信息。其中，name 字段为上面我们配置过的私有镜像库认证名。
```yaml
imagePullSecrets:
 - name: private-registry-file

# 在执行
kubectl apply -f xxx
```

## ConfigMap
- 统一管理服务环境变量
- Kubernetes Secret 的主要作用是来存放密码，密钥等机密信息
- 对于环境变量的配置：例如你的数据库地址，负载均衡要转发的服务地址等信息。这部分内容使用 Secret 显然不合适，打包在镜像内耦合又太严重。这里，我们可以借助 Kubernetes ConfigMap 来配置这项事情

### 什么是 ConfigMap
- ConfigMap 是 Kubernetes 的一种资源类型，我们可以使用它存放一些环境变量和配置文件
- 信息存入后，我们可以使用挂载卷的方式挂载进我们的 Pod 内，也可以通过环境变量注入
- 和 Secret 类型最大的不同是，存在 ConfigMap 内的内容不会加密

### 1、创建
- 命令行直接创建

```yaml
fll= create configmap [config_name] --from-literal=[key]=[value]
kubectl create configmap mysql-config --from-literal=MYSQL_HOST=192.168.1.172 --from-literal=MYSQL_PORT=3306
```
- 需要注意，configmap 的名称必须是全小写，特殊符号只能包含 '-' 和 '.'。可以用下面的这个正则表达式校验下看看符不符合规则：[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*')
- `configmap` 简写 cm
```yaml
kubectl get cm
kubectl describe cm mysql-config
```
### 2、配置清单创建
- kind 的值为 ConfigMap,代表声明一个 ConfigMap 类型的资源
- metadata.name 代表是该 configmap 的名称
- data 是存放数据的地方，数据格式为 key:value
```yaml
mysql-config-file.yaml

apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-config-file
data:
  MYSQL_HOST: "192.168.1.172"
  MYSQL_PORT: "3306"


kubectl apply -f ./mysql-config-file.yaml
kubectl describe cm mysql-config-file
``` 
### 3、文件创建
- `--from-file`代表一个文件
- `key`是文件在 `configmap` 内的 `key`
- `file_path` 是文件的路径
```yaml
kubectl create configmap [configname] --from-file=[key]=[file_path]
```
- env.config
```yaml
HOST: 192.168.0.1
PORT: 8080
kubectl create configmap [configname] --from-file=env=./env.config
# configmap/env-from-file created
# -o yaml 输出成 yaml 格式
kubectl get cm env-from-file -o yaml
```

```yaml
apiVersion: v1
data:
  env: |
    L: 172.168.81.111
    PATH: /root/abcd/efg
kind: ConfigMap
metadata:
  creationTimestamp: "2021-09-26T02:32:36Z"
  managedFields:
  - apiVersion: v1
    fieldsType: FieldsV1
    fieldsV1:
      f:data:
        .: {}
        f:env: {}
    manager: kubectl-create
    operation: Update
    time: "2021-09-26T02:32:36Z"
  name: env-from-file
  namespace: default
  resourceVersion: "1040172"
  uid: 35b672f8-461b-4713-bc3f-92a7a2691c22
```

### 目录创建
- 也可以直接将一个目录下的文件整个存入进去
```yaml
kubectl create configmap [configname] --from-file=[dir_path]
```
- 创建文件
```yaml
mkdir env && cd ./env
echo 'local' > env.local
echo 'test' > env.test
echo 'prod' > env.prod
```
- 执行
```yaml
kubectl create configmap env-from-dir --from-file=./
kubectl get cm env-from-dir -o yaml
```
### 使用
### 环境变量注入
- 注入到环境变量是一种比较常见的方式。在这里，我们编辑下 `depnginx1.yaml` 的 deployment 配置文件，来将 configmap 注入进环境变量内：
```yaml
env:
- name: MYSQL_HOST
  valueFrom:
    configMapKeyRef:
      name: mysql-config
      key: MYSQL_HOST
```
```yaml
//kubectl exec -it [POD_NAMEex] -- env | grep MYSQL_HOST
kubectl exec  -it user-v1-744f48d6bd-9klqr -- env | grep MYSQL_HOST
# 找不到 上面key 只配置了MYSQL_HOST
kubectl exec  -it nginx-1-6f69565599-6hmvq  -- env | grep MYSQL_PORT
```
### 存储卷挂载
- 第二种方式是存储卷挂载。这种方式会将 configmap 里内容中的每个 key 和 value，以独立文件方式以外部挂载卷方式挂载进去（ key 是文件名，value 是文件内容）。这部分的用法和 Secret 的用法很像
- 第一步：在 Pod 层面声明一个外部存储卷。 name 为存储卷名称；configMap 代表存储卷的文件来源为 configMap ； configMap.name 要填入要加载的 configMap 名称。位置如图所示：
- 第二步：在容器镜像层面配置存储卷。 name 的值来源于第一步配置的 name 值； mountPath 为要挂载的目录；readonly 则代表文件是不是只读。位置如图所示：
- 我们编辑下 depnginx-1 的 deployment 配置文件，修改下配置：

```yaml
volumes:
- name: envfiles
  configMap: 
    name: env-from-dir

volumeMounts:
- name: envfiles
  mountPath: /root/
  readOnly: true

apiVersion: apps/v1  #API 配置版本
kind: Deployment     #资源类型
metadata:
  name: nginx-1     #资源名称
spec:
  minReadySeconds: 1
  strategy:
   type: RollingUpdate
   rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
  replicas: 10
  selector:
    matchLabels:
      app: nginx-1 #告诉deployment根据规则匹配相应的Pod进行控制和管理，matchLabels字段匹配Pod的label值
  template:
    metadata:
      labels:
        app: nginx-1 #Pod的名称
    spec:   #组内创建的 Pod 信息
      containers:
       - name: nginx #容器的名称`:
         image: songge/nginx-dome3 #使用哪个镜像        
         volumeMounts:
          - name: envfiles
            mountPath: /root/
            readOnly: true
         ports:
          - containerPort: 80 #容器内映射的端口
      volumes:
       - name: envfiles
         configMap:
           name: env-from-dir
```
- 但是，这种方式每次挂载都要将整个文件夹挂载进去，我们如何一次只挂载单个文件呢？这里我们可以借助 volumes.configMap.items[] 字段来配置多个 item 项：
```yaml
volumes:
- name: envfiles
  configMap:
    name: env-from-dir
    items:
    - key: env.local
      path: env.local
    - key: env.test
      path: env.test
```
- 这里的 item 是个数组，每一项都是一条 ConfigMap 里的独立字段。

- 其中， key 是 ConfigMap 中的字段名称； path 则是要挂载的路径（相对于在容器镜像层面配置存储卷配置的 mountPath 字段）。填写保存后退出生效

- 接着我们用 kubectl exec 命令验证下挂载结果
## 服务发现
- 当A服务依赖另一个 B服务,而我们常常不知道 B服务 的端口和IP，且端口和IP也相对不固定有可能经常更改
- 这时候，我们就需要服务发现
- 服务发现是指使用一个注册中心来记录分布式系统中的全部服务的信息，以便其他服务能够快速的找到这些已注册的服务
### CoreDNS
- Pod 的 IP 常常是漂移且不固定的，所以我们要使用 Service 这个神器来将它的访问入口固定住
- 可以利用 DNS 的机制给每个 Service 加一个内部的域名，指向其真实的IP
- 在Kubernetes中，对 Service 的服务发现，是通过一种叫做 CoreDNS 的组件去实现的
- coreDNS 是使用 Go 语言实现的一个DNS服务器
  - -n 按命名空间过滤
  - -l 按标签过滤
  - -o wide 输出额外信息。对于Pod，将输出Pod所在的Node名
```yaml
kubectl -n kube-system get all  -l k8s-app=kube-dns -o wide
```
### 服务发现规则
- kubectl exec 的作用是可以直接在容器内执行Shell脚本
  - 命令格式：kubectl exec -it [PodName] -- [Command]
  - -i：即使没有连接，也要保持标准输入保持打开状态。一般与 -t 连用。
  - -t：分配一个伪TTY（终端设备终端窗口），一般与 -i 连用。可以分配给我们一个Shell终端
```yaml
kubectl get pods
kubectl get svc
kubectl exec -it user-v1-688486759f-9snpx -- /bin/sh
curl http://service-user-v2
```
- namespace(命名空间)
  -  kubernetes namespace（命名空间）是 kubernetes 里比较重要的一个概念
  -  在启动集群后，kubernetes 会分配一个默认命名空间，叫default。不同的命名空间可以实现资源隔离，服务隔离，甚至权限隔离
  -  因为我们在之前创建的服务，都没有指定 namespace ，所以我们的服务都是在同一个 namespace default下
  -  在同 namespace 下的规则，我们只需要直接访问 http://ServiceName:Port 就可以访问到相应的 Service
  -  不同 namespace 下的规则是 [ServiceName].[NameSpace].svc.cluster.local
-  ServiceName 就是我们创建的 Service 名称
- NameSpace 则是命名空间。如果你没有命名空间，则这个值为 default。
```yaml
curl http://service-user-v2.default.svc.cluster.local
```
## 污点与容忍
- 在 `Kubernetes` 中， Pod 被部署到 Node 上面去的规则和逻辑是由 `Kubernetes` 的调度组件根据 Node 的剩余资源，地位，以及其他规则自动选择调度的。但是有时候在设计架构时，前端和后端往往服务器资源的分配都是不均衡的，甚至有的服务只能让特定的服务器来跑。
- 在这种情况下，我们选择自动调度是不均衡的，就需要人工去干预匹配选择规则了。这时候，就需要在给 Node 添加一个叫做污点的东西，以确保 Node 不被 Pod 调度到。
- 当你给 Node 设置一个污点后，除非给 Pod 设置一个相对应的容忍度，否则 Pod 才能被调度上去。这也就是污点和容忍的来源。
- 污点的格式是 `key=value`，可以自定义自己的内容，就像是一组 `Tag` 一样。

### 给 Node 设置污点
- 其中，Node_Name 为要添加污点的 node 名称；key 和 value 为一组键值对，代表一组标示标签；NoSchedule 则为不被调度的意思，和它同级别的还有其他的值：PreferNoSchedule 和 NoExecute （后面我们会写到）
- 删除pod 重启pod 会发现 node2没有被分配到
- Pod 被调度到了 Node1 上面去。因为 Node2 添加了污点，不会被调度到 Node2 上面去。此时污点生效。
```yaml
kubectl taint nodes [Node_Name] [key]=[value]:NoSchedule
# demo
kubectl taint nodes node2 nginx-2=true:NoSchedule

kubectl delete pod [POD_NAME]
kubectl describe pod [POD_NAME]
```
### 给 Pod 设置容忍度
- 可以看到，给 Node 添加完污点后，新创建的 `Pod` 都不会调度到添加了污点的 `Node` 上面。所以我们想让 `Pod` 被调度过去，需要在 Pod 一侧添加相同的容忍度才能被调度到。
- 我们编辑 `deployment` 配置文件，在 `template.spec` 下添加以下字段：
- 字段的含义是在给 `Pod` 设置一组容忍度，以匹配对应的 `Node` 的污点。 `key` 和 `value` 是你配置 `Node` 污点的 `key` 和 `value；` `effect` 是 `Node` 污点的调度效果，和 `Node` 的设置项也是匹配的。
- `operator` 是运算符，`equal` 代表只有 `key` 和 `value` 相等才算数。当然也可以配置 `exists` ，代表只要 `key` 存在就匹配，不需要校验 `value` 的值
- 修改保存后，我们使用 `kubectl apply -f` 命令让配置项生效，接着删除已存在的 `Pod`，查看下新`Pod`的调度结果：

```yaml
tolerations:
- key: "YOUR KEY"
  operator: "Equal"
  value: "VALUE"
  effect: "NoSchedule"



kind: Deployment     #资源类型
metadata:
  name: nginx-2     #资源名称
spec:
  selector:
    matchLabels:
      app: nginx-2 #告诉deployment根据规则匹配相应的Pod进行控制和管理，matchLabels字段匹配Pod的label值
  replicas: 5 #声明一个 Pod,副本的数量
  template:
    metadata:
      labels:
        app: nginx-2 #Pod的名称
    spec:   #组内创建的 Pod 信息
      tolerations:
      - key: "nginx-2"
        operator: "Equal"
        value: "true"
        effect: "NoSchedule"
      containers:
      - name: nginx #容器的名称
        image: songge/nginx-dome2 #使用哪个镜像
        ports:
        - containerPort: 80 #容器内映射的端口
```
### 修改/删除 Node 的污点
- 修改污点的方式也很简单，像创建一个污点一样，我们依然使用 `kubectl taint` 命令就可以完成修改：
```yaml
kubectl taint nodes [Node_Name] [key]=[value]:NoSchedule --overwrite
```
- 这里的 key 依然是要修改的 key 值，只需要对 value 和作用的值进行修改即可。后面添加参数 --overwrite 代表覆盖之前的数据。
- 删除污点也依然很简单。我们只需要加个 - 号就可以删除污点：
```yaml
kubectl taint nodes [Node_Name] [key]-
```