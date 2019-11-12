#### b-proxy-cli 
http/https中间人代理工具

    😀无需转发rule, 自动匹配请求资源 与 本地文件

#### 软件实现的功能

* http/https 中间人    
* 自动处理线上与本地文件映射
* 手动rewrite请求url

### 使用本软件的前提

* 代理https服务，需要安装根证书
* 本地服务器目前仅支持webpack-dev-server启动
* 使用自动匹配情况下--请求资源与匹配资源，文件名需要大体相似，不能请求 common.chunk.js 本地却请求main.chunk.js。



###安装

```angular2
npm install b-proxy-cli -g

```

如果要代理https网站，请务必安装根证书，根证书的位置放在模块下面的src/rootCA.crt
请安装，并选择"完全信任"；

###使用

```angular2
b-proxy-cli --config ./proxy-config-extend.js
```
配置文件demo
```angular2
module.exports={
  excludePattern: [],
  includePattern: ['p-userframework-ui'],
  localServerHostName: 'http://localhost:3000',
  port: 6789,
  proxyedHostname: 'stnew02.beisen.com',
  customProxyRules: [
    {
      pathRewriteRule: "main-2.0.8.min main.chunk",
      byPass: 'http://10.99.28.143:3001'
    }
  ]
}
```
上面的配置文件demo代表的大概意思为：
代理运行的端口为6789，只对stnew02.beisen.com 域名下的资源进行代理，代理的时候会检查path是否有'p-userframework-ui字段
如果有的话，作为中间人代理该资源，如果没有的话，作为透明代理。



###配置api

| 属性  |说明  | 类型| 必须配置 | 默认值| 
| ------------ |-------|--------| -----|-----|
| proxyedHostname | 需要被代理的域名       |    string | no| stnew03.beisen.com
| port | 代理运行的端口      |    number | no | 6789
| localServerHostName | 本地工程运行的地址       |    string | no| http://localhost:3000
| excludePattern | 指定不需要进行代理的path 特征        |   string or regexp string | no | []
| includePattern | 指定需要进行代理的path 特征        |   string or regexp string | no | []
| customProxyRules | 用户自定义的代理规则  |   rule[] | no | 无
| config | 配置文件的js地址  |   js | no | 无
###api 介绍
customProxyRules

一个customProxyRules的例子
```angular2
interferce rule = {
  pathRewriteRule: string,
  byPath: string
}
```
```angular2
  customProxyRules: [
    {
      pathRewriteRule: "/vendors/ huhai",
      byPass: 'http://localhost:3000'
    }
  ]
```

假如您请求的是 http://stnew03.beisen.com/chat-robot/release/dist/vendors.js
经过上面的代理规则，请求的url会变成
http://localhost:3000/chat-robot/release/dist/huhai.js

当然你也可以更改整个路径，比如
```angular2
  customProxyRules: [
    {
      pathRewriteRule: "/^(.*)$/ common.js",
      byPass: 'http://www.baidu.com'
    }
  ]
```
这时候的请求url地址就会变成 http://www.baidu.com/common.js

~~~
pathRewriteRule 支持类nginx 的path rewrite规则

pathRewriteRule 书写规则

pathRewriteRule使用单空格区分需要匹配的字符串 与 字符串被替换后的字符，可以使用js 正则表达式的所有特征

bypass规则：请务必完整输入http协议/https协议 + hostname
~~~



### 运行方法

* 使用命令行
    b-proxy-cli 
    具体参数请使用 b-proxy-cli -h
* 使用配置文件
    b-proxy-cli --config configFile.js
    
运行起来后，请在系统的http代理中配置代理服务器运行的ip + 端口，

比如： 本地为 localhost:6789
远程为： 192.168.0.133：6789

如果你不想所有请求都走本代理，可以使用类似SwitchyOmega的工具转发特定域名的请求到本代理
   

### 无需配置参数就能匹配到本地文件的原理

承载页面发出的请求，被代理工具比如SwitchyOmega转发到本服务器，服务器依据请求的文件名fileName，与http://localhost:port/webpack-dev-server
列出的文件进行对比，找到能正确匹配fileName的文件url地址，然后转发对应文件数据流到原来的request


#### 匹配规则：



我们承载页面上发出的请求可能是这样的： 

* 'http://stnew03.xx.com/ux/beisen-chat-robot/release/dist/common-df04d232497a22c5db38.chunk.min.js';
* 'http://stnew03.xx.com/ux/beisen-chat-robot/release/dist/common.chunk.min.js';

开发过程中实际请求的地址可能是这样的
 * http://localhost:3000/common.chunk.min.js
 * http://localhost:3000/common-df04d232497a22c5db38.chunk.min.js
 
 甚至
  * http://localhost:3000/common.js
  
可以看到承载页面发出的请求 与 实际加载的资源地址很相似（相似的地方是： 文件名的主名不变，可能会以横杠或者点号连接hash值
），可以找到某种对应关系，基于上面的观察，我使用下面的方法来精确的匹配本地资源地址：

*  请求http://localhost:port/webpack-dev-server （这个页面提供了当前webpack-dev-server服务的所有资源文件名称和地址）；
* 拿到请求body，正则解析每个文件名对应的文件地址，存为hash表listhash
* express监听所有资源请求，拿到需要请求的fileName
* 将fileName正则拆分为只包含点号 及字母等相关的数组，比如common-df04d232497a22c5db38.chunk.min.js,会被拆分为[common,df04d232497a22c5db38,chunk,min,js]
* 查找listhash中的值，当listhash中的文件名拆分数组 与请求资源名的拆分数组有完全交集（A、B中有代码能完全被另外一方全部包含），代表匹配成功
* 完全交集的匹配规则伪代码： length(A 交集 B) === Math.max(length(A), length(B))；
* 查找到具有完全交集的情况后，停止查找，从listhash表直接拿到对应的资源文件地址

###changelist
1.3.6

feature: 为所有请求response 添加 access-control-allow-origin: * 解决跨域问题


1.3.5

feature: 用户自定义规则中支持replace 函数（用来支持复杂的用户替换规则）

1.3.4

bugfix: 防御用户规则转换失败造成程序crash

1.3.3

bugfix: ws 不能广播给所有客户端

1.3.2

pac文件地址提供

1.3.1

提供http代理服务pac.js 文件，方便设备配置代理服务器

1.3.0
  breakthrough change

支持图形化选择用户配置文件

1.1.2

feature: 升级rootca的加密级别到rsa2048，防止浏览器提示证书弱密码

1.1.1

feature: 增加系统级别的错误提示notifer

1.1.0

重大更新： 解决bugs
bugsfix：customProxyRules 会修改所有代理的url

1.0.24

支持emoji表情在commandline中显示，更友好的提示方式

1.0.19

支持用户自定义path重写规则，支持js 正则表达式所有语法

###作者
使用本软件若有需求或者帮助，请mail

huhai#gmail.com

  


 


