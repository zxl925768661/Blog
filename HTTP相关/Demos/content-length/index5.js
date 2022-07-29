const http = require("http");

http
  .createServer(function (req, res) {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      // "Content-Length": 12,
      // "Transfer-Encoding": "chunked",
    });
    res.write("第一次传输!");
    setTimeout(() => {
      res.write("第二次传输!");
    }, 1000);
    setTimeout(() => {
      res.end("第三次传输!");
    }, 2000);
  })
  .listen(3000);
