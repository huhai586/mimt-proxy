const url = require('url');
const net = require('net');
const createFakeHttpsWebSite = require('./createFakeHttpsWebSite')


const proxyForHttps = (req, cltSocket, head,proxyedHostname, excludePattern, includePattern, customProxyRules) => {
  // connect to an origin server
  let srvUrl = url.parse(`http://${req.url}`);
  console.log('-----------------------------------------------------------')
  console.log('🔐️ https请求传入', ` 🚥 https CONNECT ${srvUrl.hostname}:${srvUrl.port}`);
  
  
  if (srvUrl.port === 3000 || srvUrl.hostname === 'cloud.italent.link') {
    console.log('异常');
  }
  
  
  if(srvUrl.hostname === proxyedHostname ) {
    //
    createFakeHttpsWebSite(srvUrl.hostname, (port) => {
      let srvSocket = net.connect(port, '127.0.0.1', () => {
      
        cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
          'Proxy-agent: MITM-proxy\r\n' +
          '\r\n');
        
        srvSocket.write(head);
        srvSocket.pipe(cltSocket);
        cltSocket.pipe(srvSocket);
      });
      srvSocket.on('error', (e) => {
        console.error('🔔',e);
      });
    }, excludePattern, includePattern, customProxyRules, proxyedHostname)
    
  } else {
    // 对非stnew03.beisen.com的内容直接转发
    let srvSocket = net.connect(srvUrl.port, srvUrl.hostname, () => {
      cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
        'Proxy-agent: MITM-proxy\r\n' +
        '\r\n');
      srvSocket.write(head);
      srvSocket.pipe(cltSocket);
      cltSocket.pipe(srvSocket);
    });
    srvSocket.on('error', (e) => {
      console.error('🔔',e);
    });
  }

}

module.exports = proxyForHttps;