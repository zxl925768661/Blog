const http = require("http");

const server = http.createServer(function (req, res) {
    const responseText = "hello world!";
    // res.writeHead(200, {
    //   "Content-Type": "text/plain",
    //   "Content-Length": 12,
      
    // });
    res.writeHead(200, { 'Content-Type': 'text/plain',  'Content-Length': responseText.length, 'Transfer-Encoding': 'chunk'});
    res.end(responseText);
  })
  .listen(3000);
 
