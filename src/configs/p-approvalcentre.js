/**
 * @excludePattern regexp|string[] hostname下 请求资源url path中如果匹配这个字段，这个资源不会被代理到本地，直接访问原始资源
 * @includePattern regexp|string[] hostname下 请求资源url path必须include 相应字段才能被代理到本地
 * @localServerHostName string 本地资源服务器hostname
 * @port number 代理服务器运行的端口
 * @proxyedHostname string 只对只对指定hostname的资源进行本地请求
 * @customProxyRules rule{}[] 用户自定义代理规则，可以自定义hostname下的资源请求规则(暂未支持)
 *
 * **/
module.exports={
  description:'审批中心pc版本',
  excludePattern: [
  ],
  includePattern: ['p-approvalcentre'],
  localServerHostName: 'http://localhost:8888',
  port: 6789,
  proxyedHostname: 'stnew02.beisen.com',
  customProxyRules: [
    {
      pathRewriteRule: "/ux/p-approvalcentre/release/dist/app-e9bf5a4aaef3f7ea1054.bundle.min.js /app.js",
      byPass: 'http://127.0.0.1:8888'
    }
  ]
}