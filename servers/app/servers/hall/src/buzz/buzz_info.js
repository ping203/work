const BuzzUtil = require('../utils/BuzzUtil');
const RedisUtil = require('../utils/RedisUtil');
const redisKeys = require('../../../../database').dbConsts.REDISKEY;
const ItemTypeC = require('./pojo/Item').ItemTypeC;
const buzz_limit_items = require('../buzz/buzz_limit_items');
const DaoCommon = require('../dao/dao_common');
const logger = loggerEx(__filename);
const TAG = "【buzz_info】";

exports.getHuafeiquan = getHuafeiquan;

/**
 * 获取限时道具领取时间戳
 */
exports.getItemLimitGotTime = function (req, dataObj, cb) {
    if (!BuzzUtil.checkParams(dataObj, ['token'], "buzz_info", cb)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_item_limit_got_time");
    let token = dataObj.token;
    let pool = req.pool;
    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        let id = account.id;
        if (id) {
            buzz_limit_items.checkItemLimitEnd(account, function (res) {
                if (!res) {
                    cb && cb('尚无限时道具');
                }else{
                    cb && cb(null, res);
                }
            });
        }else{
            cb('用户校验失败');
        }
    });
};

/**
 * 获取指定限时道具剩余时长
 */
exports.getItemLimitTime = function (req, dataObj, cb) {
    if (!BuzzUtil.checkParams(dataObj, ['token'], "buzz_info", cb)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_item_limit_time");
    let token = dataObj.token;
    let itemId = dataObj.itemId;
    let gotAt = dataObj.gotAt;
    let pool = req.pool;
    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        let id = account.id;
        if (id) {
            buzz_limit_items.getLimitLeft(id, itemId, gotAt, function (left) {
                if (left == -1) {
                    cb && cb('不是限时道具');
                }else if (left == -2) {
                    cb && cb('时间戳有误');
                }else if (left == -3) {
                    cb && cb('道具不存在');
                }else{
                    cb && cb(null, {itemId: itemId, ltime: left});
                }
            });
        }else{
            cb('用户校验失败');
        }
    });
};

/**
 * 获取喇叭使用个数、收到鲜花数量
 */
exports.getHornFlower = function (req, dataObj, cb) {
    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_info", cb);
    }

    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_horn_flower");

    let token = dataObj.token;
    let pool = req.pool;
    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        let id = account.id;
        if (id) {
            let flowerC = 0;
            let hornC = 0;
            let tmp = [
                ['hget', redisKeys.FLOWER_RECEIVE, id],
                ['hget', redisKeys.HORN_USED, id],
            ];
            RedisUtil.multi(tmp, function (err, ret) {
                if (ret && ret.length == tmp.length) {
                    flowerC = parseInt(ret[0]) || 0;
                    hornC = parseInt(ret[1]) || 0;
                    cb && cb(null, {hornC: hornC, flowerC: flowerC});
                }else{
                    cb(err);
                }
            });
        }else{
            cb(null);
        }
    });
};

/**
 * 获取话费券数量.
 */
function getHuafeiquan(dataObj, cb) {
    const FUNC = TAG + "getHuafeiquan() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_huafeiquan");

    _getHuafeiquan(dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_info", cb);
    }
}

//==============================================================================
// private
//==============================================================================

/**
 * 获取话费券数量.
 */
function _getHuafeiquan(dataObj, cb) {
    const FUNC = TAG + "_getHuafeiquan() --- ";
    let uid = dataObj.uid;
    let token = dataObj.token;
    DaoCommon.checkAccount(mysqlConnector, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        if (!_checkGetHuafeiquan1()) return;

        let num = getHuafeiquanFromPack(account.package);
        logger.info(FUNC + "num:", num);

        let ret = {
            change:{
                package: {
                    "9":{
                        "i003": num,
                    },
                },
            },
        };
        cb(null, ret);

        // 校验方法1
        function _checkGetHuafeiquan1() {

            return true;
        }
    }
  
}

//==============================================================================
// private common
//==============================================================================

function getHuafeiquanFromPack(pack) {
    if ("undefined" == typeof(pack[ItemTypeC.TOKENS])) {
        pack[ItemTypeC.TOKENS] = {};
    }
    if ("undefined" == typeof(pack[ItemTypeC.TOKENS]["i003"])) {
        pack[ItemTypeC.TOKENS]["i003"] = 0;
    }
    return pack[ItemTypeC.TOKENS]["i003"];
}
