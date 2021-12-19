const {requestWebpackDevServer} = require("./requestWebpackDevServer");
const {
  requestRealTarget,
  isUrlNeedRequestLocal,
  createOptionsFromCustomRule,
  getUrlFromOptions, updateRequestOptionsByCustomRules
} = require('./utils');
const url = require('url');
const {createOptionsForLocalRequest} = require("./utils");


const proxyForHttp = (req,res, config, httpOptions) => {
  // 解析客户端请求


  if (!!config === false) {
    console.log(`当前url${req.url}无相应配置文件，系统将直接请求原地址`);
    return requestRealTarget(httpOptions, req, res, true);
  }
  const {excludePattern,includePattern, localServerHostName} = config;

  // 为了方便起见，直接去掉客户端请求所支持的压缩方式
  delete httpOptions.headers['accept-encoding'];

  console.log(`🚥['http']：${httpOptions.method}，请求地址：${req.url}`);

  // 请求webpack-dev-server 服务文件list;
  // 如果请求域名 + 域名的path 未在exclude名单内，那么就requestLocal

  httpOptions = updateRequestOptionsByCustomRules(httpOptions,config);

  const requestUrlAfterRewrite = getUrlFromOptions(httpOptions);
  req.url = requestUrlAfterRewrite;

  const urlNeedRequestLocal = isUrlNeedRequestLocal(config, httpOptions);

  if (urlNeedRequestLocal) {
    requestWebpackDevServer(createOptionsForLocalRequest(localServerHostName), res, req);
    // 如果proxyedHostname !== options.hostname,是因为用户重新改写了请求的host,这时候就不能再请求local了
  } else {
    const isHttp = options.protocol === 'http:';
    requestRealTarget(options, req, res, isHttp)
  }
}

module.exports = proxyForHttp;