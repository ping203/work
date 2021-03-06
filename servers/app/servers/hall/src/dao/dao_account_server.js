////////////////////////////////////////////////////////////
// 运营设置参数的数据库读写逻辑
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var _ = require('underscore');
// var ObjUtil = require('../utils/ObjUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var DateUtil = require('../utils/DateUtil');
var buzz_cst_error = require('../buzz/cst/buzz_cst_error');

var ERROR_OBJ = buzz_cst_error.ERROR_OBJ;

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 缓存
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【dao_account_server】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.insert = insert;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 插入一条记录
 */
function insert(pool, list, cb) {
    const FUNC = TAG + "insert() --- ";
    //----------------------------------

    _didInsert(pool, list, function(err, results) {
        cb();
    });
}


//==============================================================================
// private
//==============================================================================

/**
 * 插入一条服务器分配记录
 */
function _didInsert(pool, list, cb) {
    const FUNC = TAG + "_didInsert() --- ";
    DEBUG = 0;
    //----------------------------------
    var sql = "";

    sql += "INSERT INTO tbl_account_server ";
    sql += "(uid, sid, login_time) ";
    sql += "VALUES ";
    for (var i = 0; i < list.length; i++) {
        if (i > 0) sql += ",";
        var account = list[i];
        if (account) {
            sql += "(";
            sql += account.uid + ",";
            sql += account.sid + ",";
            sql += "'" + DateUtil.getTimeFromTimestamp(account.login_time) + "'";
            sql += ")";
        }
    }
    sql += "ON DUPLICATE KEY UPDATE uid=VALUES(uid), sid=VALUES(sid), login_time=VALUES(login_time) ";

    
    var sql_data = [];

    handleQuery(pool, sql, sql_data, cb);
}


//==============================================================================
// 需要转移
//==============================================================================

function handleQuery(pool, sql, sql_data, cb) {
    const FUNC = TAG + "handleQuery() --- ";
    if (DEBUG) logger.info(FUNC + 'sql:\n', sql);
    if (DEBUG) logger.info(FUNC + 'sql_data:\n', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) logger.error(FUNC + "err:\n", err);
            if (ERROR) logger.error(FUNC + 'sql:\n', sql);
            if (ERROR) logger.error(FUNC + 'sql_data:\n', sql_data);
        } else {
            DEBUG = 0;
            if (DEBUG) logger.info(FUNC + 'result: ', result);
        }
        cb(err, result);
        DEBUG = 0;
    });
}

