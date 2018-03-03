const CacheAccount = require('../../src/buzz/cache/CacheAccount');
const DaoAccount = require('../../src/dao/dao_account');
const logicResponse = require('../../../common/logicResponse');

exports.countAccount = countAccount;
exports.listAccount = listAccount;
exports.saveAccount = saveAccount;

async function countAccount(data) {
    return new Promise(function (resolve, reject) {
        _checkAdmin(function () {
            let ret = {
                account_count: CacheAccount.length(),
            }
            resolve(logicResponse.ask(ret));
        });
    });
}

async function listAccount(data) {
    return new Promise(function (resolve, reject) {
        _checkAdmin(function () {
            let ret = {
                account_list: CacheAccount.uid_list(),
            }
            resolve(logicResponse.ask(ret));
        });
    });
}

async function saveAccount(data) {
    return new Promise(function(resolve, reject){
        _checkAdmin(function () {
            DaoAccount.updateDb({pool:mysqlPool}, function (err, results) {
                if (err) {
                    logger.error('保存所有玩家信息到数据库:', err);
                    reject(err);
                    return;
                }
                let ret = {
                    status: "success"
                };
                resolve(logicResponse.ask(ret));
            });
        });
    });
}

// TODO: 验证管理员身份
function _checkAdmin(cb) {
    cb();
}