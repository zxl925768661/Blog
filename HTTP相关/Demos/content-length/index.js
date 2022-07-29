const http = require('http');
const server = http.createServer(function(req, res) {
    let length = req.headers['content-length'] || 8;
    res.writeHead(200, { 'Content-Type': 'text/plain',  'Content-Length': length});
    // res.writeHead(200, { 'Content-Type': 'text/plain'});
    res.end("hello world!");
}).listen(3000);

server.maxRequestsPerSocket = 1;
server.setTimeout(10 * 1000);