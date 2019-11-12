const {requestWebpackDevServer} = require("./requestWebpackDevServer");
const {
  requestRealTarget,
  isUrlNeedRequestLocal,
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
  
  console.log(`🚥['http']：${options.method}，请求地址：${req.url}`);
  
  // 请求webpack-dev-server 服务文件list;
  // 如果请求域名 + 域名的path 未在exclude名单内，那么就requestLocal
  
  options = createOptionsFromCustomRule(customProxyRules, options,req.url, proxyedHostname, excludePattern, includePattern);
  
  const requestUrlAfterRewrite = getUrlFromOptions(options);
  req.url = requestUrlAfterRewrite;
  
  const urlNeedRequestLocal = isUrlNeedRequestLocal(
    proxyedHostname,
    options.hostname,
    options.path,
    excludePattern,
    includePattern
  );
  if (urlNeedRequestLocal) {
    requestWebpackDevServer(createOptionsForLocalRequest.getOptions(), res, req);
    // 如果proxyedHostname !== options.hostname,是因为用户重新改写了请求的host,这时候就不能再请求local了
  } else {
    const isHttp = options.protocol === 'http:';
    requestRealTarget(options, req, res, isHttp)
  }
}

module.exports = proxyForHttp;