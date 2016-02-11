cordova.require("com.bit6.sdk.Bit6SDK");
cordova.require("com.bit6.sdk.MyRtc");
cordova.require("com.bit6.sdk.MyCapture");
cordova.require("com.bit6.sdk.MySurface");
var phonertc = cordova.require("com.bit6.sdk.PhoneRTC");

exports.init = function(opts) {

    var b6 = new bit6.Client(opts);
    // Init DeviceId and Push support
    initPushService(b6);
    // Init native WebRTC component?
    // Check for PeerConnection instead?
    var hasWebRTC = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || window.getUserMedia;
    // WebView does not support WebRTC, init a native substitute
    if (!hasWebRTC) {
        // Internal helper for showing/hiding OpenGL surface for native video views
        var surface = new bit6.MySurface(phonertc);

        b6._createRtc = function() {
            return new bit6.MyRtc(phonertc);
        };
        b6._createRtcCapture = function() {
            return new bit6.MyCapture(phonertc);
        };
        b6._emitVideoEvent = function(v, d, op) {
            // Default - emit 'video' event to manage DOM
            // attachment
            b6.emit('video', v, d, op);
            // Pass it into Surface - it will get the container element
            //console.log('ToSurface: ' + v + ' parent ' + v.parentNode);
            surface.onVideo(v, d, op);
        };
    }

    return b6;
};

function initPushService(b6) {
    // Short name for the platform for Bit6
    var plat = device.platform.toLowerCase();

    // TODO: Are we sure that simulator is always web-based?
    // and not for example device emulator running on a PC?
    if (navigator.simulator) {
        plat = 'web';
    }
    else if (plat == 'ios') {
        plat = 'ios';
    }
    else if (plat == 'android') {
        plat = 'and';
    }
    else {
        plat = 'web';
    }

    // DeviceId support
    if (device && device.platform && device.uuid) {
        b6._createDeviceId = function() {
            return plat + '-' + device.uuid;
        };
    }

    // Push support

    // Helper functions for success / error responses
    var errh = function(r) {
        console.log('Push Error: ' + r);
    };
    var okh = function(r) {
        console.log('Push Success: ' + r);
    };

    // Helper function for submitting the push key to the server
    var sendPushkeyToServer = function(pushkey) {
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
        });
    };

    var sendIOSPushkeyToServer = function(key) {
        //For iOS adding prefix p_/d_ to the push token for Bit6 server to use correct APNS
        phonertc.isApnsProduction(function(isApnsProduction) {
            var pushkey = key;
            if (plat == 'ios') {
                pushkey = isApnsProduction ? 'p_' + key : 'd_' + key;
            }

            sendPushkeyToServer(pushkey);
        });
    };


    // Got notification from GCM
    // Note that the function has to be in global scope!
    window.onPushGCM = function(e) {
        console.log('Got GCM: ' + e.event);
        switch(e.event) {
            // Registered with GCM
            case 'registered':
                if (e.regid && e.regid.length > 0) {
                    // Notify the server about this GCM regId
                    sendPushkeyToServer(e.regid);
                }
                break;
            // Got a push message
            case 'message':
                // App is currently running
                if (e.foreground) {
                    console.log('GCM msg1: ' + JSON.stringify(e.payload));
                }
                // App launched because the user touched a notification in the notification tray
                else if (e.coldstart) {
                    console.log('GCM msg2: ' + JSON.stringify(e.payload));
                }
                // The app was in the background
                else {
                    console.log('GCM msg3: ' + JSON.stringify(e.payload));
                }
                // For now we just feed it to Bit6 JS
                b6._handlePushRtMessage(e.payload);
                break;
            // Got GCM error
            case 'error':
                console.log('GCM err: ' + e.msg)
                break;
            // Unknown GCM event
            default:
                console.log('GCM unknown event: ' + e.event)
                break;
        }
    }

    // Got notification from APN
    // Note that the function has to be in global scope!
    window.onPushAPN = function(e) {
        console.log('Got APN push');
        if (e.alert) {
            console.log('APN alert: ' + e.alert);
        }
        if (e.sound) {
            // TODO: Play sound
        }
        if (e.badge) {
            window.plugins.pushNotification.setApplicationIconBadgeNumber(okh, e.badge);
        }
        // Feed it into JS SDK
        b6._handlePushRtMessage(e);
    }


    // Listen to the completion of the auth procedure.
    // At that time we will have more info about the push config
    b6.session.on('auth', function() {
        // When Bit6 auth is done, we should have Android GCM senderId
        if (plat == 'and') {
            // TODO: check that all the values exist, showing the alert for now
            if (b6.session.config.gcm === undefined) {
                alert("There will be errors as long as you don't enable GCM push notifications for this app.");
            }

            var gcmSenderId = b6.session.config.gcm.senderId;
            console.log('GCM senderId=' + gcmSenderId);
            var opts = {
                senderID: gcmSenderId,
                ecb: 'onPushGCM'
            };
            console.log('Register GCM', opts);
            window.plugins.pushNotification.register(okh, errh, opts);
        }
        // On iOS we just specify the type of pushes we want to receive
        else if (plat == 'ios') {
            var opts = {
                badge: 'true',
                sound: 'true',
                alert: 'true',
                ecb: 'onPushAPN'
            };
            console.log('Register APN', opts);
            window.plugins.pushNotification.register(sendIOSPushkeyToServer, errh, opts);
        }
    });
}
