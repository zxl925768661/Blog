const http = require("http");

const server1 = http
  .createServer(function (req, res) {
    console.log("Request for: " + req.url + "--port 8000");
    res.writeHead(200, {
      "Content-Type": "text/plain",
    });
    res.end("hello world!");
  })
  .listen(8000, "127.0.0.1");

  
const server2 = http
  .createServer(function (req, res) {
    console.log("Request for: " + req.url + "--port 8001");
    res.writeHead(200, {
      "Content-Type": "text/plain",
    });
    // 模拟延迟响应
    setTimeout(()=> {
      res.end("hello world!"); 
    },5 * 1000);
    
  })
  .listen(8001, "127.0.0.1");

server1.once("listening", () => {
  console.log("Server running at http://127.0.0.1:8000/");
});

server2.once("listening", () => {
  console.log("Server running at http://127.0.0.1:8001/");
});
