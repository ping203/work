const buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
const BuzzUtil = require('../../src/utils/BuzzUtil');
const logicResponse = require('../../../common/logicResponse');

exports.get_broadcast = get_broadcast;
exports.set_broadcast = set_broadcast;

/**
 * 设置公告
 */
async function set_broadcast(data) {

    BuzzUtil.cacheLinkDataApi(data, "set_broadcast");
    return new Promise(function(resolve, reject){
        buzz_cst_game.setBroadcast(data, {});
        resolve(logicResponse.ask({}));
    });
}

/**
 * 获取公告
 */
async function get_broadcast(data) {

    // BuzzUtil.cacheLinkDataApi(data, "get_broadcast");

    return new Promise(function(resolve, reject){
        buzz_cst_game.getBroadcast(data, function (err, gameBroadcast) {
            if(err){
                logger.error('返回公告数据失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(gameBroadcast));
        });
    });

}