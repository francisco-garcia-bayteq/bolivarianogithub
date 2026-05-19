#import <React/RCTBridgeModule.h>
#import <LocalAuthentication/LocalAuthentication.h>

@interface BiometricEnrollmentModule : NSObject <RCTBridgeModule>
@end

@implementation BiometricEnrollmentModule

RCT_EXPORT_MODULE(BiometricEnrollmentModule);

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

RCT_EXPORT_METHOD(getBiometryDomainStateBase64
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject)
{
  LAContext *context = [[LAContext alloc] init];
  NSError *error = nil;
  if (![context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error]) {
    resolve([NSNull null]);
    return;
  }
  NSData *state = context.evaluatedPolicyDomainState;
  if (state == nil || state.length == 0) {
    resolve([NSNull null]);
    return;
  }
  resolve([state base64EncodedStringWithOptions:0]);
}

@end
