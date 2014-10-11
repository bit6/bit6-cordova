//
//  Bit6MenuControllerDelegate.h
//  Bit6
//
//  Created by Carlos Thurber Boaventura on 08/12/14.
//  Copyright (c) 2014 Bit6. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Bit6OutgoingMessage.h"

@protocol Bit6MenuControllerDelegate <NSObject>

@optional
- (void) forwardMessage:(Bit6Message*)msg;
- (void) resendFailedMessage:(Bit6OutgoingMessage*)msg;

@end
