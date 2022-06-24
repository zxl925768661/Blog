# DNS简介 
DNS（Domain Name System） 即域名系统。 作用就是根据域名查出 IP 地址。  

# 查询过程 
我们使用`dig`(Dig是一个在类Unix命令行模式下查询DNS包括NS记录，A记录，MX记录等相关信息的工具)来显示`wwww.baidu.com` DNS的查询过程。 
```
dig www.baidu.com
```
上面的命令会输出六段信息：  
![查询结果](https://img-blog.csdnimg.cn/44da29dc026c4fd29bce5cd4bf641649.png)  
第一段是查询参数和统计：   
```js
; <<>> DiG 9.10.6 <<>> www.baidu.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 17163
;; flags: qr rd ra; QUERY: 1, ANSWER: 3, AUTHORITY: 5, ADDITIONAL: 7
```
其中
```
; <<>> DiG 9.10.6 <<>> www.baidu.com 
;; global options: +cmd
```
是 dig版本（version 9.10.6）及输入参数信息  
剩下的就是 DNS一些头部信息， status值为`NOERROR`代表本次查询成功

---
第二段是查询内容： 
```
;; QUESTION SECTION:
;www.baidu.com.                 IN      A
```

上面结果表示，查询域名www.baidu.com的A记录，A是address的缩写    
IN 是固定关键字。 

---

第三段是DNS服务器的答复:  
```
;; ANSWER SECTION:
www.baidu.com.          600     IN      CNAME   www.a.shifen.com.
www.a.shifen.com.       600     IN      A       14.215.177.38
www.a.shifen.com.       600     IN      A       14.215.177.39
```

上面结果显示，www.baidu.com有一个CNAME记录， `CNAME` 表示查询 www.baidu.com 的信息其实是 www.a.shifen.com 返回的 A 记录； 有两个A记录，即两个IP地址。600是TTL值（Time to live 的缩写），表示缓存时间，即600秒之内不用重新查询

--- 

第四段是显示www.baidu.com的NS记录（Name Server的缩写），即哪些服务器负责管理www.baidu.com的DNS记录：
```
;; AUTHORITY SECTION:
a.shifen.com.           714     IN      NS      ns1.a.shifen.com.
a.shifen.com.           714     IN      NS      ns5.a.shifen.com.
a.shifen.com.           714     IN      NS      ns2.a.shifen.com.
a.shifen.com.           714     IN      NS      ns4.a.shifen.com.
a.shifen.com.           714     IN      NS      ns3.a.shifen.com.
```
上面结果显示www.baidu.com共有5条NS记录，即5个域名服务器，向其中任一台查询就能知道www.baidu.com的IP地址是什么。    

NS指的是服务器主机名，在`AUTHORITY SECTION`里面的服务器主机名，都会在`ADDITIONAL SECTION`里给出该主机的IP地址。  

---

第五段是上面5个域名服务器的IP地址，这是随着前一段一起返回的: 
```
;; ADDITIONAL SECTION:
ns1.a.shifen.com.       165     IN      A       110.242.68.42
ns2.a.shifen.com.       162     IN      A       220.181.33.32
ns3.a.shifen.com.       396     IN      A       112.80.255.253
ns4.a.shifen.com.       101     IN      A       14.215.177.229
ns5.a.shifen.com.       589     IN      A       180.76.76.95
ns5.a.shifen.com.       119     IN      AAAA    240e:940:603:a:0:ff:b08d:239d
ns5.a.shifen.com.       119     IN      AAAA    240e:bf:b801:1006:0:ff:b04f:346b
```
A (Address) 记录是用来指定域名对应的IP地址记录，同时也可以设置域名的子域名，A记录目标地址只能使用IP地址。     
AAAA 用来指定主机名(或域名)对应的 IPv6 地址记录    

---

第六段是DNS服务器的一些传输信息：
```
;; Query time: 5 msec
;; SERVER: 202.103.24.68#53(202.103.24.68)
;; WHEN: Thu Jun 23 10:48:49 CST 2022
;; MSG SIZE  rcvd: 316
```

查询耗时5ms，本机的DNS服务器是202.103.24.68，查询端口是53（DNS服务器的默认端口），在2022-06-23 10:48:49时间进行的查询，以及回应长度是316字节    

--- 


## 直接显示DNS寻址结果
使用`+short`参数 , 这样控制台直接返回该域名对应的 IP 地址
```
dig +short www.baidu.com
www.a.shifen.com.
14.215.177.39
14.215.177.38
```
上面命令只返回www.baidu.com对应的1个cname别名， 2个IP地址（即A记录）

## 向特定DNS服务器寻址  

本机只向自己的DNS服务器查询，dig命令有一个@参数，显示向其他DNS服务器查询的结果, 我们使用Google的8.8.8.8公网的DNS服务器寻找 www.baidu.com 域名的 DNS 解析结果：  
```bash
dig @8.8.8.8 www.baidu.com
```
执行结果如下： 
```
; <<>> DiG 9.10.6 <<>> @8.8.8.8 www.baidu.com
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 16405
;; flags: qr rd ra; QUERY: 1, ANSWER: 3, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512
;; QUESTION SECTION:
;www.baidu.com.                 IN      A

;; ANSWER SECTION:
www.baidu.com.          14      IN      CNAME   www.a.shifen.com.
www.a.shifen.com.       197     IN      CNAME   www.wshifen.com.
www.wshifen.com.        197     IN      A       103.235.46.40

;; Query time: 69 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: Thu Jun 23 14:32:55 CST 2022
;; MSG SIZE  rcvd: 111
```
从返回结果可以看到，当我们向 8.8.8.8 DNS 服务器寻址时，其返回了 2 个 CNAME, 1个 IP 地址。跟我们向本地 DNS 服务器寻址时返回结果不一样。这说明了不同 DNS 服务器所存储的解析记录不同，并不说某个 DNS 服务器是错误的。   
  
如果只想显示 "ANSWER SECTION" 的内容, 可以使用`+noall +answer `    
## 查询A记录

A (Address) 记录是用来指定域名对应的IPv4 地址记录，同时也可以设置域名的子域名，A记录目标地址只能使用IP地址。  
当相同域名有多个A记录时，表示轮循，可以达到负载均衡的目的。    
```
dig a www.baidu.com
```
执行结果如下：  
```
; <<>> DiG 9.10.6 <<>> a www.baidu.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 36994
;; flags: qr rd ra; QUERY: 1, ANSWER: 3, AUTHORITY: 5, ADDITIONAL: 7

;; QUESTION SECTION:
;www.baidu.com.                 IN      A

;; ANSWER SECTION:
www.baidu.com.          600     IN      CNAME   www.a.shifen.com.
www.a.shifen.com.       600     IN      A       14.215.177.39
www.a.shifen.com.       600     IN      A       14.215.177.38

;; AUTHORITY SECTION:
a.shifen.com.           1014    IN      NS      ns1.a.shifen.com.
a.shifen.com.           1014    IN      NS      ns2.a.shifen.com.
a.shifen.com.           1014    IN      NS      ns5.a.shifen.com.
a.shifen.com.           1014    IN      NS      ns3.a.shifen.com.
a.shifen.com.           1014    IN      NS      ns4.a.shifen.com.

;; ADDITIONAL SECTION:
ns1.a.shifen.com.       1014    IN      A       110.242.68.42
ns2.a.shifen.com.       211     IN      A       220.181.33.32
ns3.a.shifen.com.       347     IN      A       112.80.255.253
ns4.a.shifen.com.       347     IN      A       14.215.177.229
ns5.a.shifen.com.       537     IN      A       180.76.76.95
ns5.a.shifen.com.       7       IN      AAAA    240e:940:603:a:0:ff:b08d:239d
ns5.a.shifen.com.       7       IN      AAAA    240e:bf:b801:1006:0:ff:b04f:346b

;; Query time: 5 msec
;; SERVER: 202.103.24.68#53(202.103.24.68)
;; WHEN: Thu Jun 23 14:46:41 CST 2022
;; MSG SIZE  rcvd: 316
```
可以看到， 一个CNAME， 两个IP地址 


## 查询AAAA记录

AAAA记录是用来将域名解析到IPv6地址的DNS记录，其它方面同A记录。
```
dig aaaa ns5.a.shifen.com.
```
执行结果如下： 
```
; <<>> DiG 9.10.6 <<>> aaaa ns5.a.shifen.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 28220
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 5, ADDITIONAL: 6

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;ns5.a.shifen.com.		IN	AAAA

;; ANSWER SECTION:
ns5.a.shifen.com.	600	IN	AAAA	240e:940:603:a:0:ff:b08d:239d
ns5.a.shifen.com.	600	IN	AAAA	240e:bf:b801:1006:0:ff:b04f:346b

;; AUTHORITY SECTION:
a.shifen.com.		139	IN	NS	ns4.a.shifen.com.
a.shifen.com.		139	IN	NS	ns1.a.shifen.com.
a.shifen.com.		139	IN	NS	ns2.a.shifen.com.
a.shifen.com.		139	IN	NS	ns5.a.shifen.com.
a.shifen.com.		139	IN	NS	ns3.a.shifen.com.

;; ADDITIONAL SECTION:
ns1.a.shifen.com.	36	IN	A	110.242.68.42
ns2.a.shifen.com.	448	IN	A	220.181.33.32
ns3.a.shifen.com.	89	IN	A	112.80.255.253
ns4.a.shifen.com.	89	IN	A	14.215.177.229
ns5.a.shifen.com.	339	IN	A	180.76.76.95

;; Query time: 4 msec
;; SERVER: 202.103.24.68#53(202.103.24.68)
;; WHEN: Thu Jun 23 15:02:37 CST 2022
;; MSG SIZE  rcvd: 267
```
可以看到ns5.a.shifen.com.有两个AAAA记录  

## CNAME记录

CNAME记录用于将一个域名映射到另外一个域名，DNS遇到CNAME记录会以映射到的目标重新开始查询，CNAME记录的目标地址只能使用域名，不能使用IP地址，A记录优先于CNAME记录，如果一个域名同时存在A记录和CNAME记录，则CNAME记录不生效。
```
dig cname www.baidu.com
```
执行结果如下：  
```
; <<>> DiG 9.10.6 <<>> cname www.baidu.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12879
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 5, ADDITIONAL: 8

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;www.baidu.com.                 IN      CNAME

;; ANSWER SECTION:
www.baidu.com.          600     IN      CNAME   www.a.shifen.com.

;; AUTHORITY SECTION:
baidu.com.              86396   IN      NS      ns7.baidu.com.
baidu.com.              86396   IN      NS      ns4.baidu.com.
baidu.com.              86396   IN      NS      ns2.baidu.com.
baidu.com.              86396   IN      NS      dns.baidu.com.
baidu.com.              86396   IN      NS      ns3.baidu.com.

;; ADDITIONAL SECTION:
ns3.baidu.com.          171000  IN      A       112.80.248.64
ns4.baidu.com.          22416   IN      A       14.215.178.80
ns7.baidu.com.          39961   IN      A       180.76.76.92
ns2.baidu.com.          17086   IN      A       220.181.33.31
dns.baidu.com.          17      IN      A       110.242.68.134
ns7.baidu.com.          44721   IN      AAAA    240e:bf:b801:1002:0:ff:b024:26de
ns7.baidu.com.          44721   IN      AAAA    240e:940:603:4:0:ff:b01b:589a

;; Query time: 12 msec
;; SERVER: 202.103.24.68#53(202.103.24.68)
;; WHEN: Thu Jun 23 14:53:19 CST 2022
;; MSG SIZE  rcvd: 295
```
可以看出CNAME 为 www.a.shifen.com.  
也就是说，用户查询 www.baidu.com 的时候，实际上返回的是 www.a.shifen.com 的IP地址。这样的好处是，变更服务器IP地址的时候，只要修改 www.a.shifen.com 这个域名就可以了，用户的 www.baidu.com 域名不用修改。

由于CNAME记录就是一个替换，所以域名一旦设置CNAME记录以后，就不能再设置其他记录了（比如A记录和MX记录），这是为了防止产生冲突。举例来说，foo.com指向bar.com，而两个域名各有自己的MX记录，如果两者不一致，就会产生问题。由于顶级域名通常要设置MX记录，所以一般不允许用户对顶级域名设置CNAME记录。

## MX记录

MX记录用于指定负责处理发往收件人域名的邮件服务器，MX记录允许设置一个优先级，越小的数字代表越高的优先次序，当多个邮件服务器可用时，会根据该值决定投递邮件的服务器。MX记录的目标地址可以使用域名或IP地址。

MX记录中的域名必须能够映射到一个或者多个DNS中类型为A或者AAAA的地址记录, 且根据RFC2181，原则上禁止指向CNAME记录。  
```
dig mx www.baidu.com
```
执行结果如下：  
```
; <<>> DiG 9.10.6 <<>> mx www.baidu.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 42612
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;www.baidu.com.			IN	MX

;; ANSWER SECTION:
www.baidu.com.		350	IN	CNAME	www.a.shifen.com.

;; AUTHORITY SECTION:
a.shifen.com.		600	IN	SOA	ns1.a.shifen.com. baidu_dns_master.baidu.com. 2206230007 5 5 2592000 3600

;; Query time: 38 msec
;; SERVER: 202.103.24.68#53(202.103.24.68)
;; WHEN: Thu Jun 23 15:05:28 CST 2022
;; MSG SIZE  rcvd: 126
```
可以看到其返回了一条类型为 SOA 的记录，这表明 www.baidu.com 的 MX 记录不存在。

 

## NS记录

NS记录用来指定域名由哪个服务器来解析，NS记录的目标地址可以使用域名或IP地址。   
```
dig ns baidu.com
```
执行结果如下： 
```
; <<>> DiG 9.10.6 <<>> ns baidu.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 39540
;; flags: qr rd ra; QUERY: 1, ANSWER: 5, AUTHORITY: 0, ADDITIONAL: 8

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;baidu.com.			IN	NS

;; ANSWER SECTION:
baidu.com.		86400	IN	NS	ns7.baidu.com.
baidu.com.		86400	IN	NS	ns4.baidu.com.
baidu.com.		86400	IN	NS	ns2.baidu.com.
baidu.com.		86400	IN	NS	ns3.baidu.com.
baidu.com.		86400	IN	NS	dns.baidu.com.

;; ADDITIONAL SECTION:
ns4.baidu.com.		159424	IN	A	14.215.178.80
ns3.baidu.com.		169064	IN	A	112.80.248.64
dns.baidu.com.		252	IN	A	110.242.68.134
ns7.baidu.com.		159455	IN	A	180.76.76.92
ns2.baidu.com.		163618	IN	A	220.181.33.31
ns7.baidu.com.		168979	IN	AAAA	240e:bf:b801:1002:0:ff:b024:26de
ns7.baidu.com.		168979	IN	AAAA	240e:940:603:4:0:ff:b01b:589a

;; Query time: 63 msec
;; SERVER: 202.103.44.150#53(202.103.44.150)
;; WHEN: Thu Jun 23 15:11:06 CST 2022
;; MSG SIZE  rcvd: 264
```
可以看到 baidu.com 一共有 5 个 NS 解析结果，分别是`ns7.baidu.com, ns4.baidu.com, ns2.baidu.com, ns3.baidu.com, dns.baidu.com`。    

`注意：` 输入 dig ns www.baidu.com 是查询不出 NS 任何记录的，原因在于只有一级域名（或者顶级域名）才有 NS 记录  

## PTR记录  
PTR记录用于从IP地址反查域名。dig命令的-x参数用于查询PTR记录  
```
dig -x 192.30.252.153
``` 
执行结果：  
```
; <<>> DiG 9.10.6 <<>> -x 192.30.252.153
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 60337
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 4, ADDITIONAL: 9

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;153.252.30.192.in-addr.arpa.	IN	PTR

;; ANSWER SECTION:
153.252.30.192.in-addr.arpa. 3315 IN	PTR	lb-192-30-252-153-iad.github.com.

;; AUTHORITY SECTION:
252.30.192.in-addr.arpa. 84850	IN	NS	dns4.p04.nsone.net.
252.30.192.in-addr.arpa. 84850	IN	NS	dns1.p04.nsone.net.
252.30.192.in-addr.arpa. 84850	IN	NS	dns3.p04.nsone.net.
252.30.192.in-addr.arpa. 84850	IN	NS	dns2.p04.nsone.net.

;; ADDITIONAL SECTION:
dns2.p04.nsone.net.	25847	IN	A	198.51.45.4
dns1.p04.nsone.net.	63437	IN	A	198.51.44.4
dns4.p04.nsone.net.	84396	IN	A	198.51.45.68
dns3.p04.nsone.net.	82499	IN	A	198.51.44.68
dns2.p04.nsone.net.	25847	IN	AAAA	2a00:edc0:6259:7:4::2
dns1.p04.nsone.net.	63437	IN	AAAA	2620:4d:4000:6259:7:4:0:1
dns4.p04.nsone.net.	156670	IN	AAAA	2a00:edc0:6259:7:4::4
dns3.p04.nsone.net.	63381	IN	AAAA	2620:4d:4000:6259:7:4:0:3

;; Query time: 6 msec
;; SERVER: 202.103.24.68#53(202.103.24.68)
;; WHEN: Thu Jun 23 15:36:09 CST 2022
;; MSG SIZE  rcvd: 367
```
上面我们查询 192.30.252.153 对应的域名，其查询结果表明该 IP 对应的域名为：lb-192-30-252-153-iad.github.com.，其是一个 github 的二级域名

## SOA记录  
SOA(start of authority)授权机构记录，记录ns中哪个是主服务器  
在之前的NS查询里，展示了5个可以解析baidu.com下子域名的服务器。通过SOA可以查询哪个是授权机构的主服务器。
```
dig soa baidu.com  
```  
执行结果如下：  
```
; <<>> DiG 9.10.6 <<>> soa baidu.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 21089
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 5, ADDITIONAL: 8

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;baidu.com.			IN	SOA

;; ANSWER SECTION:
baidu.com.		7200	IN	SOA	dns.baidu.com. sa.baidu.com. 2012145453 300 300 2592000 7200

;; AUTHORITY SECTION:
baidu.com.		86400	IN	NS	ns4.baidu.com.
baidu.com.		86400	IN	NS	ns3.baidu.com.
baidu.com.		86400	IN	NS	ns2.baidu.com.
baidu.com.		86400	IN	NS	dns.baidu.com.
baidu.com.		86400	IN	NS	ns7.baidu.com.

;; ADDITIONAL SECTION:
ns4.baidu.com.		18641	IN	A	14.215.178.80
ns3.baidu.com.		172557	IN	A	112.80.248.64
ns2.baidu.com.		13311	IN	A	220.181.33.31
ns7.baidu.com.		36186	IN	A	180.76.76.92
dns.baidu.com.		460	IN	A	110.242.68.134
ns7.baidu.com.		40946	IN	AAAA	240e:940:603:4:0:ff:b01b:589a
ns7.baidu.com.		40946	IN	AAAA	240e:bf:b801:1002:0:ff:b024:26de

;; Query time: 41 msec
;; SERVER: 202.103.24.68#53(202.103.24.68)
;; WHEN: Thu Jun 23 15:47:44 CST 2022
;; MSG SIZE  rcvd: 303
```

## 查看DNS服务器的主从关系
在上面的dig命令我们可以看到，在解析一个域名的时候，往往会发现有多个DNS服务器提供解析服务，这是因为DNS服务器要求一般至少有两个，以防发生服务器宕机无法提供域名解析的情况。那么多个服务器，谁来响应这个DNS请求呢？这就要看服务器管理者怎么设置各个服务器的主从关系（Master-Slave）了，通过dig命令也可以查看DNS服务器的主从关系   
```
dig -t soa www.baidu.com
```
执行结果如下：  
![执行结果](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2a45d7e70e0942e482a2be86c9a5d676~tplv-k3u1fbpfcp-zoom-1.image)      
SOA(start of authority)提供了DNS主服务器的相关信息，在`soa`之后我们可以看到7个参数，依次是：
1. DNS主服务器名； 
2. 管理员的E-mail，这里是baidu.dns.master@baidu.com，由于@在数据库文件里有特殊作用，所以这里是用.代替的；  
3. 更新序号。表示数据库文件的新旧，一般是用时间来表示，这里2206230007表示的是2022年6月23日进行了一次更新，当天更新编号0007；  
4. 更新频率。 表示每5秒，slave服务器就要向master服务器索取更新信息；  
5. 失败重试时间，当某些原因导致Slave服务器无法向master服务器索取信息时，会隔5秒就重试一次；  
6. 失效时间。如果一直重试失败，当重试时间累积达到2592000秒时，不再向主服务器索取信息； 
7. 缓存时间。默认的TTL缓存时间  
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0ceea3e4f3bb437a95aab6d4e5490d43~tplv-k3u1fbpfcp-zoom-1.image)  


# 参考资料   
[DNS 原理入门---阮一峰](http://ruanyifeng.com/blog/2016/06/dns.html)  
[https://blog.csdn.net/a583929112/article/details/66499771](https://blog.csdn.net/a583929112/article/details/66499771)  
[https://www.jianshu.com/p/813918846788](https://www.jianshu.com/p/813918846788)    