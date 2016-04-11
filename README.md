[meixin-h5-proxy](https://github.com/yanglang1987500/meixin-h5-proxy) — 美信H5 CDN代理模块
==================================================

简介
----

此模块通过nodejs安装后可以直接进行CDN资源代理，便于调试。

使用指南
----
与gulp一样，支持全局命令proxy<br>

```
npm install meixin-h5-proxy -g
```
```
npm install meixin-h5-proxy --save-dev
```

然后可以直接通过如下命令进行代理
```
proxy -d 'D:\work\mshop svn\trunk\Public\mshop_svn_resources\src' -p '/m/app/src'
```

可以通过
```
proxy -h
```
查看帮助
-d代表想要代理的文件目录，-p代表CDN链接中间那部分


最后需要配置一下hosts，
---
127.0.0.1  js-pre.meixincdn.com