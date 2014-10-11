//
//  Bit6ImageView.h
//  Bit6
//
//  Created by Carlos Thurber Boaventura on 06/05/14.
//  Copyright (c) 2014 Bit6. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "Bit6Message.h"

/*! Special subclass of UIImageView to work with the full images attached to a message */
@interface Bit6ImageView : UIImageView

/*! Message with an attachment to be displayed */
@property (nonatomic, copy) Bit6Message *message;

@end
