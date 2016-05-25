
// Helper functions for success / error responses
var errh = function(r) {
    console.log('Push Error: ' + r);
};
var okh = function(r) {
    console.log('Push Success: ' + r);
};


var pluginPushWrapper = {
    _push: null,
    register: function(opts, registrationCallback, notificationCallback) {
        //var params = opts;
        var params = {
            android: {
                senderID: opts.senderId,
                clearNotifications: 'true'
            },
            ios: {
                alert: 'true',
                badge: 'true',
                sound: 'true',
                clearBadge: 'true'
            }
        };

        _push = PushNotification.init(params);
        _push.on('registration', function(data) {
            registrationCallback(data.registrationId);
        });

        _push.on('notification', function(data) {
            if (!(data && data.additionalData)) {
                alert("Missing Push Data!");
                return;
            }

            var bit6Data = data.additionalData.data ? data.additionalData.data : data.additionalData;

            if (data.count) {
                _push.setApplicationIconBadgeNumber(okh, errh, data.count);
            }

            notificationCallback(bit6Data);
        });
    }
};

var legacyPushPluginWrapper = {
    _push: null,
    register: function(opts, registrationCallback, notificationCallback) {

        var params = '';
        if (opts && opts.senderId) { //Android
            params = {
                senderID: opts.senderId,
                ecb: 'onPushGCM'
            };
            window.plugins.pushNotification.register(okh, errh, params);
        } else {
            params = {
                badge: 'true',
                sound: 'true',
                alert: 'true',
                ecb: 'onPushAPN'
            };
            //Hack to keep the old format of push payload, otherwise telerik/legacy plugin will fail
            bit6.Client.version = '0.9.6'

            window.plugins.pushNotification.register(registrationCallback, errh, params);
        }

        // Note that the function has to be in global scope!
        window.onPushGCM = function(e) {
            console.log('Got GCM: ' + e.event);
            switch (e.event) {
                // Registered with GCM
                case 'registered':
                    if (e.regid && e.regid.length > 0) {
                        // Notify the server about this GCM regId
                        registrationCallback(e.regid);
                    }
                    break;
                    // Got a push message
                case 'message':
                    notificationCallback(e.payload);
                    break;
                case 'error':
                    alert('GCM err: ' + e.msg)
                    break;
                default:
                    console.log('GCM unknown event: ' + e.event)
                    break;
            }
        }

        // Got notification from APN
        // Note that the function has to be in global scope!
        window.onPushAPN = function(e) {
            //FIXME: Getting error when gets push while app is running
            if (e.badge) {
                window.plugins.pushNotification.setApplicationIconBadgeNumber(okh, e.badge);
            }
            notificationCallback(e);
        }
    }
};


exports.pluginPushWrapper = pluginPushWrapper;
exports.legacyPushPluginWrapper = legacyPushPluginWrapper;

