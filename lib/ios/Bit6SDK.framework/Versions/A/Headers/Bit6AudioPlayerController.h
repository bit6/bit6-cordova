//
//  Bit6AudioPlayerController.h
//  Bit6
//
//  Created by Carlos Thurber Boaventura on 04/08/14.
//  Copyright (c) 2014 Bit6. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Bit6Message.h"

/*! Audio player allows to play an audio file attached to a message. */
@interface Bit6AudioPlayerController : NSObject

/*! Gets the default Bit6AudioPlayerController object.
 @return Default Bit6AudioPlayerController object.
 */
+ (Bit6AudioPlayerController *) sharedInstance;

/*! Starts playing the audio file attached to a message.
 @param msg A <Bit6Message> object with the audio attachment to play.
 @param errorHandler block to call if an error occurs
 */
- (void) startPlayingAudioFileInMessage:(Bit6Message*)msg errorHandler:(void (^)(NSError *error))errorHandler;

/*! Used to know if there's an audio file is playing
 @return YES is an audio file is playing
 */
- (BOOL) isPlayingAudioFile;

/*! Stop the audio file playing at the time
 */
- (void) stopPlayingAudioFile;

@end
