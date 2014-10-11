//
//  Bit6Session.h
//  Bit6
//
//  Created by Carlos Thurber Boaventura on 03/20/14.
//  Copyright (c) 2014 Bit6. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Bit6Address.h"
#import "Bit6Constants.h"

/*! A Bit6Session object contains the session information about the current connection to the Bit6 platform. It allows the user to sign up for a new account with the app, login into an existing account or logout. */
@interface Bit6Session : NSObject

/*! Checks if the user is authenticated with the Bit6 platform and the session has been established.
 @return YES if there is a session available.
 */
+ (BOOL)isConnected;

/*! Creates an account with an <Bit6Address> object and initiates the session.
 @param userIdentity A <Bit6Address> object that represents the local user.
 @param pass User's password
 @param completion Block to call after the operation has been completed. The "error" value can be use to know if the account was created.
 */
+ (void)signUpWithUserIdentity:(Bit6Address*)userIdentity password:(NSString*)pass completionHandler:(Bit6CompletionHandler)completion;

/*! Signs into an existing account
 @param userIdentity <Bit6Address> object that represents the local user
 @param pass User's password
 @param completion Block to call after the operation has been completed. The "error" value can be use to know if the session was initiated.
 */
+ (void)loginWithUserIdentity:(Bit6Address*)userIdentity password:(NSString*)pass completionHandler:(Bit6CompletionHandler)completion;

/*! Ends the current session.
 @param completion Block to be executed after the operation has been completed.
 */
+ (void)logoutWithCompletionHandler:(Bit6CompletionHandler)completion;

/*! Current user identity as a <Bit6Address> object.
 @return A <Bit6Address> object to identity the current user.
 */
+ (Bit6Address*)userIdentity;

@end
