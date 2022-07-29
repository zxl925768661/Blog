一、为什么要使用rel='noopener'？
先举个栗子
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <a href="b.html" target="_blank">da</a>
</body>
</html>
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <SCRIPT>window.opener.location.href ="http://google.com"</SCRIPT>
</body>
</html>
```

其中在a.html中有个超链接，点击后打开新的tab页，神奇的发现原tab页已经变成了谷歌页面。原因是使用target=_blank打开新的窗口时，赋予了新的窗口一些权限可以操作原tab页，其中window.location就是一个。不使用 rel=noopener就是让用户暴露在钓鱼攻击上。  
![window.opener](https://upload-images.jianshu.io/upload_images/4952742-00276bd78b9f2a02.png?imageMogr2/auto-orient/strip|imageView2/2/w/887/format/webp)    


二、使用rel=noopener
为了防止window.opener被滥用，在使用targrt=_blank时需要加上rel=noopener
<a href="www.baidu.com" target="_blank" rel="noopener" >

三、rel=norefferrer
rel=noopener支持chrome49和opera36，不支持火狐，为了兼容需要加上rel=noreferrer
<a href="www.baidu.com" target="_blank" rel="noopener norefferrer" >

四、eslint提示  

![eslint提示](https://upload-images.jianshu.io/upload_images/4952742-9e97262dce7d144d.png?imageMogr2/auto-orient/strip|imageView2/2/w/755/format/webp)  

eslint提示后根据文档实际尝试了一下，之前忽略的小问题居然还有这么大安全问题，网络安全不可小觑。

参考文章：eslint提示的官方文档
https://mathiasbynens.github.io/rel-noopener/#hax 


作者：芒果加奶
链接：https://www.jianshu.com/p/c8319e095474
来源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。