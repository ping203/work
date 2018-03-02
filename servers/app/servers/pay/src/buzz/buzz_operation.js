const _ = require('underscore');
const BuzzUtil = require('../utils/BuzzUtil');
const DaoUtil = require('../utils/DaoUtil');
const RedisUtil = require('../utils/RedisUtil');
const redisKeys = require('../../../../database').dbConsts.REDISKEY;
const redisAccountSync = require('../../../../utils/redisAccountSync');
const CacheOperation = require('./cache/CacheOperation');
const CacheChange = require('./cache/CacheChange');
const CacheAccount = require('./cache/CacheAccount');
const change_change_cfg = require('../../../../utils/imports').GAME_CFGS.change_change_cfg;
const logger = loggerEx(__filename);

let TAG = "【buzz_operation】";

/** 运营操作类型 */
const OP_TYPE = {
    /** 实物兑换 */
    CHANGE_IN_KIND: 1,
    /** 总开关 */
    SWITCH: 2,
};


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getOperationCfgs = getOperationCfgs;
exports.buyCard = buyCard;
exports.modifyCfgs = modifyCfgs;
exports.getChangeOrder = getChangeOrder;
exports.addHuafeiquan = addHuafeiquan;

exports.queryJackpot = queryJackpot;
exports.queryPlayer = queryPlayer;
exports.changeRate = changeRate;
exports.queryProfit = queryProfit;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 运营管理——查询盈亏排行榜.
 */
function queryProfit(req, dataObj, cb) {
    const FUNC = TAG + "queryProfit() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;

    _queryProfit(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ["type"], "buzz_operation.queryProfit", cb);
    }
}

/**
 * 运营管理——查询奖池总览数据.
 */
function queryJackpot(req, dataObj, cb) {
    const FUNC = TAG + "queryJackpot() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;

    _queryJackpot(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, [], "buzz_operation.queryJackpot", cb);
    }
}

/**
 * 运营管理——查询玩家数据.
 */
function queryPlayer(req, dataObj, cb) {
    const FUNC = TAG + "queryPlayer() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;

    _queryPlayer(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['uid'], "buzz_operation.queryPlayer", cb);
    }
}

/**
 * 运营管理——修改捕获率.
 */
function changeRate(req, dataObj, cb) {
    const FUNC = TAG + "changeRate() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;

    _changeRate(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['type', 'rate'], "buzz_operation.changeRate", cb);
    }
}

/**
 * 运营管理——获取运营配置.
 */
function getOperationCfgs(req, dataObj, cb) {
    const FUNC = TAG + "getOperationCfgs() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    // BuzzUtil.cacheLinkDataApi(dataObj, "open_box");

    _getOperationCfgs(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['type'], "buzz_operation", cb);
    }
}

function buyCard(req, dataObj, cb) {
    const FUNC = TAG + "buyCard() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;

    _buyCard(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, [], "buzz_operation", cb);
    }
}

/**
 * 运营管理——修改配置.
 */
function modifyCfgs(req, dataObj, cb) {
    const FUNC = TAG + "modifyCfgs() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    // BuzzUtil.cacheLinkDataApi(dataObj, "open_box");

    _modifyCfgs(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['oid'], "buzz_operation", cb);
    }
}

function getChangeOrder(req, dataObj, cb) {
    const FUNC = TAG + "getChangeOrder() --- ";
    //----------------------------------
    // if (!lPrepare(dataObj)) return;
    // BuzzUtil.cacheLinkDataApi(dataObj, "open_box");

    _getChangeOrder(req, dataObj, cb);

    // function lPrepare(input) {
    //     return BuzzUtil.checkParams(input, ['oid'], "buzz_operation", cb);
    // }
}

function addHuafeiquan(req, dataObj, cb) {
    const FUNC = TAG + "addHuafeiquan() --- ";
    //----------------------------------
    _addHuafeiquan(req, dataObj, cb);
}

//==============================================================================
// private
//==============================================================================

function _queryJackpot(req, dataObj, cb) {
    const FUNC = TAG + "_queryJackpot() --- ";
    //----------------------------------

    DaoUtil.query('tbl_platform', null, null, function (err, res) {
        if (err) return cb(err);
        cb(null, res[0]);
    });
}

function _queryPlayer(req, dataObj, cb) {
    const FUNC = TAG + "_queryPlayer() --- ";
    //----------------------------------

    let uid = dataObj.uid;
    let fields = [
        'id',
        'nickname',
        'recharge',
        'cash',
        'gold',
        'playerCatchRate'
    ];
    redisSync.getAccountById(uid, fields, function (err, account) {
        account = account.toJSON();
        console.log(account);
        if (!account.playerCatchRate) {
            account.playerCatchRate = 1;
        }
        if (!account.cash) {
            account.cash = 0;
        }
        if (!account.recharge) {
            account.recharge = 0;
        }
        cb(null, account);
    });

}

function _queryProfit(req, dataObj, cb) {
    const FUNC = TAG + "_queryPlayer() --- ";
    //----------------------------------

    let type = dataObj.type;
    // cb("接口有待实现");

    let fakeData = [
        { uid: 1, nickname: "fj_1", recharge: 1000, cash: 400, gold: 500, profit: -100, playerCatchRate: 1 },
        { uid: 2, nickname: "fj_2", recharge: 1000, cash: 500, gold: 500, profit: 0, playerCatchRate: 1 },
        { uid: 3, nickname: "fj_3", recharge: 1000, cash: 600, gold: 500, profit: 100, playerCatchRate: 1 },
    ];

    cb(null, fakeData);

}

const CHANGE_RATE_TYPE = {
    JACKPOT: 1,
    PLAYER: 2,
};
function _changeRate(req, dataObj, cb) {
    const FUNC = TAG + "_changeRate() --- ";
    //----------------------------------

    let type = dataObj.type;
    let rate = dataObj.rate / 100;
    if (CHANGE_RATE_TYPE.JACKPOT == type) {
        RedisUtil.set('fishjoy:platformCatchRate', rate, function (err, res) {
            if (err) return cb(err);
            cb(null, "全服命中修正成功");
        });
        // 主动更新MySQL中的值
        DaoUtil.update('tbl_platform', ["platformCatchRate=" + rate], null);
    }
    else if (CHANGE_RATE_TYPE.PLAYER == type) {
        let uid = dataObj.uid;
        RedisUtil.hset('pair:uid:playerCatchRate', uid, rate, function (err, res) {
            if (err) return cb(err);
            cb(null, "玩家捕获率修正成功");
        });
    }
}

////////////////////////////////////////////////////////////
// 获取运营配置数据

/**
 * 运营管理——获取运营配置.
 */
function _getOperationCfgs(req, dataObj, cb) {
    const FUNC = TAG + "_getOperationCfgs() --- ";
    //----------------------------------

    let type = dataObj.type;

    console.log(FUNC + "type:", type);

    // TODO: 改变内存中数据, 需要时才写入数据库
    switch (type) {
        case OP_TYPE.CHANGE_IN_KIND:
            _getChangeCfgs(req, cb);
            break;
        case OP_TYPE.SWITCH:
            _getSwitch(req, cb);
            break;
    }
}

/**
 * 获取实物兑换相关配置数据.
 */
function _getChangeCfgs(req, cb) {
    const FUNC = TAG + "_getChangeCfgs() --- ";
    //----------------------------------

    let ret = CacheOperation.findCfgsByType(OP_TYPE.CHANGE_IN_KIND);

    cb(null, ret);
}

/**
 * 获取实物兑换相关配置数据.
 */
function _getSwitch(req, cb) {
    const FUNC = TAG + "_getSwitch() --- ";
    //----------------------------------

    let ret = CacheOperation.findCfgsByType(OP_TYPE.SWITCH);

    cb(null, ret);
}


////////////////////////////////////////////////////////////
// 配置实物兑换数据

/**
 * 运营管理——实物兑换配置
 */
function _modifyCfgs(req, dataObj, cb) {
    const FUNC = TAG + "_modifyCfgs() --- ";
    //----------------------------------

    let oid = dataObj.oid;
    let value = dataObj.value;
    let desc = dataObj.desc;
    let change = dataObj.change;
    let cfg_id = dataObj.cfg_id;

    console.log(FUNC + "oid:", oid);
    console.log(FUNC + "value:", value);
    console.log(FUNC + "desc:", desc);
    console.log(FUNC + "change:", change);
    console.log(FUNC + "cfg_id:", cfg_id);

    if (!_.isUndefined(desc)) {
        CacheOperation.updateDesc(oid, desc);
        cb(null, CacheOperation.findCfgsById(oid).desc);
    }
    if (!_.isUndefined(value)) {
        CacheOperation.updateValue(oid, value);
        // 实物兑换开关切换
        console.log(FUNC + "oid:", oid);
        console.log(FUNC + "value:", value);
        if (oid == 101) {
            RedisUtil.set(redisKeys.SWITCH.CIK, value);
        }
        cb(null, CacheOperation.findCfgsById(oid).value);
    }
    if (!_.isUndefined(change)) {
        CacheOperation.change(oid, change);
        cb(null, CacheOperation.findCfgsById(oid).value);
    }
    if (!_.isUndefined(cfg_id)) {
        CacheOperation.updateCid(oid, cfg_id);
        cb(null, CacheOperation.findCfgsById(oid).cfg_id);
    }
}

/**
 * 提现获取卡号卡密.
 * @param {*} req 
 * @param {*} dataObj 
 * @param {*} cb 
 */
function _buyCard(req, dataObj, cb) {
    const FUNC = TAG + "_buyCard() --- ";

    let orderid = dataObj.orderid;
    let uid = dataObj.uid;
    let cid = dataObj.cid;
    let changeInfo = getChangeInfo(cid);
    let business = changeInfo.business;

    console.log(FUNC + 'orderid:', orderid);
    console.log(FUNC + 'uid:', uid);
    console.log(FUNC + 'cid:', cid);
    console.log(FUNC + 'changeInfo:', changeInfo);

    let account = {
        id: uid,
    };
    console.log(FUNC + 'account:', account);
    // let result = await buzz_recieve.buyCard(changeInfo, account);
    let result = {
        card_num: '123456',
        card_pwd: '654321',
    };
    console.log(FUNC + 'result:', result);

    cb(null, result);
}

function getChangeInfo(cid) {
    for (let i = 0; i < change_change_cfg.length; i++) {
        let info  = change_change_cfg[i];
        if (cid == info.id) {
            return info;
        }
    }
}

function _getChangeOrder(req, dataObj, cb) {
    const FUNC = TAG + "_getChangeOrder() --- ";
    //----------------------------------
    let start_date = dataObj.start_date;
    let end_date = dataObj.end_date;
    let filter = dataObj.filter;

    console.log(FUNC + "start_date:", start_date);
    console.log(FUNC + "end_date:", end_date);
    console.log(FUNC + "filter:", filter);

    // let ret = CacheChange.findOrdersByTimeRange(start_date, end_date);

    let ret = CacheChange.findOrdersByTimeRangeAndFilter(start_date, end_date, filter);

    cb(null, ret);
}

function _addHuafeiquan(req, dataObj, cb) {
    const FUNC = TAG + "_addHuafeiquan() --- ";
    //----------------------------------
    let uid = dataObj.uid;
    let num = dataObj.num;

    console.log(FUNC + "uid:", uid);
    console.log(FUNC + "num:", num);

    let ret = CacheAccount.addHuafeiquan(uid, num);

    cb(null, ret);
}
