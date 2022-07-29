var http = require("http");
var agent = new http.Agent();
const agent = new http.Agent({ keepAlive: true, maxSockets: 3 });
var options = {
  host: "127.0.0.1",
  port: "8889",
  path: "/",
  method: "POST",
//   agent: agent,
};
post = function (options, content, callback) {
  req = http
    .request(options, function (res) {
      var data = "";
      res.on("data", function (chunk) {
        return (data += chunk);
      });
      return res.on("end", function () {
        return callback(null, data);
      });
    })
    .on("error", function (e) {
      return callback(e, null);
    });
  req.write(content);
  req.end();
};
var jsonData = { name: "sonoo", salary: 5600, married: true };
var content = JSON.stringify(jsonData);
http
  .createServer(function (req, res) {
    post(options, content, function (err, data) {
      res.end(data);
    });
  })
  .listen(8888);
