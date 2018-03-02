const data_util = require('../data/data_util');
const CacheAccount = require('../../src/buzz/cache/CacheAccount');
const DaoAccount = require('../../src/dao/dao_account');
const logicResponse = require('../../../common/logicResponse');

const TAG = "【admin_server】";

exports.countAccount = countAccount;
exports.listAccount = listAccount;
exports.saveAccount = saveAccount;

function countAccount(req, res) {
    const FUNC = TAG + "countAccount() --- ";
    const HINT = "返回缓存中的用户数量";
    console.log(FUNC + "CALL...");

    _checkAdmin(function () {
        let ret = {
            account_count: CacheAccount.length(),
        }
        data_util.handleReturn(res, false, null, ret, HINT);
    });
}

////////////////////////////////////////
function listAccount(req, res) {
    const FUNC = TAG + "listAccount() --- ";
    const HINT = "返回缓存中所有用户列表";
    console.log(FUNC + "CALL...");

    _checkAdmin(function () {
        let ret = {
            account_list: CacheAccount.uid_list(),
        }
        data_util.handleReturn(res, false, null, ret, HINT);
    });
}

////////////////////////////////////////
function saveAccount(req, res) {
    const FUNC = TAG + "saveAccount() --- ";
    const HINT = "保存所有玩家信息到数据库";
    console.log(FUNC + "CALL...");

    _checkAdmin(function () {
        DaoAccount.updateDb(req.pool, function (err, results) {
            if (err) {
                console.error(FUNC + "err:", err);
                data_util.handleReturn(res, false, err, null, HINT);
                return;
            }
            let ret = {status: "success"};
            data_util.handleReturn(res, false, null, ret, HINT);
        });
    });
}


// TODO: 验证管理员身份
function _checkAdmin(cb) {
    cb();
}