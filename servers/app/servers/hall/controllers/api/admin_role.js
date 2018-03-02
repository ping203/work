const logicResponse = require('../../../common/logicResponse');

exports.add = _add;
exports.delete = _delete;
exports.valid = _valid;
exports.edit = _edit;

function _add(data) {
    return new Promise(function(resolve, reject){
        myDao.addRole(data, function(err, rows) {
            if(err){
                logger.error('添加角色 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows));
        });
    });
}

async function _delete(data) {
    return new Promise(function(resolve, reject){
        myDao.deleteRole(data, function(err, rows) {
            if(err){
                logger.error('禁止角色 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows));
        });
    });
}

async function _valid(data) {
    return new Promise(function(resolve, reject){
        myDao.validRole(data, function(err, rows) {
            if(err){
                logger.error('激活角色 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows));
        });
    });
}

async function _edit(data) {
    return new Promise(function(resolve, reject){
        myDao.editRole(data, function(err, rows) {
            if(err){
                logger.error('修改角色 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows));
        });
    });
}