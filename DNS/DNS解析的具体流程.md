# 域名层级及分级查询    
DNS服务器怎么会知道每个域名的IP地址呢？答案是分级查询。   

根域名.root对于所有域名都是一样的，所以平时是省略的。  
根域名的下一级，叫做"顶级域名"（top-level domain，缩写为TLD），比如：`.com、.cn、 .org、 edu`等等  
再下一级叫做"次级域名"（second-level domain，缩写为SLD），比如`www.baidu.com`里面的`.baidu`，这一级域名是用户可以注册的；
再下一级是主机名（host），比如`www.baidu.com`里面的`www`，又称为"三级域名"，这是用户在自己的域里面为服务器分配的名称，是用户可以任意分配的。  

域名的层级结构如下:  
> 主机名.次级域名.顶级域名.根域名  
> 即  
> host.sld.tld.root    

所谓"分级查询"，就是从根域名开始，依次查询每一级域名的NS记录，直到查到最终的IP地址。    

# DNS 解析的具体流程  
![](https://img-blog.csdnimg.cn/38d1f9b117204be79cc2d9c1d33476a6.png)    

1. 浏览器缓存：首先通过浏览器缓存信息寻找域名映射的IP地址，如果找到则返回，没找到则继续到下一级;    
如果一个域名的DNS解析结果会有多个的话，浏览器是如何处理的呢？Chrome浏览器会优先向第一个IP发起HTTP请求，如果不通，再向后面的IP发起HTTP请求；

2. 本机系统缓存：操作系统会检查自己本地的hosts文件是否有这个网址映射关系，如果有，就先调用这个IP地址映射，完成域名解析；  
hosts文件由操作系统操作的IP和域名的本地映射文件，可以视为DNS server的重写，一旦查到了指定的域名，就不会继续查找DNS server， 所以可以节省时间。
但是hosts设置的IP地址是静态的，如果web app的宿主机地址发生改变，对应的hosts也要改写    

有垃圾软件会偷偷修改系统的 hosts文件，达到 `DNS劫持` 的目的。 如： 把淘宝域名指向另外一个IP， 然后部署一个高仿的淘宝商城， 等你输入账号密码，你的账号信息就全部泄露了...    

3. 本地域名解析服务系统：本地域名系统`Local DNS`一般都是本地区的域名服务器。   
Windows系统使用命令`ipconfig` 就可以查看，在Linux和Mac系统下，直接使用命令 `cat /etc/resolv.conf `来查看LDNS服务地址。
如果hosts里没有这个域名的映射，则查找本地DNS解析器缓存，是否有这个网址映射关系，如果有，直接返回，完成域名解析。     
本地区域名服务器通常性能都会很好，它们一般都会缓存域名解析结果，当然缓存时间是受域名的失效时间控制的，一般缓存空间不是影响域名失效的主要因素。大约90%的域名解析都到这里就已经完成了，所以LDNS主要承担了域名的解析工作  

4. 根域名解析：本地域名解析服务系统无法解析时，会向 根DNS服务器 发起域名解析请求  
根域名服务器由 ICANN 来管理，在全球有 13 个根域名服务器，每个根域名服务器由多台机器。分布在全球各地，查询量非常大，所以分布在各地是有原因的。根域名服务器主要负责解析 TLD 服务器。  
由于DNS解析中采用的是UDP协议，仅能传递512字节的有效报文，因此只能构建出A-M 13个根服务器，而真正工作运行肯定不止13台服务器，而是包含很多服务器镜像的    

5. 根域名解析服务器返回 `gTLD (Generic top-level domain)` 给本地解析服务器，即该域名所属的顶级域及其所在的服务器   

6. 本地 DNS 服务器已知顶级域名服务器地址后，向其发送查询报文；
顶级域 DNS 服务器，也就是 TLD，提供了它的下一级，也就是权威 DNS 服务器的 IP 地址    

7. 顶级域名解析服务器返回 `权限域名服务器` 信息给本地解析服务器，权限域名服务器 即如：taobao.com   

8. 本地解析服务器已知权限域名服务器地址后，发起解析请求

9. 权限域名服务器返回域名对应的IP地址给本地解析服务器  
权威 DNS 服务器可以返回主机 - IP 的最终映射  

10. 本地解析服务器缓存相关信息，并返回给用户  

**递归查询**  
主机向本地DNS服务器发出的查询就是递归查询， 如果主机所询问的本地域名服务器不知道被查询域名的IP地址， 那么本地域名服务器就以DNS客户的身份，向其他根域名服务器继续发出查询请求报文（即替该主机继续查询）。因此，递归查询返回的查询结果或者是所要查询的IP地址，或者是报错，表示无法查询到所需的IP地址。    

**迭代查询**  
迭代查询，包括本地 DNS 服务器向根 DNS 服务器发送查询请求、本地 DNS 服务器向 TLD 服务器发送查询请求、本地 DNS 服务器向权威 DNS 服务器发送查询请求，所有的请求都是由本地 DNS 服务器发出，所有的响应都是直接返回给本地 DNS 服务器。


## 示例    

dig命令的+trace参数可以显示DNS的整个分级查询过程，以`www.baidu.com`为例：  
```
dig +trace www.baidu.com
```
执行结果如下： 
```
; <<>> DiG 9.10.6 <<>> +trace www.baidu.com
;; global options: +cmd
.			261546	IN	NS	m.root-servers.net.
.			261546	IN	NS	b.root-servers.net.
.			261546	IN	NS	c.root-servers.net.
.			261546	IN	NS	e.root-servers.net.
.			261546	IN	NS	a.root-servers.net.
.			261546	IN	NS	d.root-servers.net.
.			261546	IN	NS	h.root-servers.net.
.			261546	IN	NS	f.root-servers.net.
.			261546	IN	NS	i.root-servers.net.
.			261546	IN	NS	l.root-servers.net.
.			261546	IN	NS	g.root-servers.net.
.			261546	IN	NS	j.root-servers.net.
.			261546	IN	NS	k.root-servers.net.
;; Received 811 bytes from 202.103.44.150#53(202.103.44.150) in 8 ms

com.			172800	IN	NS	b.gtld-servers.net.
com.			172800	IN	NS	a.gtld-servers.net.
com.			172800	IN	NS	g.gtld-servers.net.
com.			172800	IN	NS	l.gtld-servers.net.
com.			172800	IN	NS	k.gtld-servers.net.
com.			172800	IN	NS	f.gtld-servers.net.
com.			172800	IN	NS	m.gtld-servers.net.
com.			172800	IN	NS	h.gtld-servers.net.
com.			172800	IN	NS	d.gtld-servers.net.
com.			172800	IN	NS	j.gtld-servers.net.
com.			172800	IN	NS	e.gtld-servers.net.
com.			172800	IN	NS	i.gtld-servers.net.
com.			172800	IN	NS	c.gtld-servers.net.
com.			86400	IN	DS	30909 8 2 E2D3C916F6DEEAC73294E8268FB5885044A833FC5459588F4A9184CF C41A5766
com.			86400	IN	RRSIG	DS 8 1 86400 20220706050000 20220623040000 47671 . gTzQQm4tnOsIPoVLWD6SH0WoaJ8f2PNswHzPiAxPkjwomcdQAoAZkOQ+ e0AyPfwWSIjX+lIabiRgH50uFnpzny23ZbkFZ8j6eAmtRUbsD5Q8y069 MdczqWI42xoZhTfvXRcr9iTy/x8swUlvAkmSt4UyE1bxVSSagyZJiWj7 1owFSiyUpYCp2CmzSzz/fq/IvsZEhGg203dkW7CWf64oeTgf10+rQl7p rvBs6GWpz9HMY3Pov10wOq9LycoK4B1Fazn4BIkxuwCx8gtLcGAOT9Bp Kcjr59zom69kEQ3NiY37gJvmgOfrvMGLs6NaPENJ88t6MXicCmqt9w5C FvkCgw==
;; Received 1176 bytes from 192.112.36.4#53(g.root-servers.net) in 216 ms

baidu.com.		172800	IN	NS	ns2.baidu.com.
baidu.com.		172800	IN	NS	ns3.baidu.com.
baidu.com.		172800	IN	NS	ns4.baidu.com.
baidu.com.		172800	IN	NS	ns1.baidu.com.
baidu.com.		172800	IN	NS	ns7.baidu.com.
CK0POJMG874LJREF7EFN8430QVIT8BSM.com. 86400 IN NSEC3 1 1 0 - CK0Q2D6NI4I7EQH8NA30NS61O48UL8G5  NS SOA RRSIG DNSKEY NSEC3PARAM
CK0POJMG874LJREF7EFN8430QVIT8BSM.com. 86400 IN RRSIG NSEC3 8 2 86400 20220628042403 20220621031403 37269 com. rfc2NecPtcwg8yYFqUggbzOIzMi5ycmZDgLJphdZbVuP9rPw0Wqc5pOL LgqPSkHSFPvpiWVpVsepEu2bN69Sw1Vt9BbFDqiy0rdwyWG0dq+Lgi8u EI+bAAEt59qQkLbsjc8B8Qhccfk0udUZhJxoU4lMCYDmIgUeG3owVvYz 22oJv+PEs9kgSfxa5npmRo6m04A2tQl3/CjK2P78JBtfFQ==
HPVUVSGH5TFIA7CM6SS6SMPOS87OE0CE.com. 86400 IN NSEC3 1 1 0 - HPVV8SARM2LDLRBTVC5EP1CUB1EF7LOP  NS DS RRSIG
HPVUVSGH5TFIA7CM6SS6SMPOS87OE0CE.com. 86400 IN RRSIG NSEC3 8 2 86400 20220628054058 20220621043058 37269 com. sjS8+vLHZWrNuqW8t+M0hZwEEPyqxdBUVE+qX1mVIVKG0AQgkevcjqYw 32Pw611ADt2cC5EF6PauAZEwUDnNe/uUZ8XlOrs1uX81BfbHsygbHjeL +49LCuC2acC2dm+uJCAy7PkmzocJveyI90KwUWFAmJ4RCysFnX7FOQpE puMpm7j2NXcRHcywoc5pdJuO+HXMhCO25cghDV0ffHbI1Q==
;; Received 817 bytes from 192.35.51.30#53(f.gtld-servers.net) in 236 ms

www.baidu.com.		1200	IN	CNAME	www.a.shifen.com.
;; Received 72 bytes from 180.76.76.92#53(ns7.baidu.com) in 16 ms
```
第一段列出根域名.的所有NS记录，即所有根域名服务器 ：
```
.			261546	IN	NS	m.root-servers.net.
.			261546	IN	NS	b.root-servers.net.
.			261546	IN	NS	c.root-servers.net.
.			261546	IN	NS	e.root-servers.net.
.			261546	IN	NS	a.root-servers.net.
.			261546	IN	NS	d.root-servers.net.
.			261546	IN	NS	h.root-servers.net.
.			261546	IN	NS	f.root-servers.net.
.			261546	IN	NS	i.root-servers.net.
.			261546	IN	NS	l.root-servers.net.
.			261546	IN	NS	g.root-servers.net.
.			261546	IN	NS	j.root-servers.net.
.			261546	IN	NS	k.root-servers.net.
``` 
根据内置的根域名服务器IP地址(202.103.44.150)，DNS服务器向所有这些IP地址发出查询请求，询问www.baidu.com的顶级域名服务器com.的NS记录。最先回复的根域名服务器将被缓存，以后只向这台服务器发请求  

---

接着是第二段:  
根域名DNS 服务器（192.112.36.4）说并不知道 www.baidu.com 顶级域名的具体信息，你去问 .com 顶级域名服务器去吧，并返回 .com 域名服务器的 NS 记录
```
com.			172800	IN	NS	b.gtld-servers.net.
com.			172800	IN	NS	a.gtld-servers.net.
com.			172800	IN	NS	g.gtld-servers.net.
com.			172800	IN	NS	l.gtld-servers.net.
com.			172800	IN	NS	k.gtld-servers.net.
com.			172800	IN	NS	f.gtld-servers.net.
com.			172800	IN	NS	m.gtld-servers.net.
com.			172800	IN	NS	h.gtld-servers.net.
com.			172800	IN	NS	d.gtld-servers.net.
com.			172800	IN	NS	j.gtld-servers.net.
com.			172800	IN	NS	e.gtld-servers.net.
com.			172800	IN	NS	i.gtld-servers.net.
com.			172800	IN	NS	c.gtld-servers.net.
```
上面结果显示.com域名的13条NS记录。

---  

然后，DNS服务器向这些顶级域名服务器发出查询请求，询问www.baidu.com的次级域名baidu.com的NS记录  
```
baidu.com.		172800	IN	NS	ns2.baidu.com.
baidu.com.		172800	IN	NS	ns3.baidu.com.
baidu.com.		172800	IN	NS	ns4.baidu.com.
baidu.com.		172800	IN	NS	ns1.baidu.com.
baidu.com.		172800	IN	NS	ns7.baidu.com.
```
上面结果显示baidu.com有5条NS记录。

--- 

然后，DNS服务器向上面这5台NS服务器查询www.baidu.com的主机名
```
www.baidu.com.		1200	IN	CNAME	www.a.shifen.com.
```
上面结果显示，www.baidu.com有1条CNAME记录   

---

总结：大致分级查询的过程如下：  

- 首先本地DNS服务器向根域名发起请求  
- 从"根域名服务器"查到"顶级域名服务器"的NS记录和A记录（IP地址）  
- 从"顶级域名服务器"查到"次级域名服务器"的NS记录和A记录（IP地址）  
- 从"次级域名服务器"查出"主机名"的IP地址   



# 参考资料 
[DNS 原理入门---阮一峰](http://ruanyifeng.com/blog/2016/06/dns.html)    
[https://juejin.cn/post/6854573215843352583#heading-8](https://juejin.cn/post/6854573215843352583#heading-8)  
[计算机网络（原书第7版）](https://book.douban.com/subject/30280001/)  