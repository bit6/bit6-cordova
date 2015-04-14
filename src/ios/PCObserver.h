#import <Foundation/Foundation.h>
#import "RTCPeerConnectionDelegate.h"
#import "Session.h"

@interface PCObserver : NSObject <RTCPeerConnectionDelegate>

@property (nonatomic) Session *session;

- (instancetype)init:(Session*)session;

@end