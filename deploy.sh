
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist


git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
git push -f https://github.com/xiaoqi7777/xiaoqi7777.github.io.git master


24000 + 46000 = 70000

31200 + 38000 = 

2187+3553+1000+300+400+2000