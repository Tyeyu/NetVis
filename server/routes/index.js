var express = require('express');
var router = express.Router();
var path = require('path')
var fs = require('fs')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/parallel_test_data", function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  let file = path.join(__dirname, "../public/nf_test.json"); //文件路径，__dirname为当前运行js文件的目录
  //读取json文件
  fs.readFile(file, "utf-8", function(err, data) {
    if (err) {
      res.send("文件读取失败");
    } else {
      res.send(data);
    }
  });
});

module.exports = router;
