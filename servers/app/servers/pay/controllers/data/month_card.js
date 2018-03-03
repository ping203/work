/**
 * 使用金币购买月卡
 */
let data_util = require('./data_util');
let DaoCommon = require('../../src/dao/dao_common');
let CacheAccount = require('../../src/buzz/cache/CacheAccount');
let GameLog = require('../../src/log/GameLog');

const gameConfig = require('../../../../utils/imports').GAME_CFGS;

const shop_card_cfg = gameConfig.shop_card_cfg;
const common_log_const_cfg = gameConfig.common_log_const_cfg;
const string_strings_cfg = gameConfig.string_strings_cfg;

let DateUtil = require('../../src/utils/DateUtil');
let BuzzUtil = require('../../src/utils/BuzzUtil');

let CARD_DATA = {};
for (let i = 0; i < shop_card_cfg.length; i++) {
    let cfg = shop_card_cfg[i];
    CARD_DATA[cfg.id] = cfg;
}

const CRAD_TYPE = {
    "100": 'normal',
    "101": 'senior',
};

class MonthCard {

    constructor() {

    }

    done(req, res) {
        const FUNC = "MonthCard:done --- ";
        const HINT = "金币购买月卡";

        let aes = req.body.aes;
        let dataObj = data_util.parseDataObj(req, HINT);
        BuzzUtil.cacheLinkDataApi(dataObj, "buy_month_card");

        let token = dataObj.token;
        let itemId = dataObj.itemId;
        let cardCfg = CARD_DATA[itemId];
        if (!cardCfg) {
            data_util.handleReturn(res, aes, '月卡配置有误', null, HINT);
            return;
        }
        let cType = itemId === 100 ? 'normal' : 'senior';
        DaoCommon.checkAccount(req.pool, token, function (error, account) {
            if (error) {
                data_util.handleReturn(res, aes, error, null, HINT);
                return;
            }
            let cost = cardCfg.price;
            if (account.gold < cost) {
                let errTip = string_strings_cfg['str_gold_not_enough'].cn;
                let result = {
                    change: {
                        gold: account.gold,
                        pearl: account.pearl,
                    },
                };
                data_util.handleReturn(res, aes, null, result, HINT);
                return;
            }
            let gainPearl = cardCfg.diamond;
            account.gold = -cost;//注意：gold是增量，正增加，负消耗
            account.pearl = gainPearl;
            account.cost = cost;//其他消耗 月卡消耗累加
            account.commit();

            //金币//钻石日志
            let itemList = [
                {
                    item_id: 'i001',
                    item_num: -cost,
                },
                {
                    item_id: 'i002',
                    item_num: gainPearl,
                }
            ];
            GameLog.addGameLog(itemList, account, common_log_const_cfg.CARD, HINT);

            //获得月卡
            let newCard = account.card;
            if (!newCard[cType]) {
                newCard[cType] = {};
            }
            newCard[cType].start_date = DateUtil.format(new Date(), 'yyyy-MM-dd');
            CacheAccount.setCard(account, newCard, function (chs) {
                let change = {
                    gold: account.gold,
                    pearl: account.pearl,
                };
                if (chs && chs.length == 2) {
                    let charmPoint = chs[0];
                    let charmRank = chs[1];
                    charmPoint >= 0 && (change.charm_point = charmPoint);
                    charmRank >= 0 && (change.charm_rank = charmRank);
                }
                let result = {
                    change: change,
                    card: newCard,
                    get_card: {
                        normal: false,
                        senior: false,
                    },
                };
                data_util.handleReturn(res, aes, null, result, HINT);
            });
        }.bind(this));


        //修改用户数据、保存
        //回调给客户端
        //---------------------------------
    }

    reward(req, res) {
        const FUNC = "MonthCard:reward --- ";
        const HINT = "领取月卡每日奖励";

        let aes = req.body.aes;
        let dataObj = data_util.parseDataObj(req, HINT);
        BuzzUtil.cacheLinkDataApi(dataObj, "month_card_reward");

        let token = dataObj.token;
        let itemId = dataObj.itemId;
        let type = CRAD_TYPE[itemId];//normal | senior

        DaoCommon.checkAccount(mysqlPool, token, function (error, account) {
            if (error) {
                data_util.handleReturn(res, aes, error, null, HINT);
                return;
            }
            doNext(account);
        });

        function doNext(account) {
            let uid = account.id;
            let get_card = account.get_card;
            let card = account.card;
            let everyday = 0;

            if (card[type]) {
                logger.info(FUNC + `${uid}的${type}月卡有效`);
                if (get_card[type]) {
                    let error = FUNC + `${uid}已经领取${type}月卡奖励, 请勿重复领取`;
                    data_util.handleReturn(res, aes, error, null, HINT);
                    logger.info(error);
                    return;
                }
                else {
                    get_card[type] = true;
                    everyday = CARD_DATA[itemId].everyday;
                }
            }
            else {
                let error = FUNC + `${uid}没有购买${type}月卡`;
                data_util.handleReturn(res, aes, error, null, HINT);
                logger.info(error);
                return;
            }

            let item_list = BuzzUtil.getItemList(everyday);
            let req = {pool: mysqlPool, dao: myDao};

            BuzzUtil.putIntoPack(req, account, item_list, function(rewardInfo) {
                account.get_card = get_card;
                account.commit();
                let change = BuzzUtil.getChange(account, rewardInfo);
                change.card = account.card;
                change.get_card = account.get_card;
                let ret = {
                    item_list: item_list,
                    change: change,
                };
                data_util.handleReturn(res, aes, null, ret, HINT);
                GameLog.addGameLog(item_list, account, common_log_const_cfg.CARD_REWARD, '月卡每日领取获得');
            });
        }

    }

}

// module.exports = MonthCard;
const month_card = new MonthCard();
module.exports.reward = month_card.reward;