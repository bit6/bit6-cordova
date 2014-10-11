//
//  Bit6Address.h
//  Bit6
//
//  Created by Carlos Thurber Boaventura on 04/02/14.
//  Copyright (c) 2014 Bit6. All rights reserved.
//

#import <Foundation/Foundation.h>

/*! Bit6Address kind */
typedef NS_ENUM(NSInteger, Bit6AddressKind) {
    /*! The Bit6Address refers to a phone number */
    Bit6AddressKind_PHONE,
    /*! The Bit6Address refers to an username */
    Bit6AddressKind_USERNAME
};

/*! Bit6Address is used to describe a user identity or a destination for calling and messaging. */
@interface Bit6Address : NSObject

/*! Initializes a Bit6Address object
 @param kind Destination kind.
 @param value Destination value.
 @return a Bit6Address object.
 @warning The only address kind currently allowed is Bit6AddressKind_USERNAME.
 */
- (instancetype)initWithKind:(Bit6AddressKind)kind value:(NSString*)value;

/*! A display name for this <Bit6UserIdentity> object. */
@property (nonatomic, readonly) NSString *displayName;

@end
