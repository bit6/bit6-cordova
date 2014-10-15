# com.bit6.sdk

Bit6 is a real-time, cloud-based communications-as-a-service platform that allows mobile and web application developers to quickly and easily add voice/video calling, texting, and multimedia messaging capabilities as a feature to their apps. In addition Bit6 provides a suite of essential services including Identity Management, Social Map, and Virtual Wallet to help integrate the communication capabilities into a complete end-user experience.

Although the object is in the global scope, it is not available until after the `deviceready` event.

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log(window.bit6);
    }


## Installation

You need a Bit6 API key for using this plugin, which you can obtain from [Bit6 Portal](http://bit6.github.io/). Once you have your API key, you can install the plugin in the following way:

    cordova plugin add url —variable API_KEY="YOUR_API_KEY"
