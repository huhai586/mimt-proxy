const path = require('path');
const forge = require('node-forge');
const pki = forge.pki;
const tls = require('tls');
const url = require('url');
const http = require('http');
const https = require('https');
const fs = require('fs');
const {requestWebpackDevServer} = require("./requestWebpackDevServer");
const {isUrlNeedRequestLocal, requestRealTarget, createOptionsForLocalRequest} = require('./utils');
const caCertPath = path.join(__dirname, './rootCA/rootCA.crt');
const caKeyPath = path.join(__dirname, './rootCA/rootCA.key.pem');

try {
  fs.accessSync(caCertPath, fs.F_OK);
  fs.accessSync(caKeyPath, fs.F_OK);
} catch (e) {
  console.log(`在路径下：${caCertPath} 未找到CA根证书`, e);
  process.exit(1);
}

fs.readFileSync(caCertPath);
fs.readFileSync(caKeyPath);

const caCertPem = fs.readFileSync(caCertPath);
const caKeyPem = fs.readFileSync(caKeyPath);
const caCert = forge.pki.certificateFromPem(caCertPem);
const caKey = forge.pki.privateKeyFromPem(caKeyPem);

/**
 * 根据CA证书生成一个伪造的https服务
 * @param  {[type]} ca         [description]
 * @param  {[type]} domain     [description]
 * @param  {[type]} successFun [description]
 * @return {[type]}            [description]
 */
function createFakeHttpsWebSite(domain, successFun, excludePattern) {
  
  const fakeCertObj = global[domain] ? global[domain] : createFakeCertificateByDomain(caKey, caCert, domain)
  var fakeServer = new https.createServer({
    key: fakeCertObj.key,
    cert: fakeCertObj.cert
  });
  
  fakeServer.listen(0, () => {
    var address = fakeServer.address();
    successFun(address.port);
  });
  //本地的https server 监听到传入请求
  fakeServer.on('request', (req, res) => {
    //stnew03 中的资源并不是所有都需要转发
    
    const urlNeedRequestLocal = isUrlNeedRequestLocal(req.url, excludePattern);
    if (urlNeedRequestLocal) {
      requestWebpackDevServer(createOptionsForLocalRequest.getOptions(), res, req);
    } else {
      // 直接请求
      let httpsOptions =  {
        protocol: 'https:',
        hostname: req.headers.host.split(':')[0],
        method: req.method,
        port: req.headers.host.split(':')[1] || 443,
        path: req.url,
        headers: req.headers,
      };
      requestRealTarget(httpsOptions, req, res, false)
    }
  });
  fakeServer.on('error', (e) => {
    console.error(e);
  });
  
}

/**
 * 根据所给域名生成对应证书
 * @param  {[type]} caKey  [description]
 * @param  {[type]} caCert [description]
 * @param  {[type]} domain [description]
 * @return {[type]}        [description]
 */
function createFakeCertificateByDomain(caKey, caCert, domain) {
  const m1 = new Date().getTime()
  var keys = pki.rsa.generateKeyPair(2046);
  var cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  
  cert.serialNumber = (new Date()).getTime()+'';
  cert.validity.notBefore = new Date();
  cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 1);
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);
  var attrs = [{
    name: 'commonName',
    value: domain
  }, {
    name: 'countryName',
    value: 'CN'
  }, {
    shortName: 'ST',
    value: 'SiChuan'
  }, {
    name: 'localityName',
    value: 'Chengdu'
  }, {
    name: 'organizationName',
    value: 'mitm-proxy'
  }, {
    shortName: 'OU',
    value: 'https://www.huhai.site'
  }];
  
  cert.setIssuer(caCert.subject.attributes);
  cert.setSubject(attrs);
  
  cert.setExtensions([{
    name: 'basicConstraints',
    critical: true,
    cA: false
  },
    {
      name: 'keyUsage',
      critical: true,
      digitalSignature: true,
      contentCommitment: true,
      keyEncipherment: true,
      dataEncipherment: true,
      keyAgreement: true,
      keyCertSign: true,
      cRLSign: true,
      encipherOnly: true,
      decipherOnly: true
    },
    {
      name: 'subjectAltName',
      altNames: [{
        type: 2,
        value: domain
      }]
    },
    {
      name: 'subjectKeyIdentifier'
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true
    },
    {
      name:'authorityKeyIdentifier'
    }]);
  cert.sign(caKey, forge.md.sha256.create());
  
  var certPem = pki.certificateToPem(cert);
  var keyPem = pki.privateKeyToPem(keys.privateKey);
  const m2 = new Date().getTime()
  console.log('生成证书花费时间',Math.floor((m2-m1)/1000))
  global[domain] = {
    key: keyPem,
    cert: certPem
  }
  return {
    key: keyPem,
    cert: certPem
  };
}

module.exports = createFakeHttpsWebSite
