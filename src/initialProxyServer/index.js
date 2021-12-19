
const http = require('http');
const {createOptionFromCli,getProxyRule,configsManage, readFileDataByName} = require('./utils');
const {extractIPFromAdrInfo}= require("../common/utils");
const {accessDeveiceManage} = require("../common/helper");
const ProxyForHttp = require("./proxy-for-http");
const ProxyForHttps = require("./proxy-for-https");
const url = require("url");

let httpMitmProxy;

const selectConfig = (configObject, selectConfigCallBack, port) => {
  let initOptions;
   try {
     initOptions = readFileDataByName(configObject.configName);
   } catch (e) {
     selectConfigCallBack({startSuc: false, msg:`新配置文件${configObject.configName}无法被正常选择.${e}`});
     return
   }
  //存储当前配置
  configsManage.update({
    configName:configObject.configName,
    configData: initOptions
  });
  selectConfigCallBack({startSuc: true, msg:`新配置文件${configObject.configName}已经生效`});
}

const shutDownServer = (callback) => {
  httpMitmProxy.close && httpMitmProxy.close(callback);
}

const getProxyServer = () => {
  return httpMitmProxy
}

const startProxyServer = (startUpCallBack, port = 6789) => {
  if(httpMitmProxy) {
    console.log("已经启动过http-server无需再启动");
    return;
  }
  httpMitmProxy = new http.Server();

// 代理http请求
  httpMitmProxy.on('request', (req, res) => {
    console.log("接收到http代理请求",req.url);
    const ip =extractIPFromAdrInfo(req.socket.remoteAddress);
    (ip !== '::1') && accessDeveiceManage.add(ip)

    let urlObject = url.parse(req.url);
    let httpOptions =  {
      protocol: 'http:',
      hostname: req.headers.host.split(':')[0],
      method: req.method,
      port: req.headers.host.split(':')[1] || 80,
      path: urlObject.path,
      headers: req.headers,
    };

    ProxyForHttp(req,res,getProxyRule(httpOptions), httpOptions);
    res.on('error', () => {
      console.log('\x1B[31m%s\x1B[0m','😩响应异常中断')
    })
  });

  // 代理https请求
  // https的请求通过http隧道方式转发
  httpMitmProxy.on('connect', (req, cltSocket, head) => {
    console.log("接收到connect请求",req.url);
    const ip =extractIPFromAdrInfo(cltSocket.remoteAddress);
    (ip !== '::1') && accessDeveiceManage.add(ip)
    ProxyForHttps(req,cltSocket, head);

    cltSocket.on('error', () => {
      console.log('\x1B[31m%s\x1B[0m', '😩响应异常中断');
    })
  });

  httpMitmProxy.listen(port, function () {
    const msg = `💚HTTP/HTTPS中间人代理启动成功，端口：${port}`
    console.log(msg);
    startUpCallBack && startUpCallBack({startSuc: true, msg});
    //配置文件变化监听& handle 。为了处理外部文件变更
    configsManage.configChangeMonitor();

  });

  httpMitmProxy.on('error', (e) => {
    if (e.code == 'EADDRINUSE') {
      console.error('\x1B[31m%s\x1B[0m', '😰HTTP/HTTPS中间人代理启动失败！！');
      console.error('\x1B[31m%s\x1B[0m', `端口：${port}，已被占用。`);
      startUpCallBack && startUpCallBack({startSuc: false, msg: `当前配置启动失败，端口：${port}，已被占用。`})
    } else {
      console.error('\x1B[31m%s\x1B[0m', e);
    }
  });
}
module.exports = {
  initProxyServer: startProxyServer,
  selectConfig: selectConfig,
  shutDownServer,
  getProxyServer
}