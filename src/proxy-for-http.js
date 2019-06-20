const {requestWebpackDevServer} = require("./requestWebpackDevServer");
const {requestRealTarget, isUrlNeedRequestLocal} = require('./utils');
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
  
  console.log(`http请求方式：${options.method}，请求地址：${options.protocol}//${options.hostname}:${options.port}${options.path}`);
  
  // 请求webpack-dev-server 服务文件list;
  // 如果请求域名 + 域名的path 未在exclude名单内，那么就requestLocal
  let urlObj = url.parse(req.url);
  let urlAfterRewrite;
  // const hasCustomRule = customProxyRules.some((ruleObj) => {
  //   const {pathRewriteRule} = ruleObj;
  //   const rulesDetail = pathRewriteRule.split(" ");
  //   const matchRule = rulesDetail[0];
  //   const replacedRule = rulesDetail[1];
  //
  //   const ruleInReg = new RegExp(matchRule);
  //   if (ruleInReg.test(urlObj.path)) {
  //     urlAfterRewrite = urlObj.path.replace(ruleInReg, () =>{ return })
  //   }
  //
  // });
  const urlNeedRequestLocal = isUrlNeedRequestLocal(options.path, excludePattern, includePattern);
  if (options.hostname === proxyedHostname && urlNeedRequestLocal) {
    // console.log(`本地请求地址：${optionsForLocalRequest.method}，请求地址：${optionsForLocalRequest.protocol}//${optionsForLocalRequest.hostname}:${optionsForLocalRequest.port}${optionsForLocalRequest.path}`);
    requestWebpackDevServer(createOptionsForLocalRequest.getOptions(), res, req);
  } else {
    requestRealTarget(options, req, res)
  }
}

module.exports = proxyForHttp;