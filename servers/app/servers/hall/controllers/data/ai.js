////////////////////////////////////////////////////////////////////////////////
// Weapon Data Operation
// 武器数据的操作更新
// update_ai
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var data_util = require('./data_util');
var BuzzUtil = require('../../src/utils/BuzzUtil');
const logicResponse = require('../../../common/logicResponse');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../api_map');


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【data/ai】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.update_ai = update_ai;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 添加武器升级记录
 */
async function update_ai(data) {

    BuzzUtil.cacheLinkDataApi(data, "update_ai");

    return new Promise(function(resolve, reject){
        myDao.updateAi(data, function (err, results) {
            if(err){
                logger.error('update_ai err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}


//==============================================================================
// private
//==============================================================================