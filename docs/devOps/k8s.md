# Kubernetes
- Kubernetes 看作是用来是一个部署镜像的平台
## 搭建&&配置
- 主机配置，云服务器mater节点2c4g,image私服2c4c,2台node节点1c2g
## Master & Node 节点都需要安装
- vim 是 Linux 下的一个文件编辑器
- wget 可以用作文件下载使用
- ntpdate 则是可以用来同步时区
```yaml
yum install vim wget ntpdate -y
```
- 关闭防火墙
  - kubernetes 会创建防火墙规则,先关闭firewalld
```yaml
systemctl stop firewalld & systemctl disable firewalld
```
- 关闭 Swap 分区
  - Swap 是 Linux 的交换分区，在系统资源不足时，Swap 分区会启用,这个我们不需要
  - 应该让新创建的服务自动调度到集群的其他 Node 节点中去，而不是使用 Swap 分区
```yaml
#临时关闭
swapoff -a
```
- 关闭 Selinux
  - 关闭Selinux是为了支持容器可以访问宿主机文件系统
```yaml
# 暂时关闭 selinux
setenforce 0

# 永久关闭
vi /etc/sysconfig/selinux
# 修改以下参数，设置为disable
SELINUX=disabled
```
- 统一我们的系统时间和时区
  - 使用 ntpdate 来统一我们的系统时间和时区,服务器时间与阿里云服务器对齐
```yaml
# 统一时区，为上海时区
ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
bash -c "echo 'Asia/Shanghai' > /etc/timezone"

# 统一使用阿里服务器进行时间更新
ntpdate ntp1.aliyun.com
```
- 安装 Docker
  - 在 kubernetes 中的组件，服务都可以 Docker 镜像方式部署的,所以需要安装Docker
  - device-mapper-persistent-data: 存储驱动，Linux上的许多高级卷管理技术
  - lvm: 逻辑卷管理器，用于创建逻辑磁盘分区使用
```yaml
yum install -y yum-utils device-mapper-persistent-data lvm2


sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
yum install docker-ce -y
systemctl start docker
systemctl enable docker

sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://fwvjnv59.mirror.aliyuncs.com"]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker.service
```
- 安装 Kubernetes 组件
  - 切换阿里云源
```yaml
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
- 安装 Kubernetes 组件
  - kubelet 是 Kubernetes 中的核心组件。它会运行在集群的所有节点上，并负责创建启动服务容器
  - kubectl 则是Kubernetes的命令行工具。可以用来管理，删除，创建资源
  - kubeadm 则是用来初始化集群，子节点加入的工具
```yaml
#  直接安装下面这个会有问题 k8s.gcr.io/coredns 版本下载有问题
#  yum install -y kubelet kubeadm kubectl
yum install -y kubelet-1.20.0-0 kubeadm-1.20.0-0 kubectl-1.20.0-0
# 启动kubelet
systemctl enable kubelet && systemctl start kubelet
```
- 设置bridge-nf-call-iptables
  - 配置内核参数，将桥接的IPV4浏览传递到iptables链
  - 开启了bridge-nf-call-iptables
```yaml
echo 1 > /proc/sys/net/bridge/bridge-nf-call-iptables
```
## mater节点配置
- Master 节点是集群内的调度和主要节点
- 修改主机名称为 master
- 配置hosts
```yaml
hostnamectl set-hostname  master

# ip addr 查看
# vim /etc/hosts 内网ip
172.31.178.169  master  master
```
### 配置 Kubernetes 初始化文件
- 更换 Kubernetes 镜像仓库为阿里云镜像仓库，加速组件拉取
- 替换 ip 为自己主机 ip
- 配置 pod 网络为 flannel 网段
- 为了让集群之间可以互相通信，需要配置子网络,这些在后面的flannel网络中需要用到
  - 10.96.0.0/12 是Kubernetes内部services需要的网络
  - 10.244.0.0/16 是Kubernetes内部的网络pods需要的网络
```yaml
kubeadm config print init-defaults > init-kubeadm.conf
vim init-kubeadm.conf

- imageRepository: k8s.gcr.io 更换k8s镜像仓库
+ imageRepository: registry.cn-hangzhou.aliyuncs.com/google_containers
- localAPIEndpointc，advertiseAddress为master ip ,port默认不修改
localAPIEndpoint:
+ advertiseAddress: 172.31.178.169  # 此处为master的IP
  bindPort: 6443
# 配置子网络
networking:
  dnsDomain: cluster.local
  serviceSubnet: 10.96.0.0/12
+ podSubnet: 10.244.0.0/16    # 添加这个
```
- 拉取其它组件
  - kubeadm 可以用来拉取我们的默认组件镜像
  - kube-apiserver 提供接口服务，可以让外网访问集群
  - kube-controller-manager 内部的控制指令工具
  - kube-scheduler 内部的任务调度器
  - kube-proxy 反向代理和负载均衡，流量转发
  - pause 进程管理工具
  - etcd 保持 集群内部的数据一致性
  - coredns 集群内网通信

<img :src="$withBase('/img/k8s_components.jpg')" >

```yaml
// 查看缺少的组件
kubeadm config images list --config init-kubeadm.conf
// 拉取缺少的组件
kubeadm config images pull --config init-kubeadm.conf
```
- 初始化 Kubernetes
```yaml
kubeadm init --config init-kubeadm.conf
```
- kubeadm join 可以快速将 Node 节点加入到 Master 集群内
  - Master 节点需要执行的初始化命令
  - 将默认的 Kubernetes 认证文件拷贝进 .kube 文件夹内，才能默认使用该配置文件
```yaml
kubeadm init --config init-kubeadm.conf
# -----------------以下是日志
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:
  # master 节点需要执行
  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:
# node节点 加入master节点
kubeadm join 172.31.178.169:6443 --token abcdef.0123456789abcdef \
    --discovery-token-ca-cert-hash sha256:8aac19f4dbe68f1e15ba3d80e141acdc912e353f9757ad69187e8fb9780bc975 
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
- 查看master 启动情况
  - 查看启动情况,后面node 加入后 会多一条记录
```yaml
kubectl get nodes

NAME     STATUS   ROLES                  AGE     VERSION
master   Ready    control-plane,master   9m34s   v1.20.4
```
## Node节点配置
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

### Pod
- Pod 是 K8S 中最小的可调度单元（可操作/可部署单元）
- 它里面可以包含1个或者多个 Docker 容器
- 在 Pod 内的所有 Docker 容器，都会共享同一个网络、存储卷、端口映射规则
- 一个 Pod 拥有一个 IP,但这个 IP 会随着Pod的重启，创建，删除等跟着改变，所以不固定且不完全可靠,这也就是 Pod 的 IP 漂移问题。这个问题我们可以使用下面的 Service 去自动映射
- Pod 是一个容器组，里面有很多容器，容器组内共享资源
### deployment
- 希望批量启动和管理多个Pod实例，就可以使用deployment
### Service
- 有了Pod实例后就需要以固定的IP地址以负载均衡的方式访问多个Pod实例，就有了Service
