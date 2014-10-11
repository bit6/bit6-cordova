//
//  Bit6InCallController.h
//  Bit6
//
//  Created by Carlos Thurber Boaventura on 06/04/14.
//  Copyright (c) 2014 Bit6. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Bit6Address.h"
#import <UIKit/UIKit.h>

@protocol Bit6InCallControllerDelegate;

/*! This controller is used to interact with the inCall screen. */
@interface Bit6InCallController : NSObject

///---------------------------------------------------------------------------------------
/// @name ￼Class Methods
///---------------------------------------------------------------------------------------

/*! Gets the default Bit6InCallController object.
@return Default Bit6InCallController object.
*/
+ (Bit6InCallController *)sharedInstance;

///---------------------------------------------------------------------------------------
/// @name ￼Properties
///---------------------------------------------------------------------------------------

/*! the delegate to be notified when the inCall events occur. This delegate is also used to configure the visual aspect of the inCall screen. For details about the methods that can be implemented by the delegate, see <Bit6InCallControllerDelegate> Protocol Reference. */
@property (nonatomic, weak) IBOutlet id<Bit6InCallControllerDelegate> delegate;

/*! The number of seconds the call has been going */
@property (nonatomic, readonly) int seconds;
/*! The audio from the call is going through the speaker */
@property (nonatomic, readonly, getter = isSpeakerEnabled) BOOL speakerEnabled;
/*! The audio is muted for the current call */
@property (nonatomic, readonly, getter = isAudioMuted) BOOL audioMuted;
/*! The video is muted for the current call */
@property (nonatomic, readonly, getter = isVideoMuted) BOOL videoMuted;
/*! A call has been established */
@property (nonatomic, readonly, getter = isConnected) BOOL connected;
/*! The current call is a video call */
@property (nonatomic, readonly, getter = isVideoCall) BOOL videoCall;

/*! Display name from the destination user */
@property (nonatomic, readonly) NSString* displayName;

/*! reference to the current inCall view controller. */
@property (nonatomic, strong, readonly) UIViewController *currentCallViewController;

///---------------------------------------------------------------------------------------
/// @name ￼Actions
///---------------------------------------------------------------------------------------

/*! Switch between the frontal and rear camera, is available. */
- (void) switchCamera;

/*! End the current call. */
- (void) hangup;

/*! Mute the audio in the current call. */
- (void) muteAudio;

/*! Mute the video in the current call. */
- (void) muteVideo;

/*! Convenient method to change the audio route from the default one to the speaker, and vice versa. */
- (void) switchSpeaker;

/*! Redirects the audio through the speaker if possible. */
+ (void) enableSpeaker;

/*! Redirects the audio through the default route if possible. */
+ (void) disableSpeaker;

@end

/*! The Bit6InCallControllerDelegate protocol defines the methods a delegate of a <Bit6InCallController> object should implement. The methods of this protocol allow the customization of the controls overlay for the inCall interface.
 @note Both methods need to be implemented for the overlay to be shown: -[Bit6InCallControllerDelegate controlsOverlayViewForInCallController:] and -[Bit6InCallControllerDelegate refreshControlsOverlayView:inCallController:]
 */
@protocol Bit6InCallControllerDelegate <NSObject>

@optional

/*! Define a custom controls UIView to be used on top of the inCall interface.
 @note Important: Remember to incorporate transparency into your view, or position it to avoid obscuring the underlying content.
 @param icc the default <Bit6InCallController> that handles the calls
 @return a custom controls UIView
 */
- (UIView*) controlsOverlayViewForInCallController:(Bit6InCallController*)icc;

/*! This method will be called when changes to the custom controls UIView has to occur. This includes call status and mute/video status.
 @param view the same custom controls UIView defined in -[Bit6InCallControllerDelegate controlsOverlayViewForInCallController:]
 @param icc the default <Bit6InCallController> that handles the calls
 */
- (void) refreshControlsOverlayView:(UIView*)view inCallController:(Bit6InCallController*)icc;

/*! This method will be called each second to allow the update of any content timer related view inside the controlsOverlay
 @param view the same custom controls UIView defined in -[Bit6InCallControllerDelegate controlsOverlayViewForInCallController:]
 @param icc the default <Bit6InCallController> that handles the calls
 */
- (void) refreshTimerInOverlayView:(UIView*)view inCallController:(Bit6InCallController*)icc;

@end