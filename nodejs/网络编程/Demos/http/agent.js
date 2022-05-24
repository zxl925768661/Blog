const http = require("http");
const agent = new http.Agent();
const options = { hostname: "127.0.0.1", port: 1337, path: "/",agent: agent };
const req = http.request(options, function (res) {
  console.log("STATUS: " + res.statusCode);
  console.log("HEADERS: " + JSON.stringify(res.headers));
  res.setEncoding("utf8");
  res.on("data", function (chunk) {
    console.log(chunk);
  });
});
req.end();
