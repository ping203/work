const logger = loggerEx(__filename);
const logicResponse = require('../../../common/logicResponse');

const exp = module.exports;

exp.getOnlineStatus = async function(data) {
    return new Promise(function(resolve, reject){
        myDao.getOnlineStatus(data, function (err, rows) {
            if(err){
                logger.error('获取在线状态失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows));
        });
    });
};

exp.getRealtimeData = async function(data) {
    return new Promise(function(resolve, reject){
        myDao.getRealtimeData(data, function (err, rows) {
            if(err){
                logger.error('获取实时数据失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows));
        });
    });
};

exp.getRegisterData = async function(data) {
    return new Promise(function(resolve, reject){
        myDao.getRegisterData(data, function (err, rows) {
            if(err){
                logger.error('获取注册数据失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows));
        });
    });
};

exp.getActiveData = async function(data) {
    return new Promise(function(resolve, reject){
        myDao.getActiveData(data, function (err, rows) {
            if(err){
                logger.error('获取登录数据失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows));
        });
    });
};

exp.getDailyStatistics = async function(data) {
    return new Promise(function(resolve, reject){
        myDao.getActiveData(data, function (err, rows) {
            if(err){
                logger.error('获取登录数据失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(rows));
        });
    });
};