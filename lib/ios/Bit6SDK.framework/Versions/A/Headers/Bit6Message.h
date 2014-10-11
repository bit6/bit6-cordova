//
//  Bit6Message.h
//  Bit6
//
//  Created by Carlos Thurber Boaventura on 03/21/14.
//  Copyright (c) 2014 Bit6. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Bit6Address.h"
#import <UIKit/UIKit.h>

/*! Channels available for sending a <Bit6Message>. */
typedef NS_ENUM(NSInteger, Bit6MessageChannel) {
    /*! The message is an SMS. */
    Bit6MessageChannel_SMS = 2,
    /*! The message is an app-to-app message. */
    Bit6MessageChannel_PUSH = 3
};

/*! Delivery status for a <Bit6Message>. */
typedef NS_ENUM(NSInteger, Bit6MessageStatus){
    /*! The message is being sent. */
    Bit6MessageStatus_Sending = 1,
    /*! The message has been sent. */
    Bit6MessageStatus_Sent,
    /*! The message sending has failed. */
    Bit6MessageStatus_Failed,
    /*! The message has been delivered. */
    Bit6MessageStatus_Delivered,
    /*! The message has been read. */
    Bit6MessageStatus_Read
};

/*! Message type for a <Bit6Message>. */
typedef NS_ENUM(NSInteger, Bit6MessageType) {
    /*! The message has only text. */
    Bit6MessageType_Text = 1,
    /*! The message has an attachment. */
    Bit6MessageType_Attachments = 5,
    /*! The message has a location. */
    Bit6MessageType_Location = 6
};

/*! Attachment type for a <Bit6Message> */
typedef NS_ENUM(NSInteger, Bit6MessageFileType) {
    /*! The message has no attachment. */
    Bit6MessageFileType_None = 0,
    /*! The message has an MP4 audio attachment. */
    Bit6MessageFileType_AudioMP4,
    /*! The message has an PNG image attachment. */
    Bit6MessageFileType_ImagePNG,
    /*! The message has an JPEG image attachment. */
    Bit6MessageFileType_ImageJPG,
    /*! The message has an MP4 video attachment. */
    Bit6MessageFileType_VideoMP4,
};

/*! Message attachment category for a <Bit6Message>. */
typedef NS_ENUM(NSInteger, Bit6MessageAttachmentCategory) {
    /*! The thumbnail image for the message. */
    Bit6MessageAttachmentCategory_THUMBNAIL = 1,
    /*! The full size attachment for the message. */
    Bit6MessageAttachmentCategory_FULL_SIZE
};

/*! Message attachment status for a <Bit6Message>. */
typedef NS_ENUM(NSInteger, Bit6MessageAttachmentStatus) {
    /*! The message doesn't have the specified attachment */
    Bit6MessageAttachmentStatus_INVALID = -2,
    /*! The attachment doesn't exists */
    Bit6MessageAttachmentStatus_FAILED,
    /*! The attachment is not in cache */
    Bit6MessageAttachmentStatus_NOT_FOUND,
    /*! The attachment is being downloaded */
    Bit6MessageAttachmentStatus_DOWNLOADING,
    /*! The attachment is in cache */
    Bit6MessageAttachmentStatus_FOUND
};

@class Bit6MessageData;

/*! A Bit6Message object represents a message sent or received by the user. */
@interface Bit6Message : NSObject

/*! The text content of the message. */
@property (nonatomic, readonly, copy) NSString *content;

/*! YES if this is an incoming message. */
@property (nonatomic, readonly) BOOL incoming;

/*! Message status as a value of the <Bit6MessageStatus> enumeration. */
@property (nonatomic, readonly) Bit6MessageStatus status;

/*! Message type as a value of the <Bit6MessageType> enumeration. */
@property (nonatomic, readonly) Bit6MessageType type;

/*! Gets the other person address as a <Bit6Address> object. */
@property (nonatomic, readonly, copy) Bit6Address *other;

/*! Gets the information about the message attachments. */
@property (nonatomic, readonly, strong) Bit6MessageData *data;

/*! Gets the attachment type of this message as a value of the <Bit6MessageFileType> enumeration. */
@property (nonatomic, readonly) Bit6MessageFileType attachFileType;

/*! Returns the status for the message's attachments
 @param attachmentCategory attachment to query as a value of the <Bit6MessageAttachmentCategory> enumeration
 @return the attachment's status as a value of the <Bit6MessageAttachmentStatus> enumeration
 */
- (Bit6MessageAttachmentStatus) attachmentStatusForAttachmentCategory:(Bit6MessageAttachmentCategory)attachmentCategory;

/*! Returns the path for the message's attachments
 @param attachmentCategory attachment to query as a value of the <Bit6MessageAttachmentCategory> enumeration
 @return the attachment's path
 */
- (NSString*) attachmentPathForAttachmentCategory:(Bit6MessageAttachmentCategory)attachmentCategory;

@end

/*! A Bit6MessageData object represents the data attached attached to a <Bit6Message> object. */
@interface Bit6MessageData : NSObject

/*! Latitude of the location included in the message. */
@property (nonatomic, copy) NSNumber *lat;

/*! Longitude of the location included in the message. */
@property (nonatomic, copy) NSNumber *lng;

@end