const logicResponse = require('../../../common/logicResponse');

exports.shutdownWithCrash = shutdownWithCrash;
exports.shutdown = shutdown;
exports.saveAll = saveAll;

function shutdownWithCrash(pool) {
    logger.info("CALL shutdown: Server Crash");
    
    // 验证管理员身份
    _checkAdmin(function () {

    });

}

async function shutdown(data) {
    return new Promise(function(resolve, reject){
        myDao.saveAll(function (err, results) {
            if(err){
                logger.error('缓存数据已经全部导入数据库，服务器可以安全关闭 err:', err);
                reject(err);
            }
            _exit();
            resolve(logicResponse.ask({}));
        });
    }); 
}

////////////////////////////////////////
/**
 * 仅存入数据库, 不关闭服务器(用于调试时能立即看到数据库变化)
 */
async function saveAll(data) {
    return new Promise(function(resolve, reject){
        myDao.saveAll(function (err, results) {
            if(err){
                logger.error('缓存数据已经全部导入数据库 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask({}));
        });
    });
}

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