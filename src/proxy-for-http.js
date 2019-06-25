const {requestWebpackDevServer} = require("./requestWebpackDevServer");
const {
  requestRealTarget,
  isUrlPathNeedRequestLocal,
  createOptionsFromCustomRule,
  getUrlFromOptions
} = require('./utils');
const url = require('url');
const {createOptionsForLocalRequest} = require("./utils");


const proxyForHttp = (req,res, proxyedHostname,excludePattern,includePattern, customProxyRules) => {
  
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
  
  console.log(`http请求方式：${options.method}，请求地址：${req.url}`);
  
  // 请求webpack-dev-server 服务文件list;
  // 如果请求域名 + 域名的path 未在exclude名单内，那么就requestLocal
  options = createOptionsFromCustomRule(customProxyRules, options,req.url);
  const requestUrlAfterRewrite = getUrlFromOptions(options);
  req.url = requestUrlAfterRewrite;
  
  const urlNeedRequestLocal = isUrlPathNeedRequestLocal(options.path, excludePattern, includePattern);
  if (options.hostname === proxyedHostname && urlNeedRequestLocal) {
    requestWebpackDevServer(createOptionsForLocalRequest.getOptions(), res, req);
  } else {
    const isHttp = options.protocol === 'http:';
    options.headers.host = options.hostname;
    requestRealTarget(options, req, res, isHttp)
  }
}

module.exports = proxyForHttp;