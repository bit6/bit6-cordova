#import "SessionDescriptionDelegate.h"

@implementation SessionDescriptionDelegate

- (instancetype)init:(Session*)session
{
    self = [super init];
    if (self) {
        self.session = session;
    }
    return self;
}

-(void) peerConnection:(RTCPeerConnection*)peerConnection didCreateSessionDescription:(RTCSessionDescription*)originalSdp error:(NSError*) error
{
    if (error != nil) {
        NSLog(@"SDP OnFailure: didCreateSessionDescription %@ ", error);
        return;
    }


    RTCSessionDescription *sdp = [[RTCSessionDescription alloc] initWithType: originalSdp.type
                                                                         sdp: [self.session preferISAC: originalSdp.description]];


    [self.session.peerConnection setLocalDescriptionWithDelegate: self sessionDescription:sdp];
    dispatch_async(dispatch_get_main_queue(), ^(void) {
        NSError* jsonError = nil;

        NSDictionary *json = @{
                               @"type": sdp.type,
                               @"sdp": sdp.description
                               };

        NSData *data = [NSJSONSerialization dataWithJSONObject: json
                                                       options: 0
                                                         error: &jsonError];

        [self.session sendMessage: data];
    });
}

-(void) peerConnection:(RTCPeerConnection*)peerConnection didSetSessionDescriptionWithError:(NSError*)error
{
    if (error != nil) {
        NSLog(@"SDP OnFailure: %@ ", error);
        return;
    }
    dispatch_async(dispatch_get_main_queue(), ^(void) {
        if (self.session.config.isInitiator) {
            if (self.session.peerConnection.remoteDescription != nil) {
                NSLog(@"SDP onSuccess - drain candidates");
                [self drainRemoteCandidates];
            }
        } else {
            if (self.session.peerConnection.localDescription != nil) {
                [self drainRemoteCandidates];
            } else {
                [self.session.peerConnection createAnswerWithDelegate:self
                                                          constraints: self.session.constraints];
            }
        }
    });
}

-(void)drainRemoteCandidates
{
    for (RTCICECandidate *candidate in self.session.queuedRemoteCandidates) {
        [self.session.peerConnection addICECandidate: candidate];
    }
    self.session.queuedRemoteCandidates = nil;
}
@end