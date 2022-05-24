const https = require("https");
const fs = require("fs");
const options = {
  hostname: "localhost",
  port: 8000,
  path: "/",
  method: "GET",
  rejectUnauthorized: false,
  key: fs.readFileSync("./keys/client.key"),
  cert: fs.readFileSync("./keys/client.crt"),
  ca: [fs.readFileSync("../ca/ca.crt")],
};
options.agent = new https.Agent(options);
const req = https.request(options, function (res) {
  res.setEncoding("utf-8");
  res.on("data", function (d) {
    console.log(d);
  });
});
req.end();
req.on("error", function (e) {
  console.log(e);
});
