var fs = require("fs");
var tls = require("tls");
var options = {
  host: 'dev.test.com',
  key: fs.readFileSync("./keys/client.key"),
  cert: fs.readFileSync("./keys/client.crt"),
  ca: [fs.readFileSync("../ca/ca.crt")],
  rejectUnauthorized: true
};
var stream = tls.connect(8000, options, function () {
  console.log("client connected",stream.authorized ? "authorized" : "unauthorized");
  process.stdin.pipe(stream);
});
stream.setEncoding("utf8");
stream.on("data", function (data) {
  console.log(data);
});
stream.on("end", function () {
  server.close();
});
