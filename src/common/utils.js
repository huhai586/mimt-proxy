const interfaces = require('os').networkInterfaces(); // 在开发环境中获取局域网中的本机iP地址
const getIP = () => {
  let IPAdress = '';
  for(var devName in interfaces){
    var iface = interfaces[devName];
    for(var i=0;i<iface.length;i++){
      var alias = iface[i];
      if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal &&(alias.netmask !== '255.255.0.0') && (alias.netmask !== '255.255.255.0')){
        IPAdress = alias.address;
      }
    }
  }
  return IPAdress;
}

module.exports = {
  getIP
}