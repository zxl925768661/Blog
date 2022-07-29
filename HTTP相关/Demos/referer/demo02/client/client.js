let http = require("http");
let fs = require("fs");
let url = require("url");
let path = require("path");

// 创建服务器
http.createServer(function (req, res) {
  let staticPath = path.join(__dirname, "src");
  let pathObj = url.parse(req.url, true);

  if (pathObj.pathname === "/") {
    pathObj.pathname += "index.html";
  }
  //  读取静态目录里面的文件，然后发送出去
  let filePath = path.join(staticPath, pathObj.pathname);
  fs.readFile(filePath, "binary", function (err, content) {
    if (err) {
      res.writeHead(404, "Not Found");
      res.end("<h1>404 Not Found</h1>");
    } else {
      // res.writeHead(200, "OK");
      res.writeHead(200, { 'Content-Length': content.length, 'Transfer-Encoding': 'chunk'});
      res.write(content, "binary");
      res.end();
    }
  });
}).listen(8080);
