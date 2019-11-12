/**
 * @excludePattern regexp|string[] hostname下 请求资源url path中如果匹配这个字段，这个资源不会被代理到本地，直接访问原始资源
 * @includePattern regexp|string[] hostname下 请求资源url path必须include 相应字段才能被代理到本地
 * @localServerHostName string 本地资源服务器hostname
 * @port number 代理服务器运行的端口
 * @proxyedHostname string 只对只对指定hostname的资源进行本地请求
 * @customProxyRules rule{}[] 用户自定义代理规则，可以自定义hostname下的资源请求规则
 *
 * **/

// DEMO
// https://stnew03.beisen.com/ux/setting-cloud-italent/release/app/scripts/views/application/index-page-view-1910231746.min.js
// http://localhost:8000/scripts/views/application/index-page-view.js
module.exports={
  description:'实施态-italent',
  excludePattern: [],
  includePattern: ['setting-cloud-italent'],
  localServerHostName: 'http://localhost:3003',
  port: 6789,
  proxyedHostname: 'stnew03.beisen.com',
  customProxyRules: [
    {
      pathRewriteRule: '/(\/ux\/setting-cloud-italent\/release\/app)/(.*)/g',
      pathReplaceFunc: (matchStr, $1,$2,originStr) => {
        return  '/'+ $2.replace(/-[\d]+\.min/,'');
      },
      byPass: 'http://localhost:8000'
    }
  ]
}