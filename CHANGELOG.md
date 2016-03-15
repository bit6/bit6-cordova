## 0.9.6.1 [2016-03-15]

### Release Notes

This release adds support for cordova-ios 4.x, reduces plugin size, and fixes an issue with iOS push notifications for Ad Hoc builds.

### Breaking Changes

- iOS simulator build is not supported - i386 slice is removed from iOS WebRTC library
- Push plugin dependency must be specified manually in the application - see 'Push notifications' section in README

### Features

- Added support for cordova-ios 4.x
- Significantly reduced plugin size
- Updated WebRTC lib: Android - m49

### Bugfixes

- Fixed iOS push issue for Ad Hoc builds


## 0.9.6 [2016-02-11]

### Release Notes

This release has improved API for video elements, updated native WebRTC libs and some important bug fixes.

### Features

- New video element layout mechanism
- External authentication support
- Automatic selection of iOS APNS environment
- Updated WebRTC libs : iOS - m49, Andoid - m48

### Bugfixes

- Fixed the call setup issue between devices (caused by incorrect buffering of ICE candidates)
- Fixed the whitelist plugin warning about security policy tag
