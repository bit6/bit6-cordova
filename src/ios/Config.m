#import "Config.h"

@implementation SessionConfig

- (instancetype)init:(id)data
{
    self = [super init];
    if (self) {
        self.isInitiator = [[data objectForKey:@"isInitiator"] boolValue];

        NSDictionary *turnObject = [data objectForKey:@"turn"];
        if (turnObject) {
            self.turn = [TurnConfig new];
            self.turn.host = [turnObject objectForKey:@"host"];
            self.turn.username = [turnObject objectForKey:@"username"];
            self.turn.password = [turnObject objectForKey:@"password"];
        }

        NSDictionary *streamsObject = [data objectForKey:@"streams"];
        if (streamsObject) {
            struct StreamsConfig streams;
            streams.audio = [[streamsObject objectForKey:@"audio"] boolValue];
            streams.video = [[streamsObject objectForKey:@"video"] boolValue];
            self.streams = streams;
        }
    }
    return self;
}

@end

@implementation TurnConfig
@end



@implementation VideoLayoutParams

- (instancetype)init:(id)data
{
    self = [super init];
    if (self) {
        NSArray *position = [data objectForKey:@"position"];
        self.x = [[position objectAtIndex:0] integerValue];
        self.y = [[position objectAtIndex:1] integerValue];

        NSArray *size = [data objectForKey:@"size"];
        self.width = [[size objectAtIndex:0] integerValue];
        self.height = [[size objectAtIndex:1] integerValue];
    }
    return self;
}

- (instancetype)init:(int)xp :(int)yp :(int)widthp :(int)heightp
{
    self = [super init];
    if (self) {
        self.x = xp;
        self.y = yp;
        self.width = widthp;
        self.height = heightp;
    }
    return self;
}

@end


@implementation VideoConfig

- (instancetype)init:(id)data
{
    self = [super init];
    if (self) {
        NSDictionary *containerParams = [data objectForKey:@"containerParams"];
        NSDictionary *localParams = [data objectForKey:@"local"];

        if (containerParams) {
            self.container = [[VideoLayoutParams alloc] init:containerParams];
        }

        if (localParams) {
            self.local = [[VideoLayoutParams alloc] init:localParams];
        }
    }
    return self;
}

@end