var cordova = require('cordova');
var exec = require('cordova/exec');

function Bit6(){

  this.channels = {
    messageReceived: cordova.addWindowEventHandler("messageReceived")
  };

  for (var key in this.channels){
    this.channels[key].onMessageReceived = Bit6.onHasSubscribersChange;
  }
}

function handlers() {
  return bit6.channels.messageReceived.numHandlers;
}

Bit6.onHasSubscribersChange = function(){
  if (this.numHandlers === 1 && handlers() === 1) {
        exec(bit6._notification, bit6._error, "Bit6", "listen", []);
  } else if (handlers() === 0) {
        exec(null, null, "Bit6", "stopListen", []);
  }
}

Bit6.prototype.register = function(username, password, success, error){
  exec(success, error, "Bit6", "signup", [username, password]);
}

Bit6.prototype.login = function(username, password, success, error){
  exec(success, error, "Bit6", "login", [username, password]);
}

Bit6.prototype.logout = function(success, error){
  exec(success, error, "Bit6", "logout");
}

Bit6.prototype.isConnected = function(success, error){
  exec(success, error, "Bit6", "isConnected", null);
}

Bit6.prototype.sendTextMessage = function(message, to, success, error){
  exec(success, error, "Bit6", "sendMessage", [message, to, 2]);
}

Bit6.prototype.sendPushMessage = function(message, to, success, error){
  exec(success, error, "Bit6", "sendMessage", [message, to, 3]);
}

Bit6.prototype._notification = function(info){
   cordova.fireWindowEvent("messageReceived", info);
}

Bit6.prototype._error = function(e) {
    console.log("Error receiving message: " + e);
};

var bit6 = new Bit6();

module.exports = bit6;
