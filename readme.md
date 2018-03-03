<img src="http://image.baidu.com/search/detail?z=0&word=%E4%BA%91%E6%BC%AB%E4%BD%9C%E5%93%81&hs=0&pn=0&spn=0&di=0&pi=43552798411&tn=baiduimagedetail&is=0%2C0&ie=utf-8&oe=utf-8&cs=730569360%2C1433074384&os=&simid=&adpicid=0&lpn=0&fm=&sme=&cg=&bdtype=-1&oriquery=&objurl=http%3A%2F%2Fd.hiphotos.baidu.com%2Fimage%2Fpic%2Fitem%2Fbba1cd11728b471072e43adfc9cec3fdfd0323de.jpg&fromurl=&gsm=0&catename=pcindexhot" alt="fishjoy framework for nodejs" width="100px" height="50" />fishjoy V3版本基于V2进行一次技术升级，在升级过程中，会引入一些新模块、新技术，为方便开发人员开发新项目能够快速迁移过来，把V3版本从开发环境到部署运行设计到的相关内容，整理成文，供使用者参考

# 项目优化
 
- 对外业务模块接口优化，变更为通过EventId 进行事件分发，模块化内部业务实现
- 业务错误码模板定义
- 利用es6新特性，完成部分模块的迁移升级
- 大厅单节点负载问题
- 平台性能测试工具``````````
- omelo客户端JS驱动更新
- cocos creator引入
- omelo start -e production --daemon
- apt install sysstat
- npm install -g supervisor

# 性能优化
node --prof app.js

node --prof-process isolate-000000000043B880-v8.log > processed.txt


# node升级到v8.9.0 Latest LTS: Carbon
- ## linux
	安装NVM: curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
	安装NODE: nvm install v8.9.0

- ## 包管理工具使用cnpm
	优势：资源位于淘宝镜像服务器，同官方保持10分钟同步一次。
	安装：npm install -g cnpm --registry=https://registry.npm.taobao.org
	使用：同npm一样，仅命令采用cnpm即可

# web 采用基于egg框架
- ## 概述
	基于koa的框架，支持es新特性，回调噩梦
- ## 部署
	npm i egg-init -g
	生成koa项目： egg-init egg-example --type=simple
	启动项目:npm run dev 完成启动
	mysql -h10.66.204.213 -uroot -pCh123456

- ## 开发
	参考：
``` 
http://www.jianshu.com/p/6b816c609669
http://koajs.com/#introduction
https://github.com/guo-yu/koa-guide
http://eggjs.org/zh-cn/intro/index.html
```
# koa项目
	## 安装 
		npm install -g koa-generator 
	## 生成
		koa2 koa_demo -e --ejs 


# 开发工具
- ## webstorm
- ## visual studio code
	### 插件
- ## curl:
```

curl -l -H "Content-type: application/json" -X POST -d '{"aes":false,"data":{"token":"3747_03458cd087cb11e7ba758392291a4bfa","payChannel":1003,"payData":{"cardCode":"93474901263928","cardSerial":"36330400022121","cardType":"vnp"}}}'  "http://171.244.35.45:1338/client_api/get_api_server"
```

```
Git History:提交历史及版本对比
ESLint: 代码检测
Chrome DevTools Protocol: 前端代码调试 
```

# 调试工具
## node-inspector
## visual studio code

# 代码检测
## 安装
- ## 全局安装依赖  
	- 安装eslint 工具：npm i eslint -g
	- 执行命令：eslint ../../servers/ --ext .js
	- 自动修复：eslint --fix ../../servers/ --ext .js
```eslint-config-standard
eslint-plugin-import
eslint-plugin-node
eslint-plugin-promise
eslint-plugin-standard
eslint-plugin-promise
```

- ## 维护指令
	- 文件内容搜索 find . -name 'fjs-out-0.log' -exec grep -in 'pay response:' {} \; -print
	- 服务进程列表：omelo list
	- 关闭进程：omelo kill all
	- 强制关闭所有node进程：pkill node
	- 后台启动生成环境：omelo start -e production -D
	- 后台启动开发环境：omelo start -D
	- 重启进程：omelo restart -i 服务ID





			 

	