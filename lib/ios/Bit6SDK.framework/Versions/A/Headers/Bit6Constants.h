//
//  Bit6Constants.h
//  Bit6
//
//  Created by Carlos Thurber Boaventura on 03/31/14.
//  Copyright (c) 2014 Bit6. All rights reserved.
//

typedef void (^Bit6CompletionHandler) (NSDictionary *response, NSError *error);

extern NSString* const Bit6LoginCompletedNotification;
extern NSString* const Bit6LogoutStartedNotification;

extern NSString* const Bit6RemoteNotificationReceived;
extern NSString* const Bit6DidRegisterForRemoteNotifications;
extern NSString* const Bit6DidFailToRegisterForRemoteNotifications;

extern NSString* const Bit6MessagesUpdatedNotification;
extern NSString* const Bit6ConversationsUpdatedNotification;

extern NSString* const Bit6TypingDidBeginRtNotification;
extern NSString* const Bit6TypingDidEndRtNotification;
extern NSString* const Bit6TypingAddressKey;

extern NSString* const Bit6MessageNotificationKey_ADDED;
extern NSString* const Bit6MessageNotificationKey_UPDATED;
extern NSString* const Bit6MessageNotificationKey_DELETED;

/*! Bit6 error constants */
typedef NS_ENUM(NSInteger, Bit6Error) {
    /*! Internet connection not found */
    Bit6Error_NotConnectedToInternet = NSURLErrorNotConnectedToInternet,
    
    /*! Restricted access to the Microphone */
    Bit6Error_MicNotAllowed=-6001,
    /*! Restricted access to the Camera */
    Bit6Error_CameraNotAllowed=-6002,
    /*! Restricted access to Location */
    Bit6Error_LocationNotAllowed=-6003,
    /*! Session hasn't being initiated */
    Bit6Error_SessionNotInitiated=-6011,
    /*! Attachment wasn't saved to cache */
    Bit6Error_SaveToCacheFailed=-6021,
    /*! Attachment doesn't exist in cache */
    Bit6Error_FileDoesNotExists=-6022,
    /*! Attachment doesn't exist in cache, but it is being downloaded */
    Bit6Error_FileDoesNotExistsWillDownload=-6023,
    /*! Attachment doesn't exist in the server, probably because an error during the upload process */
    Bit6Error_FileDoesNotExistsOnServer=-6024,
    /*! An HTTP status = 5xx occur when interacting with the server */
    Bit6Error_HTTPServerError=-6031,
    /*! An HTTP status = 4xx occur when interacting with the server */
    Bit6Error_HTTPClientError=-6032,
    
    /*! The recipient was not found */
    Bit6Error_RecipientNotFound=500,
};

/*! Push Notification Mode */
typedef NS_ENUM(NSInteger, Bit6PushNotificationMode) {
    /*! Development Mode for Push Notifications */
    Bit6PushNotificationMode_DEVELOPMENT = 1,
    /*! Production Mode for Push Notifications */
    Bit6PushNotificationMode_PRODUCTION
};