﻿////////////////////////////////////////////////////////////////////////////////
// Account Update Roipct Time
// POIPCT更新
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var AccountCommon = require('../common');
var CacheAccount = require('../../../buzz/cache/CacheAccount');


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
exports.update = update;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 账户数据更新(POIPCT).
 */
function update(pool, data, cb, my_account) {

    var account_id = my_account['id'];
    var token = my_account['token'];
    var roipct_time = data['roipct_time'];

    CacheAccount.setRoipctTime(account_id, roipct_time);
    // 无需返回
    cb(null, "success");
}


//==============================================================================
// private
//==============================================================================
