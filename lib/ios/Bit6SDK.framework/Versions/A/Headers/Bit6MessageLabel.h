//
//  Bit6MessageLabel.h
//  Bit6
//
//  Created by Carlos Thurber Boaventura on 08/12/14.
//  Copyright (c) 2014 Bit6. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "Bit6Message.h"
#import "Bit6MenuControllerDelegate.h"

@interface Bit6MessageLabel : UILabel

/*! Message with an attachment to be displayed */
@property (nonatomic, copy) Bit6Message *message;

@property (nonatomic, weak) id <Bit6MenuControllerDelegate> menuControllerDelegate;


@end
