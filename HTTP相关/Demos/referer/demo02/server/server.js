let http = require("http");
let fs = require("fs");
let url = require("url");
let path = require("path");
// 白名单
const whiteList = [];

/**
 * 三种情况下允许引用图片：
 * 1. 本网站
 * 2. 无referer信息的情况。（服务器认为是从浏览器直接访问的图片URL，所以这种情况下能正常访问）
 * 3. 授权的网址。(配置白名单)
 */

http
  .createServer(function (req, res) {

    let refer = req.headers["referer"] || req.headers["refer"];
    console.log('refer----', refer, req.url);
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (refer) {
      let referHostName = url.parse(refer, true).host;
      let currentHostName = url.parse(req.url, true).host;
      console.log(referHostName, currentHostName, '--==')
      // 当referer不为空, 但host未能命中目标网站且不在白名单内时, 返回错误的图
      if (
        referHostName != currentHostName &&
        whiteList.indexOf(referHostName) == -1
      ) {
        res.setHeader("Content-Type", "image/jpeg");
        fs.createReadStream(path.join(__dirname, "/src/img/403.jpg")).pipe(res);
        return;
      }
    }
    // 当referer为空时, 返回正确的图
    res.setHeader("Content-Type", "image/jpeg");
    fs.createReadStream(path.join(__dirname, "/src/img/1.jpg")).pipe(res);
    
  })
  .listen(9999);
