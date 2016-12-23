var exec = require('cordova/exec');

function isApnsProduction(onSuccess) {
  if (cordova.platformId === 'ios') { //This is needed only for ios.
    exec(onSuccess, null, 'UtilsPlugin', 'isApnsProduction', []);
  }
  else {
    onSuccess(false);
  }
}

exports.isApnsProduction = isApnsProduction;
