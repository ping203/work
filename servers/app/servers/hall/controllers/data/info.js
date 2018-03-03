////////////////////////////////////////////////////////////////////////////////
// 获取服务器中特定账户的信息
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
//------------------------------------------------------------------------------
// 工具(Tool)
//------------------------------------------------------------------------------
var BuzzUtil = require('../../src/utils/BuzzUtil');
var buzz_info = require('../../src/buzz/buzz_info');
var data_util = require('./data_util');
const logicResponse = require('../../../common/logicResponse');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../api_map');
const ERROR_OBJ = require('../../../../consts/error').ERROR_OBJ;


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【data/info】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getHuafeiquan = getHuafeiquan;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取话费券数量.
 */
async function getHuafeiquan(data) {
    return new Promise(function(resolve, reject){
        buzz_info.getHuafeiquan(data, function(err, result) {
            if (err) {
                logger.error('getHuafeiquan err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}


/**
 * 查询玩家使用的喇叭和收到的鲜花
 * 注意是收到的鲜花，不是当前鲜花总量
 */
exports.getHornFlower = async function (data) {
    return new Promise(function (resolve, reject) {
        buzz_info.getHornFlower({pool: global.mysqlPool}, data, function(err, result) {
            if (err) {
                logger.error('获取喇叭、鲜花数量 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
};

/**
 * 查询指定某个道具剩余过期时间
 */
exports.getItemLimitTime = async function (data) {
    return new Promise(function (resolve, reject) {
        buzz_info.getItemLimitTime({pool: global.mysqlPool}, data, function(err, result) {
            if (err) {
                logger.error('获取限时道具剩余时间 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
};

/**
 * 查询玩家限时道具获得时间
 */
exports.getItemLimitGotTime = async function (data) {
    return new Promise(function (resolve, reject) {
        buzz_info.getItemLimitGotTime({pool: global.mysqlPool}, data, function(err, result) {
            if (err) {
                logger.error('获取玩家限时道具获得时间 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
};

//==============================================================================
// private
//==============================================================================


