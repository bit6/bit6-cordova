#import "UtilsPlugin.h"

@implementation UtilsPlugin

- (void) pluginInitialize
{
    [super pluginInitialize];
}


-(void) isApnsProduction: (CDVInvokedUrlCommand*)command
{
    static BOOL isDevelopment = NO;
#if TARGET_IPHONE_SIMULATOR
    isDevelopment = YES;
#else
    NSData *data = [NSData dataWithContentsOfFile:[NSBundle.mainBundle pathForResource:@"embedded" ofType:@"mobileprovision"]];
    if (data) {
        const char *bytes = [data bytes];
        NSMutableString *profile = [[NSMutableString alloc] initWithCapacity:data.length];
        for (NSUInteger i = 0; i < data.length; i++) {
            [profile appendFormat:@"%c", bytes[i]];
        }
        NSString *cleared = [[profile componentsSeparatedByCharactersInSet:NSCharacterSet.whitespaceAndNewlineCharacterSet] componentsJoinedByString:@""];
        isDevelopment = [cleared rangeOfString:@"<key>get-task-allow</key><true/>"].length > 0;
    }
#endif
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool: !isDevelopment];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


@end
