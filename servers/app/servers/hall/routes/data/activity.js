const buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
const data_util = require('./data_util');
const logger = loggerEx(__filename);

const TAG = "【data.activity】";

exports.showMeActivity = showMeActivity;
exports.getReward = getReward;

/**
 * 创建CD-KEY
 */
function showMeActivity(req, res) {
    const FUNC = TAG + "showMeActivity()---";

    let aes = req.body.aes;
    let dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    logger.info(FUNC + 'dataObj:\n', dataObj);
    
    myDao.showMeActivity(dataObj, function (err, results) {
        if (err) {
            res.success({ type: 1, msg: '获取当前开启的活动失败', err: err });
        } else {
            let res_data = buzz_cst_game.getResData( results, aes);
            res.success({ type: 1, msg: '获取当前开启的活动成功', data: res_data, aes: aes });
        }
    });
}

/**
 * 根据传入的action_id获取此活动下所有CD-KEY极其状态
 */
function getReward(req, res) {
    const FUNC = TAG + "getReward()---";

    let aes = req.body.aes;
    let dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    logger.info(FUNC + 'dataObj:\n', dataObj);
    
    myDao.getReward(dataObj, function (err, account) {
        if (err) {
            logger.error(FUNC + "err:\n", err);
            res.success({ type: 1, msg: '获取活动奖励失败', err: err });
        } else {
            let res_data = buzz_cst_game.getResData(account, aes);
            res.success({ type: 1, msg: '获取活动奖励成功', data: res_data, aes: aes });
        }
    });
}


//==============================================================================
// private
//==============================================================================

