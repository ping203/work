const logicResponse = require('../../../common/logicResponse');
const buzz_operation = require('../../src/buzz/buzz_operation');
const buzz_change = require('../../src/buzz/buzz_change');

exports.getOperationCfgs = getOperationCfgs;
exports.buyCard = buyCard;
exports.modifyCfgs = modifyCfgs;
exports.modifyOrders = modifyOrders;
exports.getChangeOrder = getChangeOrder;
exports.addHuafeiquan = addHuafeiquan;
exports.queryJackpot = queryJackpot;
exports.queryPlayer = queryPlayer;
exports.changeRate = changeRate;
exports.queryProfit = queryProfit;

async function queryProfit(data) {
    return new Promise(function(resolve, reject){
        buzz_operation.queryProfit({pool:global.mysqlPool}, data, function(err, result) {
            if(err){
                logger.error('运营管理——查询盈亏排行榜 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function queryJackpot(data) {
    return new Promise(function(resolve, reject){
        buzz_operation.queryJackpot({pool:global.mysqlPool}, data, function(err, result) {
            if(err){
                logger.error('运营管理——查询奖池总览数据 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function queryPlayer(data) {
    return new Promise(function(resolve, reject){
        buzz_operation.queryPlayer({pool:global.mysqlPool}, data, function(err, result) {
            if(err){
                logger.error('运营管理——查询玩家数据 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function changeRate(data) {
    return new Promise(function(resolve, reject){
        buzz_operation.changeRate({pool:global.mysqlPool}, data, function(err, result) {
            if(err){
                logger.error('运营管理——修改捕获率 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function addHuafeiquan(data) {
    return new Promise(function(resolve, reject){
        buzz_operation.addHuafeiquan({pool:global.mysqlPool}, data, function(err, result) {
            if(err){
                logger.error('运营管理——取消订单给玩家返还话费券 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function buyCard(data) {
    return new Promise(function(resolve, reject){
        buzz_operation.buyCard({pool:global.mysqlPool}, data, function(err, result) {
            if(err){
                logger.error('运营管理——玩家提现获取卡号卡密 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function getOperationCfgs(data) {
    return new Promise(function(resolve, reject){
        buzz_operation.getOperationCfgs({pool:global.mysqlPool}, data, function(err, result) {
            if(err){
                logger.error('运营管理——获取运营配置 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function modifyCfgs(data) {
    return new Promise(function(resolve, reject){
        buzz_operation.modifyCfgs({pool:global.mysqlPool}, data, function(err, result) {
            if(err){
                logger.error('运营管理——修改配置 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function modifyOrders(data) {
    return new Promise(function(resolve, reject){
        buzz_change.modifyOrders({pool:global.mysqlPool}, data, function(err, result) {
            if(err){
                logger.error('修改订单状态和信息 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function getChangeOrder(data) {
    return new Promise(function(resolve, reject){
        buzz_operation.getChangeOrder({pool:global.mysqlPool}, data, function(err, result) {
            if(err){
                logger.error('运营管理——获取指定时间段内的订单 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}