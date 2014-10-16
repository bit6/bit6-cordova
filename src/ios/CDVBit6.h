#import <Cordova/CDV.h>
#import <Bit6SDK/Bit6SDK.h>

@interface CDVBit6 : CDVPlugin

- (void)signup:(CDVInvokedUrlCommand*)command;
- (void)login:(CDVInvokedUrlCommand*)command;
- (void)logout:(CDVInvokedUrlCommand*)command;
- (void)isConnected:(CDVInvokedUrlCommand*)command;
- (void)sendMessage:(CDVInvokedUrlCommand*)command;

- (void)startListening:(CDVInvokedUrlCommand*)command;
- (void)stopListen:(CDVInvokedUrlCommand*)command;

@property (strong) NSString* callbackId;

@end
