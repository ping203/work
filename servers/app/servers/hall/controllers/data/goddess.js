﻿////////////////////////////////////////////////////////////////////////////////
// 女神相关接口的实现
// getDefend
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var data_util = require('./data_util');
var buzz_goddess = require('../../src/buzz/buzz_goddess');
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
const logicResponse = require('../../../common/logicResponse');

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【data.goddess】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getDefend = getDefend;
exports.challengeGoddess = challengeGoddess;
exports.rewardTimes = rewardTimes;
exports.weekTop1 = weekTop1;
exports.unlock = unlock;
exports.levelup = levelup;
exports.weekReward = weekReward;
exports.queryWeekReward = queryWeekReward;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 领取保卫女神周排名奖励
 */
async function weekReward(data) {
    return new Promise(function (resolve, reject) {
        buzz_goddess.weekReward({pool: global.mysqlPool}, data, function(err, result) {
            if (err) {
                logger.error('领取保卫女神周排名奖励 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 查询当前有无保卫女神周奖励，且返回我的当前排名、以及可以领奖的dropkey
 */
async function queryWeekReward(data) {
    return new Promise(function (resolve, reject) {
        buzz_goddess.queryWeekReward({pool: global.mysqlPool}, data, function(err, result) {
            if (err) {
                logger.error('查询当前有无保卫女神周奖励 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 女神解锁
 */
async function unlock(data) {
    return new Promise(function (resolve, reject) {
        buzz_goddess.unlock({pool: global.mysqlPool}, data, function(err, result) {
            if (err) {
                logger.error('女神解锁身体区域 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 女神升级
 */
async function levelup(data) {
    return new Promise(function (resolve, reject) {
        buzz_goddess.unleveluplock({pool: global.mysqlPool}, data, function(err, result) {
            if (err) {
                logger.error('女神升级 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 获取女神数据.
 */
async function getDefend(data) {
    return new Promise(function (resolve, reject) {
        buzz_goddess.getDefend({pool: global.mysqlPool}, data, function(err, result) {
            if (err) {
                logger.error('女神数据获取 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 挑战女神.
 */
async function challengeGoddess(data) {
    return new Promise(function (resolve, reject) {
        buzz_goddess.challengeGoddess({pool: global.mysqlPool}, data, function(err, result) {
            if (err) {
                logger.error('挑战女神 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 女神结算时返回奖励倍数.
 */
async function rewardTimes(data) {
    return new Promise(function (resolve, reject) {
        buzz_goddess.rewardTimes({pool: global.mysqlPool}, data, function(err, result) {
            if (err) {
                logger.error('女神结算时返回奖励倍数 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function weekTop1(data) {
    let platform = data.platform || 1;
    let result = buzz_goddess.getGoddessTop1(platform);
    return logicResponse.ask(result);
}


//==============================================================================
// private
//==============================================================================
