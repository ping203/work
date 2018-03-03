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

async function reward(data) {

    BuzzUtil.cacheLinkDataApi(data, "first_recharge_reward");
    let token = data.token;

    return new Promise(function (resolve, reject) {
        DaoCommon.checkAccount(mysqlPool, token, function (err, account) {
            if (err) {
                logger.error('首充奖励领取 err', err);
                reject(err);
                return;
            }

            let uid = account.id;

            if (0 == account.rmb) {
                let uid = account.id;
                let error = `${uid}没有充值`;
                reject(error);
            }

            if (account.first_buy_gift) {
                let uid = account.id;
                let error = `${uid}已经领取了首充大礼包`;
                reject(error);
            }

            let item_list = [];
            for (let i = 0; i < common_const_cfg.FIRST_RECHARGE.length; i++) {
                var gift = common_const_cfg.FIRST_RECHARGE[i];
                item_list.push({
                    item_id: gift[0],
                    item_num: gift[1]
                });
            }
            logger.info('item_list:', item_list);
            let req = {
                pool: mysqlPool,
                dao: myDao
            };
            BuzzUtil.putIntoPack(req, account, item_list, function (rewardInfo) {
                account.first_buy_gift = 1;
                account.commit();
                let change = BuzzUtil.getChange(account, rewardInfo);
                let ret = {
                    item_list: item_list,
                    change: change,
                };
                resolve(logicResponse.ask(ret));
                GameLog.addGameLog(item_list, account, common_log_const_cfg.FIRST_BUY, '首充领取');
            });
        });
    });

}

module.exports.reward = reward;