var json = function(res, result) {
    if (result.result != 'undefined' && result.result === 'selectall') {
        res.json({
            code: '200',
            msg: '全部查找成功',
            data: result.data
        });
    } else {
        res.json(result);
    }
};
module.exports = json;