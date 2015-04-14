#import "PCObserver.h"


@implementation PCObserver

- (instancetype)init:(Session*)session
{
    self = [super init];
    if (self) {
        self.session = session;
    }
    return self;
}

- (void) peerConnection:(RTCPeerConnection*)peerConnection addedStream: (RTCMediaStream*)stream
{
    dispatch_async(dispatch_get_main_queue(), ^(void){
        if (stream.videoTracks.count > 0) {
            [self.session addVideoTrack: (RTCVideoTrack*) [stream.videoTracks objectAtIndex:0] ];
        }
    });

    NSString* msg = @"{\"type\": \"__answered\"}";
    [self.session sendMessage: [msg dataUsingEncoding: NSUTF8StringEncoding]];
}

- (void) peerConnection:(RTCPeerConnection*)peerConnection removedStream: (RTCMediaStream*)stream
{
    NSLog(@"PCO onRemoveStream.");
    /* TODO: probably needs proper handlling. Original code from swift which was commented out
     dispatch_async(dispatch_get_main_queue()) {
     if stream.videoTracks.count > 0 {
     self.session.removeVideoTrack(stream.videoTracks[0] as RTCVideoTrack)
     }
     }*/
}

- (void) peerConnection:(RTCPeerConnection*)peerConnection  iceGatheringChanged: (RTCICEGatheringState)newState
{
    if (newState == RTCICEGatheringComplete) {
        NSError *jsonError = nil;

        NSDictionary *json = @{
                               @"type": @"IceGatheringChange",
                               @"state": @"COMPLETE"
                               };

        NSData *data = [NSJSONSerialization dataWithJSONObject: json
                                                       options: 0
                                                       error: &jsonError];
        [self.session sendMessage: data];
    }
}


- (void) peerConnection:(RTCPeerConnection*)peerConnection  iceConnectionChanged: (RTCICEConnectionState)newState
{
    NSLog(@"PCO onIceGatheringChange. %u", newState);
}

- (void) peerConnection:(RTCPeerConnection*)peerConnection  gotICECandidate: (RTCICECandidate*)candidate
{
    //TODO. correct later
    NSLog(@"PCO onICECandidate.\n  Mid[\(candidate.sdpMid)] Index[\(candidate.sdpMLineIndex)] Sdp[\(candidate.sdp)]");
    NSError *jsonError = nil;

    NSDictionary *json= @{
                          @"type": @"candidate",
                          @"label": [NSNumber numberWithInteger: candidate.sdpMLineIndex],
                          @"id": candidate.sdpMid,
                          @"candidate": candidate.sdp
                          };

    NSData *data = [NSJSONSerialization dataWithJSONObject: json
                                                   options: 0//NSJSONWritingOptions.allZeros,
                                                     error: &jsonError];

    [self.session sendMessage: data];
}

- (void) peerConnection:(RTCPeerConnection*)peerConnection  signalingStateChanged: (RTCSignalingState)stateChanged
{
    NSLog(@"PCO onSignalingStateChange: %u", stateChanged);
}

- (void) peerConnection:(RTCPeerConnection*)peerConnection  didOpenDataChannel: (RTCDataChannel*)dataChannel
{
    NSLog(@"PCO didOpenDataChannel:");
}

- (void) peerConnectionOnRenegotiationNeeded:(RTCPeerConnection*)peerConnection
{
    NSLog(@"PCO onRenegotiationNeeded:");
    // TODO: Handle this
}

- (void) peerConnectionOnError:(RTCPeerConnection*)peerConnection
{
    NSLog(@"PCO onError:");
}


@end