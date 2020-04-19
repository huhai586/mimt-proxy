const {showMessage} = require("../initialProxyServer/utils");
const accessDeveiceManage = {
  inServerIps: [],
  add: function(ip){
    if (this.inServerIps.includes(ip) === false) {
      this.inServerIps.push(ip);
      this.showTip(ip)
    }
  },
  showTip: function(ip){
    showMessage.info({title: `新IP access`, message: `${ip}`})
  }
  
}

module.exports = {
  accessDeveiceManage
}