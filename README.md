Bit6 Cordova Plugin
-------------------
[![GitHub version](https://badge.fury.io/gh/bit6%2Fbit6-cordova.svg)](https://github.com/bit6/bit6-cordova)

Add voice/video calling, texting, and rich media messaging into any mobile or web application.

Get Bit6 sample app running in 10 minutes - follow our Quick Start guides for:
* [Cordova CLI](http://docs.bit6.com/start/cordova-cli/)
* [Intel XDK](http://docs.bit6.com/start/cordova-xdk/)
* [Telerik App Builder](http://docs.bit6.com/start/cordova-telerik/)

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

### Video/Voice calls on iOS

To enable call support on iOS add [iosrtc](https://github.com/eface2face/cordova-plugin-iosrtc) plugin

```
cordova plugin add cordova-plugin-iosrtc
```

Note: Check the plugin requirements on [this page](https://github.com/eface2face/cordova-plugin-iosrtc) and [building page](https://github.com/eface2face/cordova-plugin-iosrtc/blob/master/docs/Building.md)

Note: no need to add iosrtc if your app does not use audio/video calls.


### Video/Voice calls on Android < 5

To enable call support on Android < 5 add [Crosswalk Webview](https://github.com/crosswalk-project/cordova-plugin-crosswalk-webview) plugin

```
cordova plugin add cordova-plugin-crosswalk-webview
```

### Real time notifications on Android<4.4

For real time notifications (websocket) on Android<4.4 Crosswalk Webview is required.


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
Bit6 Cordova Plugin exposes the same API as [Bit6 JS SDK](https://github.com/bit6/bit6-js-sdk). Check Bit6 [JS documentation](http://docs.bit6.com/guides/js/).

### Demo app
The complete source code is available in the [demo repo](https://github.com/bit6/bit6-cordova-demo). Check out the same demo app running with JS SDK at http://demo.bit6.com.

### Supported platforms
* iOS
* Android
* Browser

### Push notifications

Push Notification support is required for receiving incoming calls and messages.

To enable this functionality please add one of these push plugins to your project:

* [phonegap-plugin-push](https://github.com/phonegap/phonegap-plugin-push) (recommended)
  ```sh
  # Set any value for SENDER_ID. Bit6 plugin will override it with the correct one.
  $ cordova plugin add phonegap-plugin-push --variable SENDER_ID="XXXXXXX"
  ```

* [Telerik Push Plugin](https://github.com/Telerik-Verified-Plugins/PushNotification)
  ```sh
  $ cordova plugin add https://github.com/Telerik-Verified-Plugins/PushNotification
  ```

* [Legacy PhoneGap Push Plugin](https://github.com/phonegap-build/PushPlugin) If you use cordova-ios 3.x


Then complete platform-specific configuration:

* __iOS APNs__ ([detailed guide](http://docs.bit6.com/guides/push-apns/))
    1. Generate APNS certificate in iTunes Connect.
    2. Export it into a p12 file.
    3. Add the file to your app in [Bit6 Dashboard](https://dashboard.bit6.com).

* __Android GCM__ ([detailed guide](http://docs.bit6.com/guides/push-gcm/))
    1. Get the project number and server key from [Google Dev Console](http://developer.android.com/google/gcm/gs.html).
    2. Add project number and server key for your app in [Bit6 Dashboard](https://dashboard.bit6.com).

### Building with Xcode 7
Please disable Bitcode support when building your Cordova app with Xcode.
Go to `Build Settings`, set `Enable Bitcode` to `No`.

### Third-party libraries
Bit6 plugin leverages code from the excellent [WebRTC](http://www.webrtc.org/), [PhoneRTC](https://github.com/alongubkin/phonertc) and [phonegap-websocket](https://github.com/mkuklis/phonegap-websocket/) projects.
