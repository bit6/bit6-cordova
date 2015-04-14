#import "Session.h"
#import "PCObserver.h"
#import "SessionDescriptionDelegate.h"

#import <Foundation/NSJSONSerialization.h>


@implementation Session

-(instancetype) init:(PhoneRTCPlugin*) plugin
                    :(RTCPeerConnectionFactory*) peerConnectionFactory
                    :(SessionConfig*) config
                    :(NSString*) callbackId
                    :(NSString*) sessionKey
{
    self = [super init];
    if(self) {
        self.plugin = plugin;
        self.queuedRemoteCandidates = [[NSMutableArray alloc] init];
        self.config = config;
        self.peerConnectionFactory = peerConnectionFactory;
        self.callbackId = callbackId;
        self.sessionKey = sessionKey;

        // initialize basic media constraints
        NSArray * mandatory = [NSArray arrayWithObjects:
                               [[RTCPair alloc] initWithKey:@"OfferToReceiveAudio" value:@"true"],
                               [[RTCPair alloc] initWithKey:@"OfferToReceiveVideo" value:self.plugin.videoConfig == nil ? @"false" : @"true"],
                               nil ];

        NSArray * optional = [NSArray arrayWithObjects:
                               [[RTCPair alloc] initWithKey:@"internalSctpDataChannels" value:@"true"],
                               [[RTCPair alloc] initWithKey:@"DtlsSrtpKeyAgreement" value:@"true"],
                               nil ];

        self.constraints = [[RTCMediaConstraints alloc] initWithMandatoryConstraints: mandatory optionalConstraints:optional];
    }
    return self;
}

-(void) call
{
    NSMutableArray* iceServers = [[NSMutableArray alloc] init];

    [iceServers addObject: [[RTCICEServer alloc] initWithURI: [NSURL URLWithString: @"stun:stun.l.google.com:19302"] username:@"" password:@""] ];
    [iceServers addObject: [[RTCICEServer alloc] initWithURI: [NSURL URLWithString: self.config.turn.host]
                                                              username:self.config.turn.username
                                                              password:self.config.turn.password]];

    // initialize a PeerConnection
    self.pcObserver = [[PCObserver alloc] init: self];
    self.peerConnection = [self.peerConnectionFactory peerConnectionWithICEServers: iceServers
                                                      constraints: self.constraints
                                                      delegate: self.pcObserver];

    // create a media stream and add audio and/or video tracks
    [self createOrUpdateStream];

    // create offer if initiator
    if (self.config.isInitiator) {

        [self.peerConnection createOfferWithDelegate: [[SessionDescriptionDelegate alloc] init: self]
                                                       constraints: self.constraints];
    }
}

-(void) createOrUpdateStream
{
    if (self.stream != nil) {
        [self.peerConnection removeStream: self.stream];
        self.stream = nil;
    }
    self.stream = [self.peerConnectionFactory mediaStreamWithLabel:@"ARDAMS"];

    if (self.config.streams.audio) {
        // init local audio track if needed
        if (self.plugin.localAudioTrack == nil) {
          [self.plugin initLocalAudioTrack];
        }
         [self.stream addAudioTrack: self.plugin.localAudioTrack]; //! in swift. Any issue ?
    }

    if (self.config.streams.video) {
        // init local video track if needed
        if (self.plugin.localVideoTrack == nil) {
            [self.plugin initLocalVideoTrack];
        }
        [self.stream addVideoTrack: self.plugin.localVideoTrack];
    }

    [self.peerConnection addStream: self.stream];
}

-(void)receiveMessage:(NSString*) message
{
    // Parse the incoming JSON message.
    NSError* error = nil;
    NSDictionary *data  = [NSJSONSerialization JSONObjectWithData: [message dataUsingEncoding: NSUTF8StringEncoding]
                                                         options: 0//NSJSONReadingOptions.allZeros
                                                         error: &error];

    if (data) {
        // Log the message to console.
        NSLog(@"Received Message: %@ ", message);
        // If the message has a type try to handle it.
        NSString *type = [NSString stringWithString: [data objectForKey: @"type" ]];
        if (type)  {
            if([type isEqualToString: @"candidate"]) {

                NSString *mid = [data objectForKey: @"id"];
                int sdpLineIndex = [[data objectForKey: @"label"] integerValue];
                NSString *sdp = [data objectForKey: @"candidate"] ;

                RTCICECandidate *candidate = [[RTCICECandidate alloc] initWithMid:
                                                mid
                                                index: sdpLineIndex
                                                sdp: sdp];


                if (self.queuedRemoteCandidates != nil) {
                    [self.queuedRemoteCandidates addObject: candidate];
                } else {
                    [self.peerConnection addICECandidate: candidate];
                }
            }
            //case "offer", "answer":
            else if([type isEqualToString: @"offer"] || [type isEqualToString: @"answer"]) {
                NSString *sdpString = [data objectForKey: @"sdp"];// stringValue];
                if (sdpString) {
                    RTCSessionDescription *sdp = [[RTCSessionDescription alloc] initWithType: type sdp: [self preferISAC: sdpString]];

                    [self.peerConnection setRemoteDescriptionWithDelegate: [[SessionDescriptionDelegate alloc] init: self]
                                                                          sessionDescription: sdp];
                }
            }
            else if ([type isEqualToString: @"bye"]) {
                [self disconnect: false];
            }
            else {
                NSLog(@"%@", @"Invalid message \(message)");
            }
        }
    } else {
        // If there was an error parsing then print it to console.
        if (error) {
            NSLog(@"%@", @"There was an error parsing the client message: \(parseError.localizedDescription)");
        }
        // If there is no data then exit.
        return;
    }
}

-(void) disconnect:(BOOL)sendByeMessage
{
    if (self.videoTrack != nil) {
      [self removeVideoTrack: self.videoTrack];
    }

    if (self.peerConnection != nil) {
        if (sendByeMessage) {
            NSDictionary *json =  @{ @"type": @"bye"};
            NSData *data = [NSJSONSerialization dataWithJSONObject: json
                                                              options: 0 //NSJSONWritingOptions.allZeros
                                                              error: nil];

           [self sendMessage: data];
        }

        [self.peerConnection close];
        self.peerConnection = nil;
        self.queuedRemoteCandidates = nil;
    }
    NSDictionary *json = @{ @"type": @"__disconnected"};
    NSData *data = [NSJSONSerialization dataWithJSONObject: json
                                                       options:0
                                                       error: nil];
    [self sendMessage: data];
    [self.plugin onSessionDisconnect: self.sessionKey];
}

-(void) addVideoTrack: (RTCVideoTrack*)videoTrack
{
    self.videoTrack = videoTrack;
    [self.plugin addRemoteVideoTrack: videoTrack];
}

-(void) removeVideoTrack: (RTCVideoTrack*)videoTrack
{
    [self.plugin removeRemoteVideoTrack: videoTrack];
}

-(NSString*) preferISAC:(NSString*)sdpDescription
{
    //just returning original sdp, not using ISAC. Note: the function seems to have an issue left. Commenting out
    NSString *origSDP = [sdpDescription stringByReplacingOccurrencesOfString: @"\r\n" withString: @"\n"];
    return origSDP;

//    int mLineIndex = -1;
//    NSString* isac16kRtpMap;
//
//    NSMutableArray *lines = [[origSDP componentsSeparatedByString: @"\n"] mutableCopy];
//    NSRegularExpression *isac16kRegex = [[NSRegularExpression alloc] initWithPattern:
//                                          @"^a=rtpmap:(\\d+) ISAC/16000[\r]?$"
//                                           options: 0 //NSRegularExpressionOptions.allZeros,
//                                           error: nil];
//
//    for (int i = 0;
//    (i < lines.count) && (mLineIndex == -1 || isac16kRtpMap == nil);
//    ++i)
//    {
//        NSString *line = [lines objectAtIndex:i];
//        if ([line hasPrefix: @"m=audio "]) {
//            mLineIndex = i;
//            continue;
//        }
//
//        isac16kRtpMap = [self firstMatch: isac16kRegex :line];
//    }
//
//    if (mLineIndex == -1) {
//        NSLog(@"%s", "No m=audio line, so can't prefer iSAC");
//        return origSDP;
//    }
//
//    if (isac16kRtpMap == nil) {
//        NSLog(@"%s)", "No ISAC/16000 line, so can't prefer iSAC");
//        return origSDP;
//    }
//
//
//    NSArray *origMLineParts = [[lines objectAtIndex: mLineIndex] componentsSeparatedByString: @" "];
//
//    NSMutableArray *newMLine = [[NSMutableArray alloc] init] ;
//    int origPartIndex = 0;
//
//    // Format is: m=<media> <port> <proto> <fmt> ...
//    [newMLine addObject: [origMLineParts objectAtIndex: origPartIndex++]];
//    [newMLine addObject: [origMLineParts objectAtIndex: origPartIndex++]];
//    [newMLine addObject: [origMLineParts objectAtIndex: origPartIndex++]];
//
//    [newMLine addObject: isac16kRtpMap];
//
//    for (; origPartIndex < origMLineParts.count; ++origPartIndex) {
//        if (isac16kRtpMap != [origMLineParts objectAtIndex: origPartIndex]) {
//            [newMLine addObject: [origMLineParts objectAtIndex: origPartIndex]];
//        }
//    }
//
////  lines[mLineIndex] = " ".join(newMLine)
////  return "\r\n".join(lines)
//    [lines replaceObjectAtIndex: mLineIndex withObject:[newMLine componentsJoinedByString:@" " ]];
//    return [lines componentsJoinedByString:@"\r\n"];
}

-(NSString*) firstMatch:(NSRegularExpression*)pattern :(NSString*)string
{
    NSTextCheckingResult *result = [pattern firstMatchInString: string
                                                    options: 0
                                                    range: NSMakeRange (0, string.length)];

    return [string substringWithRange: [result rangeAtIndex:1]];
}

-(void) sendMessage:(NSData*)message
{
    [self.plugin sendMessage: self.callbackId :message];
}

@end