﻿////////////////////////////////////////////////////////////////////////////////
// Gold Data Operation
// 金币数据的操作更新
// add_gold_log
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var data_util = require('./data_util');
const logicResponse = require('../../../common/logicResponse');

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.add_gold_log = _add_gold_log;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 添加金币记录
 */
async function _add_gold_log(data) {
    return new Promise(function (resolve, reject) {
        myDao.addGoldLog(data, function (err, rows) {
            if (err) {
                logger.error('更新玩家金币数据失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows[0]));
        });
    });
}


//==============================================================================
// private
//==============================================================================

