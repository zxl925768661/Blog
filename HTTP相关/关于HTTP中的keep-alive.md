# 1.HTTP中的keep-alive
既然上面提到了HTTP是基于请求与响应的，且最主要的两个特点就是无连接和无状态，但需要说明的是，虽然是无连接的，但其底层也就是传输层大多却是基于 TCP面向连接的通信方式，因此，这里的无连接指的是：当server端和client端进行通讯的时候，client端向server端发起请 求，server端接收请求之后返回给client端一个响应，之后就会断开不再继续保持连接了；这样有一个好处就是对于只有一次访问的连接来说不仅节省 资源还很高效，但很明显，如果client端还想继续多次访问server端就需要重新建立连接也就是会多次进行TCP的“三次握手，四次挥手”的过程， 这样一来并没有节省资源而且还很低效，因此使用keep-alive（又称持久连接、连接重用）可以改善这种状态，即在一次TCP连接中可以持续发送多份数据而不会断开连接。通过使用keep-alive机制，避免了建立或者重新建立连接的次数，也意味着可以减少TIME_WAIT状态连接，以此提高性能和提高http服务器的吞吐率(更少的TCP连接意味着更少的系统内核调用,socket的accept()和close()调用)。

HTTP 1.0 中keep-alive默认是关闭的，需要在HTTP头加入"Connection: Keep-Alive"，才能启用Keep-Alive；HTTP 1.1中默认启用Keep-Alive，如果加入"Connection: close "，才关闭。目前大部分浏览器都是用HTTP 1.1协议，也就是说默认都会发起Keep-Alive的连接请求了，所以是否能完成一个完整的Keep- Alive连接就看服务器设置情况。

# 2.keep-alive 的缺点
keep-alive并不是免费的午餐，长时间的TCP连接容易导致系统资源无效占用，配置不当的keep-alive 有时比重复利用连接带来的损失还更大；因此，正确地设置keep-alive timeout时间非常重要。
httpd守护进程一般都提供了keep-alive timeout时间设置参数，比如nginx的keepalive_timeout和Apache的keepalivetimeout。这个 keepalive_timeout时间值意味着：一个http产生的TCP连接在传送完最后一个响应后，还需要保持keepalive_timeout 时间后才开始关闭这个连接；如果在这个时间内client端还有请求发过来，那么server端会继续给予响应，如果keepalive_timeout时间计时结束后，就会进入TCP释放连接的解读那，因此也就会结束掉这次的通信。
** http守护进程**:如果客户端长时间没有发起请求，网关长时间得到响应时，就会默认此次的连接已经完成，从而断开，那么下次的连接还要重新进行TCP的连接，所以为了维持这样的状态，服务器会开启一个http进程来维持该连接。

# 3.keep-alive的正确使用
虽然说keep-alive模式可以降低TCP连接的次数提高效率，但并不是什么情况下都适合使用keep-alive机制的，举个例子：
keep-alive适用情况：
比如很多网页中的图片，CSS,JS,HTML都在一台服务器上，当用户访问网页时，网页中的图片，CSS,JS都会发起访问请求，打开Keep-alive属性可以有效降低TCP握手的次数（当然浏览器同一域下同时请求的图片数有限制，一般是2，这个是关于浏览器并发请求的问题我们在下一篇中讲）。
keep-alive的限制:
当然keep-alive的使用并不是没有限制的，其中有两个属性：MaxKeepAliveRequest和KeepAliveTimeOut两个属性分别表示持久连接的连接的生存时间和最大服务请求数。
keep-alive不适用情况：
上面说的是一个清形，静态网页局居多的情况下，并且网页中其他请求与网页在同一台Server上。当你的应用动态程序居多（一句话：就是服务器的工作量比较大，cpu等开销很大的时候），用户访问时you动态程序即使申城html内容，html内容中图片素材和Css，JS等比较少（意思就是请求数其实不是很多的情况），此时开启keep-alive反而会降服务器的性能。为什么呢？
这个主要原因就是我们上面所提到的一个概念http守护进程,每当开启Keep-alive，打开一个TCP连接，以便能够在一次连接中响应多个静态资源，但是一方面上面的情况是我们访问的静态资源少，而且为了维护此次连接，服务器必须开启一个http守护进程，再加上服务器还有动态生成html，这样给服务器的压力是很大的。
假如这个时候有100个用户访问服务器，且每个用户的MaxKeepAliveRequests=5(也就是浏览器的请求并发数是5)，，此时需要的http守护进程数就是1005=500个，一个http守护进程消耗是5MB内存的话，就是5005=2500MB=2.5G。这内存的消耗也太大了。这还是只有100个用户，TCP连接是100的情况。

# 4.总结：
当你的Server内存充足时，KeepAlive=On还是Off对系统性能影响不大；
当你的Server上静态网页(Html、图片、Css、Js)居多时，建议打开KeepAlive；

当你的Server多为动态请求(因为连接数据库，对文件系统访问较多)，KeepAlive关掉，会节省一定的内存，节省的内存正好可以作为文件系统的Cache(vmstat命令中cache一列)，降低I/O压力；

PS：当KeepAlive=On时，KeepAliveTimeOut的设置其实也是一个问题，设置的过短，会导致Apache频繁建立连接，给Cpu造成压力，设置的过长，系统中就会堆积无用的Http连接，消耗掉大量内存，具体设置多少，可以进行不断的调节，因你的网站浏览和服务器配置而异。