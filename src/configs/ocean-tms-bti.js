/**
 * @excludePattern regexp|string[] hostname下 请求资源url path中如果匹配这个字段，这个资源不会被代理到本地，直接访问原始资源
 * @includePattern regexp|string[] hostname下 请求资源url path必须include 相应字段才能被代理到本地
 * @localServerHostName string 本地资源服务器hostname


 * @customProxyRules rule{}[] 用户自定义代理规则，可以自定义hostname下的资源请求规则
 *
 * **/
 module.exports = {
    "description": "[Ocean]-tms-bti-backbone页面",
    "excludePattern": [],
    "includePattern": [
        "tms-bti/release/app"
    ],
    "localServerHostName": "http://localhost:8000",
    "proxyedHostname": "stnew03.beisen.com",
    "customProxyRules": [
        {
            "pathRewriteRule": "/ux/tms-bti/release/app(.*)",
            "pathReplaceFunc": function (originParam) {
              const replaceExtraStr= originParam.replace('/ux/tms-bti/release','').replace(/-\d+\.min/,'')
              return replaceExtraStr
            },
            "byPass": "http://localhost:8000"
        }
    ],
    "enable": true
}