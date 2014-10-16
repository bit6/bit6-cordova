var cordova = require('cordova');
var exec = require('cordova/exec');
 var channel = require('cordova/channel');

function Bit6(){
      var me = this;
      channel.onCordovaReady.subscribe(function() {
          me.startListening();
          channel.onCordovaInfoReady.fire();
      });
}

Bit6.prototype.startListening = function(){
    exec(bit6._notification, bit6._error, "Bit6", "startListening", []);
}

Bit6.prototype.stopListening = function(){
    exec(null, null, "Bit6", "stopListen", []);
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
    cordova.fireDocumentEvent("messageReceived", info);
}

Bit6.prototype._error = function(e) {
    console.log("Error receiving message: " + e);
};

var bit6 = new Bit6();

module.exports = bit6;
