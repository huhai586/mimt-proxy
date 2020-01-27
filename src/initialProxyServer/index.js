
const http = require('http');
const {createOptionsForLocalRequest, createOptionFromCli,getProxyRule,configsManage} = require('./utils');
const ProxyForHttp = require("./proxy-for-http");
const ProxyForHttps = require("./proxy-for-https");

let httpMitmProxy;


const getMatchConfigForCurRequest = () => {

}
const init = (configObject, startUpCallBack, port) => {
  const initOptions = createOptionFromCli(configObject);
  // let {
  //   localServerHostName,
  //   port,
  //   proxyedHostname,
  //   excludePattern,
  //   customProxyRules,
  //   includePattern
  // } = initOptions;
  
  //存储当前配置
  configsManage.update({
    configName:configObject.configName,
    configData: initOptions
  });
  
  //初始化localRequest options
  // createOptionsForLocalRequest.init(localServerHostName,configObject.configName);
  
  if (!!httpMitmProxy === true) {
    startUpCallBack({startSuc: true, msg:`新配置文件${configObject.configName}已经生效`});
    return
  };
  startProxyServer(startUpCallBack, port);
}
const shutDownServer = (callback) => {
  httpMitmProxy.close && httpMitmProxy.close(callback);
}

const getProxyServer = () => {
  return httpMitmProxy
}

const startProxyServer = (startUpCallBack, port = 6789) => {
  httpMitmProxy = new http.Server();

// 代理http请求
  httpMitmProxy.on('request', (req, res) => {
    ProxyForHttp(req,res,getProxyRule(req.url));
    res.on('error', () => {
      console.log('😩响应异常中断')
    })
  });

// 代理https请求
// https的请求通过http隧道方式转发
  httpMitmProxy.on('connect', (req, cltSocket, head) => {
    ProxyForHttps(req,cltSocket, head);
    cltSocket.on('error', () => {
      console.log('😩响应异常中断');
    })
  });
  
  httpMitmProxy.listen(port, function () {
    const msg = `💚HTTP/HTTPS中间人代理启动成功，端口：${port}`
    console.log(msg);
    startUpCallBack && startUpCallBack({startSuc: true, msg})
  });
  
  httpMitmProxy.on('error', (e) => {
    if (e.code == 'EADDRINUSE') {
      console.error('😰HTTP/HTTPS中间人代理启动失败！！');
      console.error(`端口：${port}，已被占用。`);
      startUpCallBack && startUpCallBack({startSuc: false, msg: `当前配置启动失败，端口：${port}，已被占用。`})
    } else {
      console.error(e);
    }
  });
}
module.exports = {
  initProxyServer: init,
  shutDownServer,
  getProxyServer
}