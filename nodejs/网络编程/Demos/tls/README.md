# 生成私钥
Node在底层采用的是openssl实现TLS/SSL的，为此要生成公钥和私钥可以通过openssl完成。 
```
// 生成服务器端私钥   
openssl genrsa -out server/keys/server.key 1024   
// 生成客户端私钥  
openssl genrsa -out client/keys/client.key 1024
```
# 生成公钥  
上述命令生成了两个1024位长的RSA私钥文件，我们可以通过它继续生成公钥，如下：  
```
openssl rsa -in server/keys/server.key -pubout -out server/keys/server.pem
openssl rsa -in client/keys/client.key -pubout -out client/keys/client.pem
```
# 数字证书
为了得到签名证书，服务器端需要通过自己的私钥生成CSR(Certificate Signing Request，证书签名请求)文件。CA机构通过这个文件颁发属于该服务器端的签名证书，只要通过CA机构就能验证证书是否合法。  
下面用自签名证书来构建安全网络的。所谓自签名证书，就是自己扮演CA机构，给自己得服务器端颁发签名证书。以下为生成私钥、生成CSR文件、通过私钥自签名生成证书得过程：
```
openssl genrsa -out ca/ca.key 1024
// 生成CSR文件
openssl req -new -key ca/ca.key -out ca/ca.csr
openssl x509 -req -in ca/ca.csr -signkey ca/ca.key -out ca/ca.crt

```

生成带有CA签名的证书  
```
// 生成CSR文件
openssl req -new -key server/keys/server.key -out server/keys/server.csr  # Common Name 可填写为 dev.test.com
// 签名过程需要CA的证书和私钥参与， 最终颁发一个带有CA签名的证书
openssl x509 -req -CA ca/ca.crt -CAkey ca/ca.key -CAcreateserial -in server/keys/server.csr -out server/keys/server.crt

// 客户端生成属于自己的签名
// 生成CSR文件
openssl req -new -key client/keys/client.key -out client/keys/client.csr  # Common Name 可填写为 dev.test.com
// 签名过程需要CA的证书和私钥参与， 最终颁发一个带有CA签名的证书
openssl x509 -req -CA ca/ca.crt -CAkey ca/ca.key -CAcreateserial -in client/keys/client.csr -out client/keys/client.crt
```

# 解决“您的连接不是私密连接”
提示：由于我们使用了自签名的证书，访问页面时可能会看到浏览器的证书警告，可能需要手动点击信任当前证书，或者手动点击链接确认访问该页面。   

例如Chrome 会提醒“您的连接不是私密连接”，并禁止你访问。你可以直接在当前页面输入 thisisunsafe，不是在地址栏输入，而是直接敲击键盘输入，页面会自动刷新进入网页。   