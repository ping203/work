////////////////////////////////////////////////////////////////////////////////
// 社交相关的接口实现.
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
//------------------------------------------------------------------------------
// 工具(Tool)
//------------------------------------------------------------------------------
var data_util = require('./data_util');
var buzz_social = require('../../src/buzz/buzz_social');
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
const logicResponse = require('../../../common/logicResponse');
//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('../../src/buzz/cache/CacheLink');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../api_map');

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【data/social】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getInviteProgress = getInviteProgress;
exports.getShareStatus = getShareStatus;
exports.getEnshrineStatus = getEnshrineStatus;
exports.inviteSuccess = inviteSuccess;
exports.shareSuccess = shareSuccess;
exports.enshrineSuccess = enshrineSuccess;
exports.getSocialReward = getSocialReward;
exports.getFriendsCharts = getFriendsCharts;
exports.inviteDaily = inviteDaily;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取好友排行榜.
 */
async function getFriendsCharts(data) {
    return new Promise(function (resolve, reject) {
        buzz_social.getFriendsCharts({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('获取好友排行榜 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 获取好友邀请进度.
 */
async function getInviteProgress(data) {
    return new Promise(function (resolve, reject) {
        buzz_social.getInviteProgress({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('获取好友邀请进度 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 获取好友分享状态.
 */
async function getShareStatus(data) {
    return new Promise(function (resolve, reject) {
        buzz_social.getShareStatus({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('获取好友分享状态 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 获取收藏状态.
 */
async function getEnshrineStatus(data) {
    return new Promise(function (resolve, reject) {
        buzz_social.getEnshrineStatus({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('获取收藏状态 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 邀请好友.
 */
async function inviteSuccess(data, cb) {
    return new Promise(function (resolve, reject) {
        buzz_social.inviteSuccess({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('邀请好友 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 每日首次邀请好友记录.
 */
async function inviteDaily(data, cb) {
    return new Promise(function (resolve, reject) {
        buzz_social.inviteDaily({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('首次邀请好友记录 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 分享记录.
 */
async function shareSuccess(data, cb) {
    return new Promise(function (resolve, reject) {
        buzz_social.shareSuccess({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('分享记录 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 社交奖励领取.
 */
async function getSocialReward(data, cb) {
    return new Promise(function (resolve, reject) {
        buzz_social.getSocialReward({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('社交奖励领取 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 快捷方式相关(创建, 领取奖励).
 */
async function enshrineSuccess(data, cb) {
    return new Promise(function (resolve, reject) {
        buzz_social.enshrineSuccess({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('快捷方式相关 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}
