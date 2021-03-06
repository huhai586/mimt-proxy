/**
 * @excludePattern regexp|string[] hostname下 请求资源url path中如果匹配这个字段，这个资源不会被代理到本地，直接访问原始资源
 * @includePattern regexp|string[] hostname下 请求资源url path必须include 相应字段才能被代理到本地
 * @localServerHostName string 本地资源服务器hostname
 
 * @proxyedHostname string 只对只对指定hostname的资源进行本地请求
 * @customProxyRules rule{}[] 用户自定义代理规则，可以自定义hostname下的资源请求规则
 *
 * **/


// 使用此配置文件，运行的命令为bui-common 中的start 命令
 module.exports = {
    "description": "BUI-Common",
    "excludePattern": ['images', 'css'],
    "includePattern": [
        "tms-bti",'release/dist'
    ],
    "localServerHostName": "http://localhost:8003",
    "proxyedHostname": "tencentcdn.bstatics.com",
    // "proxyedHostname": "stnew03.beisen.com",
    "customProxyRules": [],
    "enable": true
}