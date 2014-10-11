//
//  AppDelegate+notification.h
//  LeanPlum
//
//  Created by Telerik Inc.
//
//

#import "AppDelegate.h"
#import <Bit6SDK/Bit6SDK.h>

@interface AppDelegate (bit6)

- (id) getCommandInstance:(NSString*)className;

@end
