#import <Foundation/Foundation.h>

@interface TurnConfig : NSObject

@property (nonatomic, strong) NSString *host;
@property (nonatomic, strong) NSString *username;
@property (nonatomic, strong) NSString *password;

@end


@interface SessionConfig : NSObject

@property (nonatomic) BOOL isInitiator;
@property (nonatomic, strong) TurnConfig *turn;
@property (nonatomic) struct StreamsConfig streams;

- (instancetype)init:(id)data;

@end

struct StreamsConfig {
    BOOL audio;
    BOOL video;
};


@interface VideoLayoutParams : NSObject

@property (nonatomic) int x;
@property (nonatomic) int y;
@property (nonatomic) int width;
@property (nonatomic) int height;

@end


@interface VideoConfig : NSObject

@property (nonatomic) VideoLayoutParams *container;
@property (nonatomic) VideoLayoutParams *local;

- (instancetype)init:(id)data;
@end