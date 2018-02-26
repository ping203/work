/**
 * 打赏
 * Created by zhenghang on 2017/9/8.
 */
const BuzzUtil = require('../utils/BuzzUtil');
const DaoCommon = require('../dao/dao_common');
const dao_reward = require('../dao/dao_reward');
const DateUtil = require('../utils/DateUtil');
const RedisUtil = require('../utils/RedisUtil');
const async = require('async');
const redisSync = require('./redisSync');
const CacheAccount = require('./cache/CacheAccount');
const buzz_mail = require('./buzz_mail');
const buzz_cst_game = require('./cst/buzz_cst_game');
const CstError = require('./cst/buzz_cst_error');
const buzz_receive_flower = require('./buzz_receive_flower');
const ERROR_OBJ = CstError.ERROR_OBJ;
const redisKeys = require('../../../../database').dbConsts.REDISKEY;
const logger = loggerEx(__filename);

exports.give_reward = give_reward;

const TAG = "【buzz_reward_people】";

function give_reward(req, dataObj, cb) {
    const FUNC = TAG + "give_reward() --- ";
    if (!lPrepare(dataObj)) return;
    //BuzzUtil.cacheLinkDataApi(dataObj, "give_reward");

    _give_reward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'items', 'id'], "buzz_reward_people", cb);
    }
}

function _give_reward(req, dataObj, cb) {
    const FUNC = TAG + "_give_reward() --- ";
    logger.info(FUNC + "CALL...");
    let token = dataObj.token;
    let needitem = dataObj.items;
    let id = dataObj.id;
    if (id == token.split("_")[0]) {
        cb("不能打赏自己");
        return;
    }
    let pool = req.pool;
    let itemid = needitem[0][0];
    let itemcount = needitem[0][1];
    //获取中文名
    let name = BuzzUtil.getCNName(BuzzUtil.getItemById(itemid).name);
    logger.info("dataObj", dataObj);

    //检查物品是否可以打赏
    if (!BuzzUtil.isCanGiveItem(needitem)) {
        cb(ERROR_OBJ.PARAM_MISSING);
        return;
    }
    let charm_change = false;

    async.waterfall([function (cb) {
            DaoCommon.checkAccount(pool, token, cb);
        }, function (account, cb) {
            if (BuzzUtil.isBomb(itemid) && BuzzUtil.getVipGiveItem(account.vip) != 1) {
                cb(ERROR_OBJ.VIP_NOT_ENOUFH);
                return;
            }
            RedisUtil.hget(redisKeys.MSG.IS_REWARD_PEOPLE, account.id, function (err, rows) {
                cb(err, rows, account);
            });
        }, function (rows, account, cb) {
            rows = rows && JSON.parse(rows) || {};
            if (rows[id + "_" + itemid + "_" + itemcount] == 1) {
                cb(ERROR_OBJ.CHAT_REWARD_ERROR);
                return;
            }
            costRewardPeople(req, account, needitem, true, function (cost_info) {
                if (cost_info == 1 || cost_info == 2) {
                    cb(ERROR_OBJ.CHAT_REWARD_LESS_ERROR);
                    return;
                }
                cb(null, rows, account, cost_info);
            });
        }, function (rows, account, cost_info, cb) {
            let nick = account.channel_account_name;
            if (!nick || nick == "") nick = account.nickname;
            if (!nick || nick == "") nick = account.tempname;
            //将i400修改为i410
            let sendMailItem = [[itemid == 'i400' ? 'i410' : itemid, itemcount]];
            let need = JSON.stringify(sendMailItem);
            let data = {
                player_list: "" + id,
                type: 3,
                title: "好友打赏",
                content: nick + "玩家打赏了你" + name + " x " + itemcount,
                reward: need
            };
            buzz_mail.sendMail(req, data, function (err, res) {
                cb(err, rows, account, cost_info, sendMailItem);
            });
        }, function (rows, account, cost_info, sendMailItem, cb) {
            let val = id + "_" + itemid + "_" + itemcount;
            rows[val] = 1;
            RedisUtil.hset(redisKeys.MSG.IS_REWARD_PEOPLE, account.id, JSON.stringify(rows));
            RedisUtil.expire(redisKeys.MSG.IS_REWARD_PEOPLE, DateUtil.getNexyDayBySeconds());
            //统计送出的鲜花
            buzz_receive_flower.flower_send(account.id, sendMailItem, function (total) {
                //增加送出鲜花上限3000点
                if (total <= 3000) {
                    CacheAccount.resetCharmPoint(account);
                    charm_change = true;
                }
            });
            redisSync.getAccountById(id, function (err, res) {

                if (BuzzUtil.isNotice(needitem)) {
                    cb(err, res, account, cost_info);
                } else {
                    cb(null, null, account, cost_info);
                }
            });


        }, function (res, account, cost_info, cb) {
            if (res) {
                let nick1 = res.nickname;
                //参数顺序是：打赏人名字，物品name，物品数量，被打赏人名字，vip,  魅力等级
                let nick = account.channel_account_name;
                if (!nick || nick == "") nick = account.nickname;
                if (!nick || nick == "") nick = account.tempname;
                let params = [nick, name, itemcount, nick1, account.vip, account.charm_rank];
                let content = {
                    type: buzz_cst_game.GAME_EVENT_TYPE.REWARD_PEOPLE,
                    txt: "",
                    times: 1,
                    params: params,
                    platform: account.platform,
                    uid: account.id
                };
                buzz_cst_game.addBroadcastGameEvent(content);
            }
            cb(null, account, cost_info);
        }], function (err, account, cost_info) {
            if (err) {
                cb(err);
                return;
            }
            let change = BuzzUtil.getChange(account, cost_info);
            if (charm_change) {
                change.charm_point = account.charm_point;
                change.charm_rank = account.charm_rank;
            }
            let ret = {
                //item_list: item_list,
                change: change
            };
            cb(null, ret);
        }
    );

}

function costRewardPeople(req, account, needitem, is_cost_diamonds, cb) {
    const FUNC = TAG + "costRewardPeople() --- ";
    //判断是否足够
    if (dao_reward.enough(account, needitem)) {
        //物品扣除
        let item_list = [{
            item_id: needitem[0][0],
            item_num: needitem[0][1]
        }];
        BuzzUtil.removeFromPack(req, account, item_list, cb);
    }
    //判断是否使用钻石
    else if (is_cost_diamonds) {
        let cost = BuzzUtil.rewardPeopleCostByDiamonds(needitem);
        if (cost && dao_reward.enough(account, [['i002', cost]])) {
            let item_list = [{
                item_id: "i002",
                item_num: cost
            }];
            BuzzUtil.removeFromPack(req, account, item_list, cb);
        } else {
            //钻石不足，返回
            cb(1);
        }
    }
    //物品不足，返回
    else {
        cb(2);
    }
}