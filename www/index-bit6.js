cordova.require("com.bit6.sdk.Bit6SDK");

var pushWrappers = cordova.require("com.bit6.sdk.PushWrappers");
var utils = cordova.require("com.bit6.sdk.Utils");

exports.init = function(opts) {

    var b6 = new bit6.Client(opts);
    // Init DeviceId and Push support
    initPushService(b6, opts.pushSupport);

    // Just for iOS devices, making WebRTC methods available using iosrtc plugin 
     if (window.device.platform === 'iOS' && cordova.plugins.iosrtc) {
        cordova.plugins.iosrtc.registerGlobals();
     }

    return b6;
};

function initPushService(b6, customPushSupport) {
    // Short name for the platform for Bit6
    var plat = device.platform.toLowerCase();

    // Is this a web-based emulator?
    var isEmu = false;
    if (navigator.simulator) {
        isEmu = true;
    }
    if (!isEmu && device.isVirtual) {
        isEmu = true;
    }

    // TODO: Are we sure that simulator is always web-based?
    // and not for example device emulator running on a PC?
    if (isEmu) {
        plat = 'web';
    } else if (plat == 'ios') {
        plat = 'ios';
    } else if (plat == 'android') {
        plat = 'and';
    } else {
        plat = 'web';
    }

    // DeviceId support
    if (device && device.platform && device.uuid) {
        b6._createDeviceId = function() {
            return plat + '-' + device.uuid;
        };
    }

    // Push support
    pushSupport = null;
    if (customPushSupport) {
        pushSupport = customPushSupport;
    }
    // TODO: Move this logic to pushWrappers since it contains both wrapper implementations?
    // Add a factory method in the wrappers file?
    else if (typeof PushNotification !== 'undefined' && PushNotification.init) { //PluginPush
        pushSupport = pushWrappers.pluginPushWrapper;
    } else if (window.plugins && window.plugins.pushNotification && window.plugins.pushNotification.register) { //legacy PushPlugin
        pushSupport = pushWrappers.legacyPushPluginWrapper;
    }

    // Helper function for submitting the push key to the server
    var sendPushkeyToServer = function(pushkey, cb) {
        var data = {
            id: b6.session.device,
            pushkey: pushkey,
            platform: plat,
            sdkv: bit6.Client.version
        };
        console.log('Send pushkey: ' + data.pushkey);
        console.log('Send device id: ' + data.id);
        b6.api('/me/devices', 'POST', data, function(err, res) {
            console.log('Dev update err=' + err);
            console.log('Dev update res=' + res);

            if (err) {
                alert('Dev update err=' + err);
            }

            if (cb) {
                cb();
            }
        });
    };

    var sendApnsPushkeyToServer = function(key) {
        //For iOS adding prefix p_/d_ to the push token for Bit6 server to use correct APNS
        // TODO: Do we want to call isApnsProduction() just once during init?
        utils.isApnsProduction(function(isProd) {
            var prefix = isProd ? 'p_' : 'd_';
           sendPushkeyToServer(prefix + key);
        });
    };

    // Listen to the completion of the auth procedure.
    // At that time we will have more info about the push config
    b6.session.on('auth', function() {
        if (!pushSupport) {
          alert("Missing push plugin. \nPlease install one of the push plugins known to Bit6, or provide your push implementation");
          return;
        }

        var pushOpts = {
            senderId: ''
        };

        if (plat === 'and') {
            if (b6.session.config.gcm === undefined) {
                alert("There will be errors as long as you don't enable GCM push notifications for this app.");
                return;
            }
            pushOpts.senderId = b6.session.config.gcm.senderId;
        }

        pushSupport.register(pushOpts, onPushRegistration, onPushNotification);
    });


    function onPushNotification(data) {
        if (!data) {
            alert("Bit6: Push data is missing!")
            return;
        }
        b6._handlePushRtMessage(data);
    }

    function onPushRegistration(pushToken) {
        if (plat == 'ios') {
            sendApnsPushkeyToServer(pushToken);
        } else {
            sendPushkeyToServer(pushToken);
        }
    }

    //Override _onBeforeLogout to remove the push key on the server
    var sdkBeforeLogout = b6._onBeforeLogout;
    b6._onBeforeLogout = function () {
        sendPushkeyToServer('', function() {
         sdkBeforeLogout.call(b6, function() {});
     });
    };
}
