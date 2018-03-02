////////////////////////////////////////////////////////////////////////////////
// 排位赛相关接口的实现
// result
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
//------------------------------------------------------------------------------
// 工具(Tool)
//------------------------------------------------------------------------------
var BuzzUtil = require('../../src/utils/BuzzUtil');
var data_util = require('./data_util');
var buzz_rankgame = require('../../src/buzz/buzz_rankgame');
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var buzz_charts = require('../../src/buzz/buzz_charts');
const logicResponse = require('../../../common/logicResponse');
var CstError = require('../../src/buzz/cst/buzz_cst_error');
const ERROR_OBJ = CstError.ERROR_OBJ;

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

var TAG = "【data.rankgame】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.result = result;
exports.info = info;
exports.box = box;
exports.get_ranking = get_ranking;
exports.ongoing = ongoing;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取排位赛结算数据.
 */
async function result(data) {
    return new Promise(function (resolve, reject) {
        buzz_rankgame.result({pool:global.mysqlPool}, data, function (err, results) {
            if (err) {
                logger.error('排位赛数据获取失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

/**
 * 获取排位赛结算数据.
 */
async function info(data) {
    return new Promise(function (resolve, reject) {
        buzz_rankgame.info({pool:global.mysqlPool}, data, function (err, results) {
            if (err) {
                logger.error('排位赛信息获取失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

/**
 * 排位赛宝箱操作相关.
 */
async function box(data) {
    return new Promise(function (resolve, reject) {
        buzz_rankgame.box({pool:global.mysqlPool}, data, function (err, results) {
            if (err) {
                logger.error('排位赛宝箱操作失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

/**
 * 获取排行榜结算数据.
 */
async function get_ranking(data) {
    return new Promise(function (resolve, reject) {
        buzz_charts.getCharts({pool:global.mysqlPool}, data, function (err, results) {
            if (err) {
                logger.error('获取排行榜失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

/**
 * 获取是否有正在进行中的比赛.
 */
async function ongoing(data) {
    return new Promise(function (resolve, reject) {
        buzz_rankgame.ongoing({pool:global.mysqlPool}, data, function (err, results) {
            if (err) {
                logger.error('获取是否有正在进行中的比赛失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}


//==============================================================================
// private
//==============================================================================
