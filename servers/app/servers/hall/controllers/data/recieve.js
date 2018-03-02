////////////////////////////////////////////////////////////////////////////////
// 玩家反馈的接口实现.
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var data_util = require('./data_util');
var buzz_recieve = require('../../src/buzz/buzz_recieve');
const logicResponse = require('../../../common/logicResponse');
//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【data/recieve】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.openBox = openBox;
exports.openBoxAsDrop = openBoxAsDrop;
exports.turntableDraw = turntableDraw;
exports.packMix = packMix;
exports.changeInKind = changeInKind;
exports.getCikLog = getCikLog;
exports.getCikInfo = getCikInfo;
exports.cancelCik = cancelCik;

exports.weaponUp = weaponUp;
exports.buyVipGift = buyVipGift;
exports.vipDailyReward = vipDailyReward;

exports.minigameReward = minigameReward;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

async function openBox(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.openBox({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('开宝箱 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function openBoxAsDrop(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.openBoxAsDrop({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('开宝箱(掉落处理) err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function turntableDraw(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.turntableDraw({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('转盘抽奖 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function packMix(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.packMix({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('背包合成 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function changeInKind(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.changeInKind({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('实物兑换 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function getCikLog(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.getCikLog({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('实物兑换记录查询 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function getCikInfo(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.getCikInfo({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('实物兑换获取剩余兑换数 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function cancelCik(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.cancelCik({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('玩家取消实物兑换 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function weaponUp(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.weaponUp({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('武器升级 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function buyVipGift(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.buyVipGift({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('购买VIP礼包 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function vipDailyReward(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.vipDailyReward({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('领取VIP每日奖励 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

//----------------------------------------------------------

async function minigameReward(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.minigameReward({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('小游戏结算 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}