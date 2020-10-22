// 引入mysql
var mysql = require('mysql');
// 引入mysql连接配置
var mysqlconfig = require('./mysql');
// 引入连接池配置
var poolextend = require('./poolextent');
// 引入SQL模块
var sql = require('./sql');
// 引入json模块
var json = require('./json');
// 使用连接池，提升性能
var pool = mysql.createPool(poolextend({}, mysqlconfig));
var userData = {
    queryAll: function(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");
        pool.getConnection(function(err, connection) {
            let pa=req.query;
            let sql_="where time>= '"+pa.start+"' and time<= '"+pa.end+"'"
            connection.query(sql.queryAll+sql_, function(err, result) {
                if (result != '') {
                    var _result = result;
                    result = {
                        result: 'selectall',
                        data: _result
                    }
                } else {
                    result = undefined;
                }
                // console.log(result)
                json(res, result);
                connection.release();
            });
        });
    }
};
module.exports = userData;