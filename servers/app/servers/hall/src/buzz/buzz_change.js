////////////////////////////////////////////////////////////
// 实物兑换订单相关接口的业务逻辑
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var _ = require('underscore');
var CstError = require('./cst/buzz_cst_error');
var ERROR_OBJ = CstError.ERROR_OBJ;
var CommonUtil = require('./CommonUtil');
var ObjUtil = require('./ObjUtil');
var BuzzUtil = require('../utils/BuzzUtil');

//------------------------------------------------------------------------------
// POJO
//------------------------------------------------------------------------------
// var Reward = require('./pojo/Reward');

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
// var buzz_reward = require('./buzz_reward');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheChange = require('./cache/CacheChange');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【buzz_change】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.modifyOrders = modifyOrders;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------


/**
 * 运营管理——修改配置.
 */
function modifyOrders(req, dataObj, cb) {
    const FUNC = TAG + "modifyCfgs() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;

    _modifyOrders(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['op', 'orderid'], "【buzz_change】", cb);
    }
}

//==============================================================================
// private
//==============================================================================

/**
 * 修改订单状态
 */
function _modifyOrders(req, dataObj, cb) {
    const FUNC = TAG + "_modifyOrders() --- ";
    //----------------------------------

    var op = dataObj.op;
    var orderid = dataObj.orderid;
    var way = dataObj.way;
    var thingnum = dataObj.thingnum;
    var status = dataObj.status;

    console.log(FUNC + "op:", op);
    console.log(FUNC + "orderid:", orderid);
    console.log(FUNC + "way:", way);
    console.log(FUNC + "thingnum:", thingnum);
    console.log(FUNC + "status:", status);

    if ("status" == op) {
        CacheChange.updateStatus(req, orderid, status);
    }
    else if ("way" == op) {
        CacheChange.updateWay(req, orderid, way, thingnum);
    }
    cb(null, CacheChange.getStatusByOrderId(orderid));
}
