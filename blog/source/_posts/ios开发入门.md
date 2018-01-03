---
title: ios开发入门
date: 2017-12-30 17:14:04
tags:
---
[第一个IOS应用](http://www.cnblogs.com/liufan9/archive/2012/05/29/2523631.html)
# 开发环境准备

# 开始第一个app

# 新手问题总结
## 为storyboard 添加Entry point
1、选择要添加入口的Controller
2、然后在右侧菜单栏。选择Show the Attributes inspector
3、选中is initial View Controller.
## Terminating app due to uncaught exception 'NSInternalInconsistencyException', reason: '-[UITableViewController loadView] instantiated view controller with identifier "UIViewController-BYZ-38-t0r" from storyboard "Main", but didn't get a UITableView.
删除默认的storyboard,新建storyboard,在项目属性，DeploymentInfo--Main Interface选择新建的storyboard

# 功能实现

```objectc
#define ITMS_PROD_VERIFY_RECEIPT_URL        @"https://buy.itunes.apple.com/verifyReceipt"
#define ITMS_SANDBOX_VERIFY_RECEIPT_URL     @"https://sandbox.itunes.apple.com/verifyReceipt";

NSString *encodingStr = [transaction.transactionReceipt base64EncodedString];
    
NSString *url;
#ifdef DEBUG
url = ITMS_SANDBOX_VERIFY_RECEIPT_URL;
#else
url = ITMS_PROD_VERIFY_RECEIPT_URL;
#endif
// 创建POST请求。
NSString *payload = [NSString stringWithFormat:
                         @"{\"receipt-data\" : \"%@\", \"password\" : \"%@\"}",
                         encodingStr, ITC_CONTENT_PROVIDER_SHARED_SECRET];
 NSData *payloadData = [payload dataUsingEncoding:NSUTF8StringEncoding];
 
 NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:url]];
 [request setHTTPMethod:@"POST"];
 [request setHTTPBody:payloadData];
 NSURLConnection *conn = [[NSURLConnection alloc]initWithRequest:request delegate:self];
 
 [conn start];
```