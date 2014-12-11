# com.bit6.sdk

Bit6 is a real-time, cloud-based communications-as-a-service platform that allows mobile and web application developers to quickly and easily add voice/video calling, texting, and multimedia messaging capabilities as a feature to their apps. In addition Bit6 provides a suite of essential services including Identity Management, Social Map, and Virtual Wallet to help integrate the communication capabilities into a complete end-user experience.

Although the object is in the global scope, it is not available until after the `deviceready` event.

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log(window.b6);
    }


## Installation

You need a Bit6 API key for using this plugin, which you can obtain from [Bit6 Portal](http://bit6.github.io/). Once you have your API key, you can install the plugin in the following way:

    cordova plugin add url


## Initialize the SDK

The API key you have obtained from the website set it to the bit6 object in the following way:

		var b6 = new bit6.Client({
			apikey: 'MyApiKey'
		});


## Create user account

Create a new user account with a username identity.


		// Convert username to an identity URI
		var ident = 'usr:' + 'john';
		b6.signup({identity: ident, password: 'secret'}, function(err) {
		  if (err) {
		    console.log('signup error', err);
		  }
		  else {
		    console.log('signup successful');
		  }
		});

## Login

Login into an existing account using an Identity and a password.


		// Convert username to an identity URI
		var ident = 'usr:' + 'john';
		b6.login({identity: ident, password: 'secret'}, function(err) {
		  if (err) {
		    console.log('login error', err);
		  }
		  else {
		    console.log('login successful');
		  }
		});

## Logout
		
		b6.logout();


## Events

Multiple components in the Bit6 SDK act as event emitters.

The main Bit6 class __bit6.Client__ emits the following events:


	// Incoming call from another user
	b6.on('incomingCall', function(d) {
	  console.log('Incoming call', d);
	});

	// Messages have been changed, UI should be refreshed
	b6.on('messages', function() {
	  console.log('Messages updated');
	});

	// Got a real-time notification
	b6.on('notification', function(m) {
	  console.log('got notification', m);
	});

## Supported Platforms

- iOS
- Android

## Resources

For more information, please refer to the [Bit6 Getting Started](http://bit6.github.io/bit6-js-sdk/).


