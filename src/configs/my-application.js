/**
 * @excludePattern regexp|string[] hostname下 请求资源url path中如果匹配这个字段，这个资源不会被代理到本地，直接访问原始资源
 * @includePattern regexp|string[] hostname下 请求资源url path必须include 相应字段才能被代理到本地
 * @localServerHostName string 本地资源服务器hostname

 * @proxyedHostname string 只对只对指定hostname的资源进行本地请求
 * @customProxyRules rule{}[] 用户自定义代理规则，可以自定义hostname下的资源请求规则
 *
 * **/
module.exports={
  description:'我的申请组件',
  excludePattern: [],
  includePattern: ['ux-approval-centre'],
  localServerHostName: 'http://localhost:8080',
  
  proxyedHostname: 'stnew.beisen.com',
  customProxyRules: [
    {
      pathRewriteRule:"main-3.0.14.min main-3.0.15.min"
    }
  ]
}