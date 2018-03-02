const buzz_recieve = require('../../src/buzz/buzz_recieve');
const logicResponse = require('../../../common/logicResponse');


exports.turntableDraw = turntableDraw;
exports.changeInKind = changeInKind;
exports.buyVipGift = buyVipGift;
exports.vipDailyReward = vipDailyReward;

async function turntableDraw(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.turntableDraw({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('转盘抽奖 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function changeInKind(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.changeInKind({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('实物兑换 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function buyVipGift(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.buyVipGift({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('购买VIP礼包 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function vipDailyReward(data) {
    return new Promise(function (resolve, reject) {
        buzz_recieve.vipDailyReward({pool:global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('领取VIP每日奖励 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}