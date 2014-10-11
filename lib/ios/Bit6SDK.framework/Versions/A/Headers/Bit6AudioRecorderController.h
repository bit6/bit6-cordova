//
//  AVRecorderController.h
//  Bit6
//
//  Created by Carlos Thurber Boaventura on 12/13/13.
//  Copyright (c) 2014 Bit6. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Bit6OutgoingMessage.h"

@protocol Bit6AudioRecorderControllerDelegate;

/*! Bit6AudioRecorderController is used to record an audio file and attach it to a message. */
@interface Bit6AudioRecorderController : NSObject

/*! Gets default Bit6AudioRecorderController object.
 @return Default Bit6AudioRecorderController object.
 */
+ (Bit6AudioRecorderController *) sharedInstance;

/*! Tries to start to record an audio file showing an <UIAlertView> object as the UI control to cancel or finish the recording.
 @param msg a <Bit6OutgoingMessage> object where the audio file will be included.
 @param maxDuration maximum allowed duration (in seconds) of the audio file to be recorded.
 @param delegate the delegate to be notified when the recording has been completed or canceled. For details about the methods that can be implemented by the delegate, see <Bit6AudioRecorderControllerDelegate> Protocol Reference.
 @param errorHandler block to call if an error occurs
 */
- (void) startRecordingAudioForMessage:(Bit6OutgoingMessage*)msg maxDuration:(NSTimeInterval)maxDuration delegate:(id <Bit6AudioRecorderControllerDelegate>)delegate errorHandler:(void (^)(NSError *error))errorHandler;

@end

/*! The Bit6AudioRecorderControllerDelegate protocol defines the methods a delegate of a <Bit6AudioRecorderController> object should implement. The methods of this protocol notify the delegate when the recording was either completed or canceled by the user.
 */
@protocol Bit6AudioRecorderControllerDelegate <NSObject>

/*! Called when a user has completed the recording prccess.
 @param b6rc The controller object recording the audio file.
 @param message Message object set in <[Bit6AudioRecorderController startRecordingAudioForMessage:maxDuration:delegate:errorHandler:]> with the audio file set.
 */
- (void) doneRecorderController:(Bit6AudioRecorderController*)b6rc message:(Bit6OutgoingMessage*)message;

@optional
/*! Called when a user has cancelled the recording process.
 @param b6rc The controller object recording the audio file.
 */
- (void) cancelRecorderController:(Bit6AudioRecorderController*)b6rc;

@end