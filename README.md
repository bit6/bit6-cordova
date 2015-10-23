Bit6 Cordova Plugin
-------------------
[![GitHub version](https://badge.fury.io/gh/bit6%2Fbit6-cordova.svg)](https://github.com/bit6/bit6-cordova)

Add voice/video calling, texting, and rich media messaging into any mobile or web application.

### Prerequisites
* Get the API Key at [Bit6 Dashboard](https://dashboard.bit6.com).

### Installation
```sh
$ cordova plugin add https://github.com/bit6/bit6-cordova
```

### Configuration
Initialize Bit6 Plugin with your API key.
```js
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
  var opts = {'apikey': 'yourApiKey'};
  var b6 = Bit6.init(opts);
  // Bit6 SDK has been initialized
}
```

### Quickstart
Create a user with a password authentication:
```js
b6.session.signup({identity: 'usr:john', password: 'secret'}, function(err) {
  if (err) {
    console.log('login error', err);
  } else {
    console.log('login successful');
  }
});
```
Send a message to another user:
```js
b6.compose('usr:tom').text('Hello!').send(function(err) {
  if (err) {
    console.log('error', err);
  } else {
    console.log('message sent');
  }
});
```
Make a video call:
```js
// Start an outgoing call and get a call controller (Dialog)
var d = b6.startCall('usr:tom', {audio: true, video: true});
```

### Documentation
Bit6 Cordova Plugin exposes the same API as [Bit6 JS SDK](https://github.com/bit6/bit6-js-sdk). Check Bit6 [JS documentation](http://bit6.github.io/bit6-js-sdk/). 

### Demo app
The complete source code is available in the [demo repo](https://github.com/bit6/bit6-cordova-demo). Check out the same demo app running with JS SDK at http://demo.bit6.com.

### Supported platforms
* iOS
* Android
* Browser

### Push notifications

Push Notification support is required for receiving incoming calls and messages. 

Bit6 depends on [PushNotification](https://github.com/Telerik-Verified-Plugins/PushNotification) plugin which will be installed automatically.

* __iOS APNs__
    1. Generate APNS certificate in iTunes Connect.
    2. Export it and convert to PEM files (key and certificate).
    3. Add the files to your app in [Bit6 Dashboard](https://dashboard.bit6.com).
* __Android GCM__
    1. Get the project id and server key from [Google Dev Console](http://developer.android.com/google/gcm/gs.html).
    2. Add project id and server key for your app in [Bit6 Dashboard](https://dashboard.bit6.com).

### Third-party libraries
Bit6 plugin leverages code from the excellent [WebRTC](http://www.webrtc.org/), [PhoneRTC](https://github.com/alongubkin/phonertc) and [phonegap-websocket](https://github.com/mkuklis/phonegap-websocket/) projects.
