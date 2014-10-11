//
//  CurrentLocationController.h
//  Bit6
//
//  Created by Carlos Thurber Boaventura on 11/27/13.
//  Copyright (c) 2014 Bit6. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Bit6OutgoingMessage.h"

@protocol Bit6CurrentLocationControllerDelegate;

/*! This controller is used to obtain user's current location. */
@interface Bit6CurrentLocationController : NSObject

/*! Returns the default Bit6CurrentLocationController object.
 @return the default Bit6CurrentLocationController object.
 */
+ (Bit6CurrentLocationController *) sharedInstance;

/*! Starts listening to the user's location.
 @param msg a <Bit6OutgoingMessage> object where the user's location will be included.
 @param delegate delegate to be notified when the location has been obtained. For information about the methods you can implement for your delegate object, see <Bit6CurrentLocationControllerDelegate> Protocol Reference.
 */
- (void) startListeningToLocationForMessage:(Bit6OutgoingMessage*)msg delegate:(id<Bit6CurrentLocationControllerDelegate>)delegate;

/*! Stops listening to the user's location */
- (void) stopListeningToLocation;

@end

/*! The Bit6CurrentLocationControllerDelegate protocol defines the methods a delegate of a <Bit6CurrentLocationController> object should implement. The methods of this protocol notify your delegate when the user's location has been obtained.
 */
@protocol Bit6CurrentLocationControllerDelegate <NSObject>

/*! Called when the user's location couldn't be obtained.
 @param b6clc The controller object obtaining the user's location.
 @param error the error object describing the problem to obtain the location
 @param message same message object set in <[Bit6CurrentLocationController startListeningToLocationForMessage:delegate:]> with the user's location set.
 */
- (void) currentLocationController:(Bit6CurrentLocationController*)b6clc didFailWithError:(NSError*)error message:(Bit6OutgoingMessage*)message;

/*! Called when the user's location has been obtained.
 @param b6clc The controller object obtaining the user's location.
 @param message same message object set in <[Bit6CurrentLocationController startListeningToLocationForMessage:delegate:]> with the user's location set.
 */
- (void) currentLocationController:(Bit6CurrentLocationController*)b6clc didGetLocationForMessage:(Bit6OutgoingMessage*)message;

@end