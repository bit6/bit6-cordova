#import <Foundation/Foundation.h>
#import "PhoneRTCPlugin.h"


@class PCObserver;

@interface Session : NSObject

@property (nonatomic) PhoneRTCPlugin *plugin;
@property (nonatomic) SessionConfig *config;
@property (nonatomic) RTCMediaConstraints *constraints;
@property (nonatomic) RTCPeerConnection *peerConnection;
@property (nonatomic) PCObserver *pcObserver;
@property (nonatomic) NSMutableArray* queuedRemoteCandidates;
@property (nonatomic) RTCPeerConnectionFactory *peerConnectionFactory;
@property (nonatomic) NSString *callbackId;
@property (nonatomic) RTCMediaStream *stream;
@property (nonatomic) RTCVideoTrack *videoTrack;
@property (nonatomic) NSString *sessionKey;

-(instancetype) init:(PhoneRTCPlugin*) plugin
                    :(RTCPeerConnectionFactory*) peerConnectionFactory
                    :(SessionConfig*) config
                    :(NSString*) callbackId
                    :(NSString*) sessionKey;

-(void) addVideoTrack: (RTCVideoTrack*)videoTrack;
-(void) call;
-(void) sendMessage:(NSData*)message;
-(void) receiveMessage:(NSString*) message;
-(void) createOrUpdateStream;
-(void) disconnect:(BOOL)sendByeMessage;
-(NSString*) preferISAC:(NSString*)sdpDescription;

@end