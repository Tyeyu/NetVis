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
    },
    queryTest:(req,res)=>{
        pool.getConnection((err, connection)=> {
            connection.query(`${sql.queryNF} where parsedDate >= '2013-04-14 02:12:00' and parsedDate >= '2013-04-14 02:12:26'`, function(err, nf_data) {
                connection.query(`${sql.queryIPS} where dateTime >= '2013-04-14 02:12:00' and dateTime >= '2013-04-14 02:12:26'`, function(err, ips_data) {
                    nf_data = nf_data.map(d => {
                        return {
                            SrcIp: d.firstSeenSrcIp,
                            dateTime: (d.parsedDate).slice(0,19),
                            srcPort: parseInt(d.firstSeenSrcPort),
                            destPort: parseInt(d.firstSeenDestPort),
                            destIp: d.firstSeenDestIp,
                            durationSeconds:d.durationSeconds,
                            srcPayloadBytes:d.firstSeenSrcPayloadBytes,
                            destPayloadBytes:d.firstSeenDestPayloadBytes,
                            srcTotalBytes:d.firstSeenSrcTotalBytes,
                            destTotalBytes:d.firstSeenDestTotalBytes,
                            srcPacketCount:d.firstSeenSrcPacketCount,
                            destPacketCount:d.firstSeenDestPacketCount,
                            ips:false
                        }
                    });
                    ips_data = ips_data.map(d => {
                        return {
                            SrcIp: d.SrcIp,
                            dateTime: (d.dateTime).slice(0,19),
                            srcPort: parseInt(d.srcPort),
                            destPort: parseInt(d.destPort),
                            destIp: d.destIp,
                        }
                    });

                    nf_data.forEach(d=>{
                        d.ips = ips_data.findIndex(s => s.SrcIp === d.SrcIp && s.destIp === d.destIp) !== -1;
                    })

                    res(nf_data)
                    connection.release();

                })
            });

        });
    }
};
module.exports = userData;
