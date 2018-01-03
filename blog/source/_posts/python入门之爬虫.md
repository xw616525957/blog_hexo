---
title: python入门之爬虫
date: 2017-12-24 13:56:26
tags: python
---

## python安装
使用homebrew安装，可以选择python和python3都安装.[教程](https://stringpiggy.hpd.io/mac-osx-python3-dual-install/#step2)
## vscode 设置
下载vscode python插件，python
如果使用python3，在VS设置中修改python.pythonPath
Code-首选项-设置
``` js
"python.pythonPath": "/usr/local/bin/python3"
```
## python 基础
[教程](https://www.liaoxuefeng.com/wiki/0014316089557264a6b348958f449949df42a6d3a2e542c000)
## 爬虫实现
### 网络请求

``` python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests  
url = 'http://www.huizuche.com'
html = requests.get(url)
print(html.text)
```
### 页面解析
采用xpath解析页面文档，安装lxml模块
```shell
pip3 install lxml
```

简单使用实例
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
from lxml import etree
html='<div><div id="form"><input type="hidden" id="hd_key" value="I Love Python" /></div></div>'
selector = etree.HTML(html)
info = selector.xpath('//div[@id="form"]/input[@id="hd_key"]/@value')[0]
print(info)
```
[了解更多](https://cuiqingcai.com/2621.html)
### 并发请求
