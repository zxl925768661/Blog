var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/', function(req, res, next) {
    // var url = req.query.url;
    var options = {
        method: 'GET',
        url: 'https://tiebapic.baidu.com/forum/w%3D580%3B/sign=f88eb0f2cf82b9013dadc33b43b6ab77/562c11dfa9ec8a135455cc35b203918fa1ecc09c.jpg',
        headers: {
            'Referer': '',
        }
    };
    request(options).pipe(res)
    
});

module.exports = router;