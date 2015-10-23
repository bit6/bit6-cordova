#import "PhoneRTCPlugin.h"
#import "Session.h"

#import <AVFoundation/AVFoundation.h>


@implementation PhoneRTCPlugin

- (instancetype)initWithWebView:(UIWebView*)webView
{
    self = [super initWithWebView :webView];
    if (self) {
        self.peerConnectionFactory = [[RTCPeerConnectionFactory alloc] init];
        [RTCPeerConnectionFactory initializeSSL];
        self.sessions = [[NSMutableDictionary alloc] init];
        self.remoteVideoViews = [[NSMutableArray alloc] init];
    }
    return self;
}

- (void) createSessionObject:(CDVInvokedUrlCommand*)command
{
    NSString* sessionKey = [command argumentAtIndex:0];

    if(sessionKey) {
        NSDictionary* args = [command argumentAtIndex:1];
        NSLog(@"args count = %lu", (unsigned long)args.count);
        if(args) {
            SessionConfig* config = [[SessionConfig alloc] init:args];

            Session *session = [[Session alloc] init: self :self.peerConnectionFactory :config
                                                :command.callbackId
                                                :sessionKey];

            [self.sessions setObject: session forKey:sessionKey];
            NSLog(@"session count = %lu", (unsigned long)self.sessions.count);

            NSError *jsonError = nil;
            NSDictionary *json = @{@"type": @"__set_session_key",
                                           @"sessionKey": sessionKey};

            NSData *data = [NSJSONSerialization dataWithJSONObject: json options: 0 error: &jsonError];
            [session sendMessage: data];
        }
    }
}

-(void) call:(CDVInvokedUrlCommand*)command
{
    NSLog(@"Plugin call");
    NSDictionary* args = [command argumentAtIndex:0];
    NSString *sessionKey = [args objectForKey: @"sessionKey"];
    NSLog(@"Session key %@", sessionKey);
    if (sessionKey) {
        dispatch_async(dispatch_get_main_queue(), ^(void) {
            NSLog(@" sessons count %lu", (unsigned long)self.sessions.count);
            Session *session = [self.sessions objectForKey: sessionKey];
            if (session) {
              [session call];
            }

        });
    }
}

-(void) receiveMessage:(CDVInvokedUrlCommand*)command
{
    NSDictionary* args = [command argumentAtIndex:0];
    NSString *sessionKey = [args objectForKey: @"sessionKey"];
    if (sessionKey) {
        NSString *message = [args objectForKey: @"message"];
        if (message) {
            Session *session = [self.sessions objectForKey: sessionKey];
            if (session) {
                dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^(void){
                    [session receiveMessage: message];
                });
            }
        }
    }
}

-(void) renegotiate:(CDVInvokedUrlCommand*)command
{
    NSDictionary* args = [command argumentAtIndex:0];
    NSString *sessionKey = [args objectForKey: @"sessionKey"];// stringValue];
    if (sessionKey) {
        NSDictionary *config = [args objectForKey: @"config"];
        if (config) {
            dispatch_async(dispatch_get_main_queue(), ^(void) {
                Session *session = [self.sessions objectForKey: sessionKey];
                if (session) {
                    session.config = [[SessionConfig alloc] init:config];
                    [session createOrUpdateStream];
                }
            });
        }

    }
}

-(void) disconnect:(CDVInvokedUrlCommand*)command
{
    NSDictionary* args = [command argumentAtIndex:0];
    NSString *sessionKey = [args objectForKey: @"sessionKey"];
    if (sessionKey) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^(void) {
            Session *session = [self.sessions objectForKey: sessionKey];
            if (session) {
                [session disconnect: true];
            }
        });
    }
}

-(void) sendMessage: (NSString*) callbackId :(NSData*) message
{
    NSDictionary *json = [NSJSONSerialization JSONObjectWithData: message
                                                       options:NSJSONReadingMutableContainers//NSJSONReadingOptions.MutableLeaves
                                                       error: nil];

    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsDictionary:json];
    [pluginResult setKeepCallbackAsBool: true];

    [self.commandDelegate sendPluginResult: pluginResult callbackId:callbackId];
}

-(void) setVideoView:(CDVInvokedUrlCommand*)command
{
    NSDictionary* config = [command argumentAtIndex:0];

    dispatch_async(dispatch_get_main_queue(), ^(void) {
        // create session config from the JS params

        VideoConfig *videoConfig = [[VideoConfig alloc] init: config];

        self.videoConfig = videoConfig; //Init self.videoConfig to request remote video.

        // make sure that it's not junk
        if (videoConfig.container.width == 0 || videoConfig.container.height == 0) {
            return;
        }

        // add local video view
        if (self.videoConfig.local != nil) {
            if (self.localVideoTrack == nil) {
                [self initLocalVideoTrack];
            }

            if (self.videoConfig.local == nil) {
                // remove the local video view if it exists and
                // the new config doesn't have the `local` property
                if (self.localVideoView != nil) {
                    self.localVideoView.hidden = true;
                    [self.localVideoView removeFromSuperview];
                    self.localVideoView = nil;
                }
            } else {
                VideoLayoutParams *params = self.videoConfig.local;
                 // if the local video view already exists, just
                 // change its position according to the new config.

                if (self.localVideoView != nil) {
                    self.localVideoView.frame = CGRectMake(
                                                           (CGFloat) (params.x + self.videoConfig.container.x),
                                                           (CGFloat)(params.y + self.videoConfig.container.y),
                                                           (CGFloat)(params.width),
                                                           (CGFloat)(params.height)
                                                           );
                } else {
                    // otherwise, create the local video view
                    self.localVideoView = [self createVideoView: params];
                    [self.localVideoTrack addRenderer: self.localVideoView];
                }
            }
        }
        [self refreshVideoContainer];
    });
}

-(void) hideVideoView: (CDVInvokedUrlCommand*)command
{
    dispatch_async(dispatch_get_main_queue(), ^(void) {
        self.localVideoView.hidden = true;

        for (VideoTrackViewPair *remoteVideoView in self.remoteVideoViews) {
            remoteVideoView.videoView.hidden = true;
        }
    });
}

-(void) showVideoView: (CDVInvokedUrlCommand*)command
{
    dispatch_async(dispatch_get_main_queue(), ^(void) {
        self.localVideoView.hidden = false;

            for (VideoTrackViewPair *remoteVideoView in self.remoteVideoViews) {
                remoteVideoView.videoView.hidden = false;
        }
    });
}

-(RTCEAGLVideoView *)createVideoView: (VideoLayoutParams*) params
{
    RTCEAGLVideoView *view;

    if (params != nil) {
        CGRect frame = CGRectMake(
                               (CGFloat)(params.x + self.videoConfig.container.x),
                               (CGFloat)(params.y + self.videoConfig.container.y),
                               (CGFloat)(params.width),
                               (CGFloat)(params.height)
                                );

        view = [[RTCEAGLVideoView alloc] initWithFrame: frame];
    } else {
        view = [RTCEAGLVideoView alloc];
    }

    view.userInteractionEnabled = false;

    [self.webView addSubview: view];
    [self.webView bringSubviewToFront: view];

    return view;
}

-(void) initLocalAudioTrack
{
    self.localAudioTrack = [self.peerConnectionFactory audioTrackWithID: @"ARDAMSa0"];
}

-(void) initLocalVideoTrack
{
    NSString *cameraID;
    for (AVCaptureDevice *captureDevice in [AVCaptureDevice devicesWithMediaType: AVMediaTypeVideo]) {
        // TODO: Make this camera option configurable (TODO from original code)
        if (captureDevice.position == AVCaptureDevicePositionFront) {//AVCaptureDevicePosition.Front
            cameraID = [[NSString alloc] initWithString: captureDevice.localizedName];
        }
    }
    self.videoCapturer = [RTCVideoCapturer capturerWithDeviceName: cameraID ];

    self.videoSource = [self.peerConnectionFactory videoSourceWithCapturer: self.videoCapturer
                                                                            constraints: [RTCMediaConstraints alloc]];

    self.localVideoTrack = [self.peerConnectionFactory videoTrackWithID: @"ARDAMSv0" source: self.videoSource];
}

-(void) addRemoteVideoTrack: (RTCVideoTrack*)videoTrack
{
    if (self.videoConfig == nil) {
        return;
    }
    //Note: in original code video had been added without position, but it doesn't work properly.
    RTCEAGLVideoView *videoView = [self createVideoView: self.videoConfig.container];

    [videoTrack addRenderer: videoView];

    [self.remoteVideoViews addObject: [[VideoTrackViewPair alloc] init: videoView :videoTrack]];
    [self refreshVideoContainer];

    if (self.localVideoView != nil) {
        [self.webView bringSubviewToFront: self.localVideoView];
    }
}
-(void) removeRemoteVideoTrack: (RTCVideoTrack*)videoTrack
{
    dispatch_async(dispatch_get_main_queue(), ^(void) {
        for (int i = 0; i < self.remoteVideoViews.count; i++) {
            VideoTrackViewPair *pair = [self.remoteVideoViews objectAtIndex:i];
            if (pair.videoTrack == videoTrack) {
                pair.videoView.hidden = true;
                [pair.videoView removeFromSuperview];
                [self.remoteVideoViews removeObjectAtIndex:i];
                [self refreshVideoContainer];
                return;
            }
        }
    });
}
-(NSInteger) getCenter: (NSInteger) videoCount :(NSInteger) videoSize :(NSInteger) containerSize
{
    return lroundf((float)(containerSize - videoSize * videoCount) / 2.0);
}

-(void) refreshVideoContainer
{
    NSInteger n = self.remoteVideoViews.count;

    if (n == 0) {
        return;
    }
    NSInteger rows = n < 9 ? 2 : 3;
    NSInteger videosInRow = (n == 2 ? 2 : (NSInteger)(ceil((float)(n) / (float)(rows))));

    NSInteger videoSize = (int)((float)(self.videoConfig.container.width) / (float)(videosInRow));
    NSInteger actualRows = (int)(ceil((float)(n) / (float)(videosInRow)));

    NSInteger y = [self getCenter: actualRows
                      :videoSize
                           :self.videoConfig.container.height] + self.videoConfig.container.y;


    NSInteger videoViewIndex = 0;

    for (int row = 0; row < rows && videoViewIndex < n; row++) {
        NSInteger x = [self getCenter: (row < row - 1 || n % rows == 0 ?
                                  videosInRow : n - (MIN(n, videoViewIndex + videosInRow) - 1))
                                  :videoSize
                                  :self.videoConfig.container.width ]
        + self.videoConfig.container.x;


        for (int video = 0; video < videosInRow && videoViewIndex < n; video++) {
            VideoTrackViewPair *pair = [self.remoteVideoViews objectAtIndex: videoViewIndex++];
            pair.videoView.frame = CGRectMake(
                                              (CGFloat)(x),
                                              (CGFloat)(y),
                                              (CGFloat)(videoSize),
                                              (CGFloat)(videoSize)
                                              );

            x += (NSInteger)(videoSize);
        }
        y += (NSInteger)(videoSize);
    }
}


-(void) onSessionDisconnect:(NSString*) sessionKey
{
    [self.sessions removeObjectForKey: sessionKey];

    if (self.sessions.count == 0) {
        dispatch_sync(dispatch_get_main_queue(), ^(void) {
            if (self.localVideoView != nil) {
                self.localVideoView.hidden = true;
                [self.localVideoView removeFromSuperview];

                self.localVideoView = nil;
            }
        });

        self.localVideoTrack = nil;
        self.localAudioTrack = nil;

        self.videoSource = nil;
        self.videoCapturer = nil;
        self.videoConfig = nil;
    }
}

@end

@implementation VideoTrackViewPair
- (instancetype)init:(RTCEAGLVideoView*) videoViewP :(RTCVideoTrack*) videoTrack
{
    self.videoView = videoViewP;
    self.videoTrack = videoTrack;
    return self;
}
@end
