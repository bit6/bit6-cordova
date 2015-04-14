#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>
#import "Config.h"

#import "RTCICECandidate.h"
#import "RTCICEServer.h"
#import "RTCMediaConstraints.h"
#import "RTCMediaStream.h"
#import "RTCPair.h"
#import "RTCPeerConnection.h"
#import "RTCPeerConnectionDelegate.h"
#import "RTCPeerConnectionFactory.h"
#import "RTCSessionDescription.h"
#import "RTCVideoRenderer.h"
#import "RTCVideoCapturer.h"
#import "RTCVideoTrack.h"
#import "RTCAudioTrack.h"
#import "RTCSessionDescriptionDelegate.h"
#import "RTCDataChannel.h"
#import "RTCEAGLVideoView.h"
#import "RTCVideoSource.h"


@interface PhoneRTCPlugin : CDVPlugin

@property (nonatomic, strong) NSMutableDictionary *sessions;
@property (nonatomic, strong) RTCPeerConnectionFactory *peerConnectionFactory;
@property (nonatomic, strong) VideoConfig *videoConfig;
@property (nonatomic, strong) RTCVideoCapturer *videoCapturer;
@property (nonatomic, strong) RTCVideoSource *videoSource;
@property (nonatomic, strong) RTCEAGLVideoView *localVideoView;
@property (nonatomic, strong) NSMutableArray *remoteVideoViews;
@property (nonatomic, strong) RTCVideoTrack *localVideoTrack;
@property (nonatomic, strong) RTCAudioTrack *localAudioTrack;

- (instancetype)initWithWebView:(UIWebView*)webView;
- (void) createSessionObject:(CDVInvokedUrlCommand*)command;
- (void) call:(CDVInvokedUrlCommand*)command;
- (void) receiveMessage:(CDVInvokedUrlCommand*)command;
- (void) renegotiate:(CDVInvokedUrlCommand*)command;
- (void) disconnect:(CDVInvokedUrlCommand*)command;
- (void) sendMessage: (NSString*) callbackId :(NSData*) message;
- (void) setVideoView:(CDVInvokedUrlCommand*)command;
- (void) hideVideoView: (CDVInvokedUrlCommand*)command;
- (void) showVideoView: (CDVInvokedUrlCommand*)command;
- (RTCEAGLVideoView *)createVideoView: (VideoLayoutParams*) params;
-(void) initLocalAudioTrack;
-(void) initLocalVideoTrack;
-(void) onSessionDisconnect:(NSString*) sessionKey;
-(void) addRemoteVideoTrack: (RTCVideoTrack*)videoTrack;
-(void) removeRemoteVideoTrack: (RTCVideoTrack*)videoTrack;

@end


@interface VideoTrackViewPair : NSObject
@property (nonatomic, strong) RTCEAGLVideoView *videoView;
@property (nonatomic, strong) RTCVideoTrack *videoTrack;

- (instancetype)init:(RTCEAGLVideoView*) videoViewP :(RTCVideoTrack*) videoTrack;
@end