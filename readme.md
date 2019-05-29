#### b-proxy-cli 承载页面请求转发工具

    无需对承载页每个资源请求进行配置, 就能对里面的资源请求进行转发

    
###api
host: 本地资源服务器地址，默认为 -host http://localhost:3000

port: 当前服务器运行的端口，默认为 -port 4000

### 运行方法

node index.js -host http://localhost:3000 -p 4000
    
###实现功能

* 无需对每个资源请求进行正则配置, 就能对里面所有资源请求进行转发

### 使用本软件的前提

* 本地服务器目前仅支持webpack-dev-server启动，不支持其他服务器；
* 浏览器端需要安装代理设置工具，比如： SwitchyOmega
* 承载页面与本地开发页面，请求的资源文件名大体相似，不能承载页面请求 common.chunk.js 本地却请求main.chunk.js
* 

###how it works

承载页面发出的请求，被代理工具比如SwitchyOmega转发到本服务器，服务器依据请求的文件名fileName，与http://localhost:port/webpack-dev-server
列出的文件进行对比，找到能正确匹配fileName的文件url地址，然后让服务器 302重定向到指定的url地址


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

### todo
1： 支持自定义规则

2： 

  


 


