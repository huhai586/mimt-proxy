const {requestWebpackDevServer, requestRealTarget} = require("./requestWebpackDevServer");
const url = require('url');
const {optionsForLocalRequest} = require("./const");


const proxyForHttp = (req,res,host) => {
  // 解析客户端请求
  var urlObject = url.parse(req.url);
  let options =  {
    protocol: 'http:',
    hostname: req.headers.host.split(':')[0],
    method: req.method,
    port: req.headers.host.split(':')[1] || 80,
    path: urlObject.path,
    headers: req.headers,
  };
  
  // 为了方便起见，直接去掉客户端请求所支持的压缩方式
  delete options.headers['accept-encoding'];
  
  console.log(`请求方式：${options.method}，请求地址：${options.protocol}//${options.hostname}:${options.port}${options.path}`);
  
  // 请求webpack-dev-server 服务文件list;
  
  if (options.hostname === 'stnew03.beisen.com') {
    // console.log(`本地请求地址：${optionsForLocalRequest.method}，请求地址：${optionsForLocalRequest.protocol}//${optionsForLocalRequest.hostname}:${optionsForLocalRequest.port}${optionsForLocalRequest.path}`);
    requestWebpackDevServer(optionsForLocalRequest, res, req, host);
  } else {
    requestRealTarget(options, req, res)
  }
}

module.exports = proxyForHttp;