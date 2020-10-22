var express = require('express');
var router = express.Router();
var user = require('./handel');
router.get('/queryAll', function(req, res, next) {
    console.log(req.query);
    user.queryAll(req, res, next);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  user.queryAll(req, res, next);
  // res.render('index', { title: 'Express' });
});


module.exports = router;
