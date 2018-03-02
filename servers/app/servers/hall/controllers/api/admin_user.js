const logicResponse = require('../../../common/logicResponse');

exports.add = _add;
exports.delete = _delete;
exports.valid = _valid;
exports.edit = _edit;
exports.signin = _signin;

async function _add(data) {
    return new Promise(function (resolve, reject) {
        myDao.addUser(data, function (err, results) {
            if (err) {
                logger.error('添加用户 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

async function _delete(data) {
    return new Promise(function (resolve, reject) {
        myDao.deleteUser(data, function (err, results) {
            if (err) {
                logger.error('禁止用户 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

async function _valid(data) {
    return new Promise(function (resolve, reject) {
        myDao.validUser(data, function (err, results) {
            if (err) {
                logger.error('激活用户 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

async function _edit(data) {
    return new Promise(function (resolve, reject) {
        myDao.editUser(data, function (err, results) {
            if (err) {
                logger.error('修改用户 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

async function _signin(data) {
    return new Promise(function (resolve, reject) {
        myDao.userSignin(data, function (err, results) {
            if (err) {
                logger.error('用户登录 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}