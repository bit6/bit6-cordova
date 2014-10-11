//
//  Bit6AppDelegate.h
//  Bit6
//
//  Created by Carlos Thurber Boaventura on 06/06/14.
//  Copyright (c) 2014 Bit6. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

/*! Convenient class to be extended in the ApplicationDelegate
 
 For example
 
    @interface AppDelegate : Bit6ApplicationManager <UIApplicationDelegate>
 
    @end
 
    @implementation AppDelegate
 
    - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
    {
      [Bit6 init:@"your_api_key" pushNotificationMode:Bit6PushNotificationMode_DEVELOPMENT launchingWithOptions:launchOptions];
      return YES;
    }
 
    @end
 
 */
@interface Bit6ApplicationManager : UIResponder

/*! Bit6 implementation of -[UIApplicationDelegate application:didReceiveRemoteNotification:]
 @param application The singleton app object.
 @param userInfo A dictionary that contains information related to the remote notification, potentially including a badge number for the app icon, an alert sound, an alert message to display to the user, a notification identifier, and custom data. The provider originates it as a JSON-defined dictionary that iOS converts to an NSDictionary object; the dictionary may contain only property-list objects plus NSNull.
 @note Important: Remember to call super if you are going to implement your own -[UIApplicationDelegate application:didReceiveRemoteNotification:] method
 */
- (void) application:(UIApplication*)application didReceiveRemoteNotification:(NSDictionary*)userInfo;

/*! Bit6 implementation of -[UIApplicationDelegate application:didRegisterForRemoteNotificationsWithDeviceToken:]
 @param application The app object that initiated the remote-notification registration process.
 @param deviceToken A token that identifies the device to APS. The token is an opaque data type because that is the form that the provider needs to submit to the APS servers when it sends a notification to a device. The APS servers require a binary format for performance reasons.
 The size of a device token is 32 bytes.
 Note that the device token is different from the uniqueIdentifier property of UIDevice because, for security and privacy reasons, it must change when the device is wiped.
 @note Important: Remember to call super if you are going to implement your own -[UIApplicationDelegate application:didRegisterForRemoteNotificationsWithDeviceToken:] method
 */
- (void) application:(UIApplication*)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData*)deviceToken;

/*! Bit6 implementation of -[UIApplicationDelegate application:didFailToRegisterForRemoteNotificationsWithError:]
 @param application The app object that initiated the remote-notification registration process.
 @param error An NSError object that encapsulates information why registration did not succeed. The app can choose to display this information to the user.
 @note Important: Remember to call super if you are going to implement your own -[UIApplicationDelegate application:didFailToRegisterForRemoteNotificationsWithError:] method
 */
- (void) application:(UIApplication*)application didFailToRegisterForRemoteNotificationsWithError:(NSError*)error;

@end
