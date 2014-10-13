#import "AppDelegate+bit6.h"
#import <Bit6SDK/Bit6SDK.h>
#import <objc/runtime.h>

@implementation AppDelegate (bit6)


// its dangerous to override a method from within a category.
// Instead we will use method swizzling. we set this up in the load call.
+ (void)load
{
    Method original, swizzled;

    original = class_getInstanceMethod(self, @selector(init));
    swizzled = class_getInstanceMethod(self, @selector(swizzled_init));
    method_exchangeImplementations(original, swizzled);
}

- (AppDelegate *)swizzled_init
{
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(createNotificationChecker:)
                                                 name:@"UIApplicationDidFinishLaunchingNotification" object:nil];

    // This actually calls the original init method over in AppDelegate. Equivilent to calling super
    // on an overrided method, this is not recursive, although it appears that way. neat huh?
    return [self swizzled_init];
}

// This code will be called immediately after application:didFinishLaunchingWithOptions:. We need
// to process notifications in cold-start situations
- (void)createNotificationChecker:(NSNotification *)notification
{
    if (notification){
        NSDictionary *launchOptions = [notification userInfo];
        NSString *apiKey = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"API_KEY"];
        [Bit6 startWithApiKey:apiKey pushNotificationMode:Bit6PushNotificationMode_DEVELOPMENT launchingWithOptions:launchOptions];
    }
}


- (id) getCommandInstance:(NSString*)className
{
    return [self.viewController getCommandInstance:className];
}

@end
