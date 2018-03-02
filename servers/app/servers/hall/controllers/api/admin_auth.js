const logicResponse = require('../../../common/logicResponse');

exports.add = _add;
exports.delete = _delete;
exports.valid = _valid;
exports.edit = _edit;

async function _add(data) {
    return new Promise(function(resolve, reject){
        myDao.addAuth(data, function (err, rows) {
            if(err){
                logger.error('添加权限 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows));
        });
    });
}

async function _delete(data) {
    return new Promise(function(resolve, reject){
        myDao.deleteAuth(data, function (err, rows) {
            if(err){
                logger.error('禁止权限 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows));
        });
    });
}

function _valid(data) {
    return new Promise(function(resolve, reject){
        myDao.validAuth(data, function (err, rows) {
            if(err){
                logger.error('激活权限 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows));
        });
    });
}

function _edit(data) {
    return new Promise(function(resolve, reject){
        myDao.editAuth(data, function (err, rows) {
            if(err){
                logger.error('修改权限 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows));
        });
    });
}