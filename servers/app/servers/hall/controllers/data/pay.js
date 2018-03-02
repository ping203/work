const BuzzUtil = require('../../src/utils/BuzzUtil');
const buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
const buzz_pay = require('../../src/buzz/buzz_pay');
const data_util = require('./data_util');
const logger = loggerEx(__filename);
const logicResponse = require('../../../common/logicResponse');
const TAG = "【data/pay】";

exports.buy = buy;
exports.get_game_order = get_game_order;
exports.check_order_status = check_order_status;

/**
 * 添加商城记录
 */
async function buy(data) {
    BuzzUtil.cacheLinkDataApi(data, "buy");
    return new Promise(function (resolve, reject) {
        buzz_pay.buy({pool: global.mysqlPool}, data, function(err, result) {
            if (err) {
                logger.error('玩家购买失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}


/**
 * 获取游戏订单.
 */
async function get_game_order(data) {
    return getGameOrderNew(data);
}

async function getGameOrderNew(data) {
    return new Promise(function (resolve, reject) {
        buzz_pay.getGameOrder({pool: global.mysqlPool}, data, function(err, result) {
            if (err) {
                logger.error('获取订单号 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

/**
 * 检查游戏订单.
 */
async function check_order_status(data) {
    BuzzUtil.cacheLinkDataApi(data, "check_order_status");

    return new Promise(function (resolve, reject) {
        myDao.checkOrderStatus(data, function(err, result) {
            if (err) {
                logger.error('检查订单状态失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}


//==============================================================================
// private
//==============================================================================

function _runFakeData(res, aes) {
    // NOTICE: 测试数据
    // 余额不足
    //let results = {
    //    code: 1004,
    //    subcode: -7499,
    //    message: '金额不足',
    //    notice: 0,
    //    time: 1490334317,
    //    tips: 'B505-258'
    //};
    // 支付成功
    let results = {
        code: 0,
        subcode: 0,
        message: '',
        default: 0,
        data: [{ billno: '-8957_A500009_1_1490345431_45919313', cost: 2 }],
        game_order_id: '201703240000000027'
    };
    
    logger.info("玩吧玩家积分购买商品返回结果----aes:", aes);
    logger.info("玩吧玩家积分购买商品返回结果----results:", results);
    let res_data = buzz_cst_game.getResData(results, aes);
    logger.info("玩吧玩家积分购买商品返回结果----res_data:", res_data);
    
    res.success({ type: 1, msg: '玩家购买成功', data: res_data, aes: aes });
}