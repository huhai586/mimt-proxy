/**
 * @excludePattern regexp|string[] hostname下 请求资源url path中如果匹配这个字段，这个资源不会被代理到本地，直接访问原始资源
 * @includePattern regexp|string[] hostname下 请求资源url path必须include 相应字段才能被代理到本地
 * @localServerHostName string 本地资源服务器hostname
 

 * @customProxyRules rule{}[] 用户自定义代理规则，可以自定义hostname下的资源请求规则
 *
 * **/
 module.exports = {
    "description": "流程设置-发起条件",
    "excludePattern": [
        "webpack-bootstrap",
        "vendors"
    ],
    "includePattern": [
        "p-start-condition"
    ],
    "localServerHostName": "http://localhost:3003",
    "proxyedHostname": "stnew03.beisen.com",
    "customProxyRules": [
        {
            "pathRewriteRule": "/ux/beisen-chat-robot/release/dist/main.305ac08bace5e7f283e3.bundle main.305ac08bace5e7f283e3.bundle",
            "byPass": "http://10.99.28.83:9001"
        }
    ],
    "enable": false
}