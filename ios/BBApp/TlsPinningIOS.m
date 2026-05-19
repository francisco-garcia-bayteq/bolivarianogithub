#import <React/RCTBridgeModule.h>
#import <React/RCTHTTPRequestHandler.h>
#import <CommonCrypto/CommonDigest.h>
#import <Security/Security.h>

@interface TlsPinningHelper : NSObject
+ (void)setConfigEnabled:(BOOL)enabled
             expectedHex:(NSString *)hex
      excludedHostsJson:(NSString *)json;
+ (BOOL)shouldVerifyHost:(NSString *)host;
+ (NSString *)sha256HexOfDer:(NSData *)der;
+ (BOOL)matchesExpectedHex:(NSString *)hex;
@end

@implementation TlsPinningHelper

static BOOL configEnabled = NO;
static NSString *configExpectedHex = nil;
static NSSet<NSString *> *configExcludedHosts = nil;

+ (void)setConfigEnabled:(BOOL)enabled
             expectedHex:(NSString *)hex
      excludedHostsJson:(NSString *)json
{
  configEnabled = enabled;
  configExpectedHex =
      [[hex stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] lowercaseString];
  NSMutableSet *set = [NSMutableSet set];
  NSData *data = [json dataUsingEncoding:NSUTF8StringEncoding];
  if (data != nil) {
    NSError *err = nil;
    id obj = [NSJSONSerialization JSONObjectWithData:data options:0 error:&err];
    if ([obj isKindOfClass:[NSArray class]]) {
      for (NSString *h in (NSArray *)obj) {
        if ([h isKindOfClass:[NSString class]]) {
          [set addObject:[h lowercaseString]];
        }
      }
    }
  }
  configExcludedHosts = [set copy];
}

+ (BOOL)isExcludedHost:(NSString *)host
{
  NSString *h = [host lowercaseString];
  for (NSString *ex in configExcludedHosts) {
    if ([h isEqualToString:ex] || [h hasSuffix:[NSString stringWithFormat:@".%@", ex]]) {
      return YES;
    }
  }
  return NO;
}

+ (BOOL)shouldVerifyHost:(NSString *)host
{
  if (!configEnabled || configExpectedHex == nil || [configExpectedHex length] == 0) {
    return NO;
  }
  if (host == nil) {
    return NO;
  }
  if ([self isExcludedHost:host]) {
    return NO;
  }
  return YES;
}

+ (NSString *)sha256HexOfDer:(NSData *)der
{
  unsigned char digest[CC_SHA256_DIGEST_LENGTH];
  CC_SHA256(der.bytes, (CC_LONG)der.length, digest);
  NSMutableString *hex = [NSMutableString stringWithCapacity:CC_SHA256_DIGEST_LENGTH * 2];
  for (int i = 0; i < CC_SHA256_DIGEST_LENGTH; i++) {
    [hex appendFormat:@"%02x", digest[i]];
  }
  return hex;
}

+ (BOOL)matchesExpectedHex:(NSString *)hex
{
  if (configExpectedHex == nil || hex == nil) {
    return NO;
  }
  return [hex caseInsensitiveCompare:configExpectedHex] == NSOrderedSame;
}

@end

@implementation RCTHTTPRequestHandler (TlsPinning)

- (void)URLSession:(NSURLSession *)session
              task:(NSURLSessionTask *)task
didReceiveChallenge:(NSURLAuthenticationChallenge *)challenge
 completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition disposition,
                             NSURLCredential *_Nullable credential))completionHandler
{
  if (![challenge.protectionSpace.authenticationMethod isEqualToString:NSURLAuthenticationMethodServerTrust]) {
    completionHandler(NSURLSessionAuthChallengePerformDefaultHandling, nil);
    return;
  }
  NSString *host = task.originalRequest.URL.host;
  if (![TlsPinningHelper shouldVerifyHost:host]) {
    completionHandler(NSURLSessionAuthChallengePerformDefaultHandling, nil);
    return;
  }
  SecTrustRef serverTrust = challenge.protectionSpace.serverTrust;
  if (serverTrust == NULL) {
    completionHandler(NSURLSessionAuthChallengeCancelAuthenticationChallenge, nil);
    return;
  }
  if (@available(iOS 12.0, *)) {
    CFErrorRef cfErr = NULL;
    if (!SecTrustEvaluateWithError(serverTrust, &cfErr)) {
      if (cfErr != NULL) {
        CFRelease(cfErr);
      }
      completionHandler(NSURLSessionAuthChallengeCancelAuthenticationChallenge, nil);
      return;
    }
  } else {
    SecTrustResultType result = kSecTrustResultInvalid;
    if (SecTrustEvaluate(serverTrust, &result) != errSecSuccess) {
      completionHandler(NSURLSessionAuthChallengeCancelAuthenticationChallenge, nil);
      return;
    }
  }
  SecCertificateRef cert = SecTrustGetCertificateAtIndex(serverTrust, 0);
  if (cert == NULL) {
    completionHandler(NSURLSessionAuthChallengeCancelAuthenticationChallenge, nil);
    return;
  }
  CFDataRef derData = SecCertificateCopyData(cert);
  NSData *der = (__bridge_transfer NSData *)derData;
  NSString *hex = [TlsPinningHelper sha256HexOfDer:der];
  if (![TlsPinningHelper matchesExpectedHex:hex]) {
    completionHandler(NSURLSessionAuthChallengeCancelAuthenticationChallenge, nil);
    return;
  }
  completionHandler(NSURLSessionAuthChallengePerformDefaultHandling, nil);
}

@end

@interface TlsPinningModule : NSObject <RCTBridgeModule>
@end

@implementation TlsPinningModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setConfig:(BOOL)enabled
                  expectedHex:(NSString *)expectedHex
                  excludedHostsJson:(NSString *)json)
{
  [TlsPinningHelper setConfigEnabled:enabled
                          expectedHex:expectedHex
                   excludedHostsJson:json];
}

@end
