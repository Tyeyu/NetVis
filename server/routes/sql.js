var user = {
    insert:'INSERT INTO user(id, name, age) VALUES(?,?,?)',
    update:'UPDATE user SET name=?, age=? WHERE id=?',
    delete: 'DELETE FROM user WHERE id=?',
    queryById: 'SELECT * FROM user WHERE id=?',
    queryAll: "SELECT * FROM ipPair ",
    queryIPS: 'select * from ips_data',
    queryNF: 'select * from nf_data',
};
module.exports = user;
