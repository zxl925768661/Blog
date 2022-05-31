const http = require('http');
http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain',  'Content-Length': 10});
    res.end("hello world!");
}).listen(3000);