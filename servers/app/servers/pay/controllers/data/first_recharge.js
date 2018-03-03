/**
 * 首充类: 处理首充的相关操作
 */
let data_util = require('./data_util');
let DaoCommon = require('../../src/dao/dao_common');
let GameLog = require('../../src/log/GameLog');

const gameConfig = require('../../../../utils/imports').GAME_CFGS;
const common_const_cfg = gameConfig.common_const_cfg;
const common_log_const_cfg = gameConfig.common_log_const_cfg;
const string_strings_cfg = gameConfig.string_strings_cfg;

let DateUtil = require('../../src/utils/DateUtil');
let BuzzUtil = require('../../src/utils/BuzzUtil');
const logicResponse = require('../../../common/logicResponse');

/**
     * 首充礼包领取
     * @param {*} req 
     * @param {*} res 
     */

     //TODO LINYNG @YXL 首冲奖励未完成
async function reward(data) {
    const FUNC = "FirstRecharge:reward --- ";
    const HINT = "首充奖励领取";

    let aes = req.body.aes;
    let dataObj = data_util.parseDataObj(req, HINT);
    BuzzUtil.cacheLinkDataApi(dataObj, "first_recharge_reward");

    let token = dataObj.token;

    DaoCommon.checkAccount(mysqlPool, token, function (error, account) {
        if (error) {
            data_util.handleReturn(res, aes, error, null, HINT);
            return;
        }
        doNext(account);
    });

    function doNext(account) {

        let uid = account.id;

        if (!_isPlayerCharge(account)) return;
        if (_isGiftGotten(account)) return;

        let item_list = [];
        for (let i = 0; i < common_const_cfg.FIRST_RECHARGE.length; i++) {
            var gift = common_const_cfg.FIRST_RECHARGE[i];
            item_list.push({
                item_id: gift[0],
                item_num: gift[1]
            });
        }
        console.log(FUNC + 'item_list:', item_list);

        let req = { pool: mysqlPool, dao: myDao };
        BuzzUtil.putIntoPack(req, account, item_list, function (rewardInfo) {
            account.first_buy_gift = 1;
            account.commit();
            let change = BuzzUtil.getChange(account, rewardInfo);
            let ret = {
                item_list: item_list,
                change: change,
            };
            data_util.handleReturn(res, aes, null, ret, HINT);
            GameLog.addGameLog(item_list, account, common_log_const_cfg.FIRST_BUY, '首充领取');
        });
    }

    // 玩家没有充值不允许领取
    function _isPlayerCharge(account) {
        if (0 == account.rmb) {
            let uid = account.id;
            let error = FUNC + `${uid}没有充值`;
            data_util.handleReturn(res, aes, error, null, HINT);
            console.log(error);
            return false;
        }
        return true;
    }

    // 玩家已经领取了首充礼包则返回错误信息
    function _isGiftGotten(account) {
        if (account.first_buy_gift) {
            let uid = account.id;
            let error = FUNC + `${uid}已经领取了首充大礼包`;
            data_util.handleReturn(res, aes, error, null, HINT);
            console.log(error);
            return true;
        }
        return false;
    }

}

module.exports.reward = reward;