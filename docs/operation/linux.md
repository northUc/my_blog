# linux

## 命令基本格式
### 命令提示符
```js
// [root@localhost ~]#
```
- root 当前登录用户
- localhost 主机名
- ~ 当前工作目录,默认是当前用户的家目录，root就是/root,普通用户是 /home/用户名
- 提示符 超级用户是 #,普通用户是$

### ls
- 查询目录中的内容
- ls [选项] [文件或者目录]
- 选项
  -  -a 显示所有文件，包括隐藏文件
  -  -l 显示详细信息
  -  -d 查看目录本身的属性而非子文件 ls /etc/
  -  -h 人性化的方式显示文件大小
- 显示详细信息
```js
/* 
drwxr-xr-x  root  root   800 Sep 16 00:19 logs
drwxr-xr-x  文件类型和权限
root 所有者
root 所属组
800 文件大小
Sep 16 00:19 最后修改时间
logs 文件名
*/
```
### 文件操作命令
-  mkdir
-  -p 递归创建
```js
// mkdir hello
// mkdir -p hello/h/e
```
- cd 切换目录
- pwd 显示当前目录
- rm 删除目录   
  -  删除文件或者目录 remove
  -  -rm [文件或者目录]
  -  -r 删除目录
  -  -f 强制删除
- cp
  -  copy 复制命令
  -  copy [源文件或者目录] [目标文件]
  -  -r 复制目录,默认是复制文件
  -  -i 会在复制文件的时候给提示,如果复制的目标文件存在,会给你提示是否要覆盖
```js
/*
mkdir afolder
mkdir bfolder
cd afolder/
touch 1.txt
cp 1.txt ~/bfolder/
*/
```
- mv
  -  移动文件或者改名 move
  -  mv [源文件或者目录] [目标文件]
```js
mv 1.txt 11.txt
```
-  ln
  -  链接命令,生成链接文件 link
  -  ln -s [源文件] [目标文件]
  -  -s 创建软链接
  -  修改任意一个文件，另一个都会改变
  -  删除源文件，软链接不能使用
  -  软链接源文件必须写绝对路径
```js
// # ln -s /root/bfolder/11.txt 22.txt
```
- 环境变量 下面几个文件轮着查询
- echo $PATH(查询环境变量的文件)
- /usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

- find
-  文件搜索命令
-  find [搜索范围] [搜索条件]
```js
// find / -name 11.txt
```
- -i 
  -  不区分大小写
```js
// find . -iname "Ab[cdef].txt"
```
- -user
- 按所有者进行搜索
```js
// find /root -user root
// find /root -nouser
```
- 按时间搜索
```js
/* 
atime	文件访问时间
ctime	改变文件属性
mtime	修改文件内容
-5	5天内修改的文件
5	5天前当前修改的文件
+5	5天前修改的文件

find . -mtime +5
*/ 
```
- 按大小搜索
- k小写,M大写
```js
/*
-8k	小于8K
8k	等于8K
+8k	大于8K
+8M	小于8M

find . -size +0k
*/
```
- 综合应用
- exec 对上个命令的结果进行操作
```js
/*
查找/etc目录下，大于10KB并且小于20KB的文件
-a and 逻辑与，两个条件都满足
-o or 逻辑或，两个条件满足一个就可以
find /tmp -size +10k -a -size -20k
find /tmp -size +10k -a -size -20k

*/ 
```