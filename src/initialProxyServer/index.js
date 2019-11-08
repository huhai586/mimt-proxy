const http = require('http');
const {createOptionsForLocalRequest, createOptionFromCli} = require('./utils');
const ProxyForHttp = require("./proxy-for-http");
const ProxyForHttps = require("./proxy-for-https");

let httpMitmProxy;

const init = (program, startUpCallBack) => {
  let {localServerHostName, port, proxyedHostname, excludePattern, customProxyRules, includePattern} = createOptionFromCli(program);
  
  //初始化localRequest options
  createOptionsForLocalRequest.init(localServerHostName);
  httpMitmProxy = new http.Server();

// 代理http请求
  httpMitmProxy.on('request', (req, res) => {
    ProxyForHttp(req,res,proxyedHostname, excludePattern, includePattern,customProxyRules);
    res.on('error', () => {
      console.log('😩响应异常中断')
    })
  });

// 代理https请求
// https的请求通过http隧道方式转发
  httpMitmProxy.on('connect', (req, cltSocket, head) => {
    ProxyForHttps(req,cltSocket, head,proxyedHostname, excludePattern, includePattern, customProxyRules);
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
const shutDownServer = (callback) => {
  httpMitmProxy.close && httpMitmProxy.close(callback);
}

const getProxyServer = () => {
  return httpMitmProxy
}
module.exports = {
  initProxyServer: init,
  shutDownServer,
  getProxyServer
}