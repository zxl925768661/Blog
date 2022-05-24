const http = require("http");
http.createServer(function (req, res) {
    // res.setHeader('Content-Type', 'text/html');
    // // 会替换之前的设置
    // res.setHeader('Content-Type', 'text/plain');
    // res.setHeader('X-Foo', 'bar');
    // res.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);
    res.end("Hello World\n");
    res.writeHead(200, 'success', { "Content-Type": "text/plain", "X-Foo": "bar" });
    
}).listen(1337, "127.0.0.1");
console.log("Server running at http://127.0.0.1:1337/");
