#import "CDVBit6.h"

@implementation CDVBit6

@synthesize callbackId;

- (void)signup:(CDVInvokedUrlCommand *)command
{
    NSString *username = [command.arguments objectAtIndex:0];
    NSString *password = [command.arguments objectAtIndex:1];


    Bit6Address *identity = [[Bit6Address alloc] initWithKind:Bit6AddressKind_USERNAME value:username];

    [Bit6Session signUpWithUserIdentity:identity password:password completionHandler:^(NSDictionary *response, NSError *error) {
         [self processCommandWithResult:command response:response error:error];
    }];
}

- (void)login:(CDVInvokedUrlCommand *)command
{
    NSString *username = [command.arguments objectAtIndex:0];
    NSString *password = [command.arguments objectAtIndex:1];

    Bit6Address *identity = [[Bit6Address alloc] initWithKind:Bit6AddressKind_USERNAME value:username];

    [Bit6Session loginWithUserIdentity:identity password:password completionHandler:^(NSDictionary *response, NSError *error) {
        [self processCommandWithResult:command response:response error:error];
    }];
}

- (void)logout:(CDVInvokedUrlCommand*)command
{
    [Bit6Session logoutWithCompletionHandler:^(NSDictionary *response, NSError *error) {
        [self processCommandWithResult:command response:response error:error];
    }];
}

- (void)isConnected:(CDVInvokedUrlCommand*)command
{
    if ([Bit6Session isConnected])
        [self processCommandWithResult:command response:[NSDictionary dictionaryWithObjectsAndKeys:@(YES), @"connected", nil] error:nil];
    else
        [self processCommandWithResult:command response:[NSDictionary dictionaryWithObjectsAndKeys:@(NO), @"connected", nil] error:nil];
}

- (void)sendMessage:(CDVInvokedUrlCommand*)command
{
    NSString *message = [command.arguments objectAtIndex:0];
    NSString *to = [command.arguments objectAtIndex:1];

    Bit6OutgoingMessage *bit6Message = [Bit6OutgoingMessage new];

    bit6Message.content = message;

    Bit6MessageChannel channel = (Bit6MessageChannel)[command.arguments objectAtIndex:2];

    bit6Message.destination = [[Bit6Address alloc] initWithKind:Bit6AddressKind_USERNAME value:to];
    bit6Message.channel = channel;

    [bit6Message sendWithCompletionHandler:^(NSDictionary *response, NSError *error) {
        [self processCommandWithResult:command response:response error:error];
    }];
}

- (void)listen:(CDVInvokedUrlCommand*)command
{
    self.callbackId = command.callbackId;

    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(conversationsUpdatedNotification:) name:Bit6ConversationsUpdatedNotification object:nil];
}

- (void) conversationsUpdatedNotification:(NSNotification*)notification
{
   //get updated conversations
   NSArray *messages = [Bit6 messagesWithOffset:0 length:1 asc:NO];

    if ([messages count]){
        Bit6Message *message = [messages objectAtIndex:0];

        NSDictionary *dictionary = [NSDictionary dictionaryWithObjectsAndKeys:message.content, @"content"    , @(message.incoming), @"incoming", nil];

        NSDictionary *data = [NSDictionary dictionaryWithObject:dictionary forKey:@"data"];

        if (self.callbackId) {
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:data];
            [result setKeepCallbackAsBool:YES];
            [self.commandDelegate sendPluginResult:result callbackId:self.callbackId];
        }
    }
}

- (void)stopListen:(CDVInvokedUrlCommand*)command
{
    self.callbackId = nil;
    [[NSNotificationCenter defaultCenter] removeObserver:self name:Bit6ConversationsUpdatedNotification object:nil];
}


- (void)processCommandWithResult:(CDVInvokedUrlCommand*)command response:(NSDictionary*)response error:(NSError*)error
{
    CDVPluginResult* pluginResult = nil;

    if (!error)
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:response];
    else
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:error.userInfo];

    dispatch_async(dispatch_get_main_queue(), ^{
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    });
}


@end
