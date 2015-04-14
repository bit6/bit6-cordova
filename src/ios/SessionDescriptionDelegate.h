#import <Foundation/Foundation.h>
#import "Session.h"


@interface SessionDescriptionDelegate : UIResponder <RTCSessionDescriptionDelegate>

@property (nonatomic) Session *session;

- (instancetype)init:(Session*)session;

@end