//
//  Bit6ThumbnailImageView.h
//  Bit6
//
//  Created by Carlos Thurber Boaventura on 04/03/14.
//  Copyright (c) 2014 Bit6. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "Bit6Message.h"
#import "Bit6MenuControllerDelegate.h"

@protocol Bit6ThumbnailImageViewDelegate;

/*! Special subclass of UIImageView to work with the message attachment thumbnails */
@interface Bit6ThumbnailImageView : UIImageView

/*! Message with an attachment to be displayed */
@property (nonatomic, copy) Bit6Message *message;

/*! The Bit6ThumbnailImageView delegate 
 @see Bit6ThumbnailImageViewDelegate
 */
@property (nonatomic, weak) id<Bit6ThumbnailImageViewDelegate>thumbnailImageViewDelegate;

@property (nonatomic, weak) id <Bit6MenuControllerDelegate> menuControllerDelegate;

@end

/*! The Bit6ThumbnailImageViewDelegate protocol defines methods that your delegate object must implement to interact with a <Bit6ThumbnailImageView> object. The methods of this protocol notify your delegate when the imageView has been tapped by the user.
 */
@protocol Bit6ThumbnailImageViewDelegate <NSObject>

/*! Tell the delegate that the imageView has been tapped by the user.
 @param thumbnailImageView The <Bit6ThumbnailImageView> object tapped by the user.
 */
- (void) touchedThumbnailImageView:(Bit6ThumbnailImageView*)thumbnailImageView;

@end