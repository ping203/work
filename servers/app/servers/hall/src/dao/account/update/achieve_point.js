////////////////////////////////////////////////////////////////////////////////
// Account Update Achieve Point
// 成就值更新
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var AccountCommon = require('../common');
var CacheAccount = require('../../../buzz/cache/CacheAccount');

var DEBUG = 0;
var ERROR = 1;

const TAG = "【update/achieve_point】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.update = _update;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 账户数据更新(每日任务完成度).
 */
function _update(pool, data, cb, my_account) {
    const FUNC = TAG + "_update() --- ";
    if (DEBUG) logger.info(FUNC + "CALL...");
    
    // var uid = my_account['id'];
    var token = my_account['token'];
    var achieve_point = data['achieve_point'];
    var uid = token.split("_")[0];

    if (my_account.achieve_point > achieve_point) {
        if (ERROR) logger.error(FUNC + "成就点只能增加不能减少");
        if (DEBUG) logger.info(FUNC + "当前值:", my_account.achieve_point);
        if (DEBUG) logger.info(FUNC + "更新值:", achieve_point);
        achieve_point = my_account.achieve_point;
    }
    
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    my_account.achieve_point = achieve_point;
    my_account.commit();
    
    cb(null, "success");
}


//==============================================================================
// private
//==============================================================================
