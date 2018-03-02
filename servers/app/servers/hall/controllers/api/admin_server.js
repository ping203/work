const DateUtil = require('../../src/utils/DateUtil');
const logger = loggerEx(__filename);
const logicResponse = require('../../../common/logicResponse');

exports.shutdownWithCrash = shutdownWithCrash;
exports.shutdown = shutdown;
exports.saveAll = saveAll;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

////////////////////////////////////////
function shutdownWithCrash(pool) {
    logger.info("CALL shutdown: Server Crash");
    
    // 验证管理员身份
    _checkAdmin(function () {

    });

}

function shutdown(req, res) {
    logger.info("CALL shutdown: Server Update");
    // 验证管理员身份
    _checkAdmin(function () {
        myDao.saveAll(function (err, results) {
            res.success({ type: 1, msg: '缓存数据已经全部导入数据库，服务器可以安全关闭' });
            _exit();
        });
    });

}

////////////////////////////////////////
/**
 * 仅存入数据库, 不关闭服务器(用于调试时能立即看到数据库变化)
 */
function saveAll(req, res) {
    logger.info("CALL saveAll");
    // TODO: 验证管理员身份
    myDao.saveAll(function (err, results) {
        res.success({ type: 1, msg: '缓存数据已经全部导入数据库' });
    });

}


//==============================================================================
// private
//==============================================================================
// TODO: 验证管理员身份
function _checkAdmin(cb) {
    cb();
}

function _exit() {
    try {
        // 200毫秒后关闭服务器
        setTimeout(function () {
            process.exit(1);
        }, 200);
    } catch (e) {
        logger.info('error when exit', e.stack);
    }
}