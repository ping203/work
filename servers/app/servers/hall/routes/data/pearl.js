﻿////////////////////////////////////////////////////////////////////////////////
// Pearl Data Operation
// 钻石数据的操作更新
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var data_util = require('./data_util');


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
exports.add_pearl_log = _add_pearl_log;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 添加钻石记录
 */
function _add_pearl_log(req, res) {
    data_util.request_info(req, "add_pearl_log");
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    
    myDao.addPearlLog(dataObj, function (err, rows) {
        if (err) {
            res.success({ type: 1, msg: '更新玩家钻石数据失败', err: err });
        } else {
            res.success({ type: 1, msg: '更新玩家钻石数据成功', data: 1 });
        }
    });
}


//==============================================================================
// private
//==============================================================================

