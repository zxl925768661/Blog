#  X-Frame-Options  
X-Frame-Options  响应头是用来给浏览器指示允许一个页面 可否在 \<frame>\,\<iframe>,\<embed> 或者\<object> 中展现的标记。站点可以通过确保网站没有被嵌入到别人的站点里面，从而避免点击劫持攻击。  

## 功能
防御点击劫持。如果恶意的站点将你的网页嵌入iframe标签中，然后诱使用户在该站点上进行操作，此时用户将在不知情的情况下点击透明的iframe页面，从而诱使用户恰好点击在iframe页面的一些功能性按钮上，这样就完成了点击劫持的攻击。  

## 语法  
```
X-Frame-Options: deny  // 表示该页面不允许在frame中展示，即便是在相同域名的页面中嵌套也不允许
X-Frame-Options: sameorigin  // 表示该页面可以在相同域名页面的 frame 中展示
X-Frame-Options: allow-from https://example.com/   // 表示该页面可以在指定来源的 frame 中展示
```