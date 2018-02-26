const BuzzUtil = require('../../src/utils/BuzzUtil');
const buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
const buzz_pay = require('../../src/buzz/buzz_pay');
const data_util = require('./data_util');
const logger = loggerEx(__filename);

const TAG = "【data/pay】";

exports.buy = buy;
exports.get_game_order = get_game_order;
exports.check_order_status = check_order_status;

/**
 * 添加商城记录
 */
function buy(req, res) {
    const FUNC = TAG + "buy() --- ";

    logger.info(FUNC + "CALL...");
    logger.info(FUNC + "req.body: " + JSON.stringify(req.body));

    // 用户数据解析(解码为请求数据结构)
    data_util.request_info(req, "buy");
    let aes = req.body.aes;
    let dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    BuzzUtil.cacheLinkDataApi(dataObj, "buy");
    
    // NOTICE: 测试数据
    //_runFakeData(res, aes);

    buzz_pay.buy(req, dataObj, function (err, results) {
        if (err) {
            res.success({ type: 1, msg: '玩家购买失败', err: err });
        } else {
            logger.info("玩吧玩家积分购买商品返回结果----aes:", aes);
            logger.info("玩吧玩家积分购买商品返回结果----results:", results);
            let res_data = buzz_cst_game.getResData(results, aes);
            logger.info("玩吧玩家积分购买商品返回结果----res_data:", res_data);

            res.success({ type: 1, msg: '玩家购买成功', data: res_data, aes:aes });
        }
    });
}


/**
 * 获取游戏订单.
 */
function get_game_order(req, res) {
    getGameOrderNew(req, res);
}

function getGameOrderNew(req, res) {
    const FUNC = TAG + "getGameOrderNew() --- ";
    const HINT = "获取订单号";
    //----------------------------------
    let aes = req.body.aes;
    let dataObj = data_util.parseDataObj(req, HINT);

    if (undefined == dataObj.test) {
        dataObj.test = true;
    }

    buzz_pay.getGameOrder(req, dataObj, function(err, result) {
        if (err) {
            logger.error(FUNC + "err:", err);
        }
        logger.info(FUNC + "result:", result);
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 检查游戏订单.
 */
function check_order_status(req, res) {
    const FUNC = TAG + "check_order_status() --- ";

    logger.info(FUNC + "CALL...");
    logger.info(FUNC + "req.body: " + JSON.stringify(req.body));

    // 用户数据解析(解码为请求数据结构)
    data_util.request_info(req, "check_order_status");
    let aes = req.body.aes;
    let dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    BuzzUtil.cacheLinkDataApi(dataObj, "check_order_status");

    myDao.checkOrderStatus(dataObj, function (err, result) {
        if (err) {
            logger.error(FUNC + "msg:", "检查订单状态失败");
            logger.error(FUNC + "err:", err);
            res.success({ type: 1, msg: '检查订单状态失败', err: err });
        } else {
            logger.info("check_order_status result:", result);
            res.success({ type: 1, msg: '检查订单状态成功', data: result });
        }
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