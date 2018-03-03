const _ = require('underscore');
const async = require('async');
const CommonUtil = require('./CommonUtil');
const BuzzUtil = require('../utils/BuzzUtil');
const RedisUtil = require('../utils/RedisUtil');
const CstError = require('./cst/buzz_cst_error');
const CacheAccount = require('./cache/CacheAccount');
const buzz_account = require('./buzz_account');
const buzz_reward = require('./buzz_reward');
const DaoCommon = require('../dao/dao_common');
const redisKeys = require('../../../database/consts').REDISKEY;
const gameConfig = require('../../../config').gameConfig;
const daily_dailypast_cfg = gameConfig.daily_dailypast_cfg;// 每日任务领取礼包的配置
const advert_advert_cfg = gameConfig.advert_advert_cfg;
const ERROR_OBJ = CstError.ERROR_OBJ;
const logger = loggerEx(__filename);

const TAG = "【buzz_gift】";

exports.getAdvGift = getAdvGift;
exports.getAdReward = getAdReward;
exports.getAdRewardTimes = getAdRewardTimes;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取玩家今日领取观看广告奖励的次数
 * @param {*} req 
 * @param {*} data 
 * @param {*} cb 
 */
function getAdRewardTimes(req, data, cb) {
    const FUNC = TAG + "getAdRewardTimes() --- ";
    logger.info(FUNC + "CALL...");

    if (!lPrepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "get_ad_reward_times");

    _getAdRewardTimes(req, data, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_gift", cb);
    }

}

function _getAdRewardTimes(req, data, cb) {
    const FUNC = TAG + "_getAdRewardTimes() --- ";

    let uid = data.uid;
    let token = data.token;

    DaoCommon.checkAccount(mysqlPool, token, function (error, account) {
        if (error) return cb(error);
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        RedisUtil.hget(redisKeys.ADV_REWARD_TIMES, uid, function (err, res) {
            if (err) return cb(err);
            if (!res) res = getAdvInit();
            cb(null, res);
        });
    }
}

/**
 * 获取观看广告的奖励
 */
function getAdReward(req, data, cb) {
    const FUNC = TAG + "getAdReward() --- ";
    logger.info(FUNC + "CALL...");

    if (!lPrepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "get_ad_reward");

    _getAdReward(req, data, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'type'], "buzz_gift", cb);
    }

}

// TODO: 读取配置表
const MAX_ADV_REWARD_TIMES = getAdvLimit();

function _getAdReward(req, data, cb) {
    const FUNC = TAG + "_getAdReward() --- ";

    let uid = data.uid;
    let token = data.token;
    let type = data.type;

    DaoCommon.checkAccount(mysqlPool, token, function (error, account) {
        if (error) return cb(error);
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        async.waterfall(
            [
                function step1(cb) {
                    RedisUtil.hget(redisKeys.ADV_REWARD_TIMES, uid, function (err, res) {
                        if (err){
                            logger.error(FUNC + "res:", res);
                            cb(err);
                            return ;
                        }
                        if (!res) {
                            res = getAdvInit();
                        }
                        else {
                            res = JSON.parse(res);
                        }
                        logger.info(FUNC + "res:", res);
                        cb(null, res);
                    });
                }
                , function step2(advRewardTimes, cb) {
                    logger.info(FUNC + "advRewardTimes:", advRewardTimes);
                    logger.info(FUNC + "MAX_ADV_REWARD_TIMES:", MAX_ADV_REWARD_TIMES);
                    if (advRewardTimes[type] >= MAX_ADV_REWARD_TIMES[type]) {
                        cb(ERROR_OBJ.ADV_REWARD_TIMES_FINISH);
                    }
                    else {
                        lGetReward(account, advRewardTimes, cb);
                    }
                }
            ],
            function next(err, ret) {
                cb && cb(err, ret);
            }
        );
    }

    function lGetReward(account, advRewardTimes, cb) {
        // TODO: 读取配置表
        let advCfg = getAdvCfg(type);
        let item_list = [];
        if(advCfg) {
            let reward = advCfg.reward;
            item_list = BuzzUtil.getItemList(reward);
        }
        else {
            cb(ERROR_OBJ.ADV_REWARD_TIMES_FINISH);
            return;
        }
        advRewardTimes[type]++;
        BuzzUtil.putIntoPack(req, account, item_list, function (rewardObj) {
            let change = BuzzUtil.getChange(account, rewardObj);
            let ret = {
                item_list: item_list,
                change: change,
                adv_reward_times: advRewardTimes,
            };
            cb(null, ret);
            RedisUtil.hset(redisKeys.ADV_REWARD_TIMES, uid, JSON.stringify(advRewardTimes));
        });
    }
}

function getAdvCfg(id) {
    for (let i = 0; i < advert_advert_cfg.length; i++) {
        let advCfg = advert_advert_cfg[i];
        if (advCfg.id == id) {
            return advCfg;
        }
    }
}

function getAdvInit() {
    const FUNC = TAG + "getAdvInit() --- ";
    let ret = {};
    for (let i = 0; i < advert_advert_cfg.length; i++) {
        let advCfg = advert_advert_cfg[i];
        ret[advCfg.id] = 0;
    }
    logger.info(FUNC + "ret:", ret);
    return ret;
}

function getAdvLimit() {
    let ret = {};
    for (let i = 0; i < advert_advert_cfg.length; i++) {
        let advCfg = advert_advert_cfg[i];
        ret[advCfg.id] = advCfg.limit;
    }
    return ret;
}

/**
 * 获取广告礼包
 */
function getAdvGift(req, data, cb) {
    const FUNC = TAG + "getAdvGift() --- ";

    logger.info(FUNC + "CALL function");

    if (!_prepare(data, cb)) return;

    let token = data.token;
    let gift_id = data.giftid;
    let gift_info = getGiftInfoFromId(gift_id);
    let reward = [gift_info.reward];

    // 验证账户
    buzz_account.check(req, data, function (err, account) {

        if (err) {
            logger.error(FUNC + "err:", err);
            cb(err);
            return;
        }

        logger.info(FUNC + "day_reward_adv:", account.day_reward_adv);
        if (account.day_reward_adv) {
            logger.error(FUNC + "玩家已经领取了今日礼包");
            cb(ERROR_OBJ.GIFT_ADV_GOTTEN);
            return;
        }

        let uid = account.id;

        if (gift_id == 910) {
            if (!account.new_reward_adv) {
                // 领取奖励
                buzz_reward.getReward(req, account, gift_info.reward, function (err, results) {

                    // 获取奖励成功
                    logger.info(FUNC + "获取新手奖励成功");

                    let data = {
                        table: "tbl_account",
                        field: "new_reward_adv",
                        value: 1,
                        id: uid,
                    };
                    // 设置day_reward_adv为已经领取(1)
                    myDao.setField(data, function (err, results) {
                        CacheAccount.setNewRewardAdv(uid, 1);
                        // 返回获取到的物品
                        // 获取玩家全部数据并返回
                        buzz_account.getAccountByToken(req, token, function (err, account) {
                            let ret = {
                                gold: account.gold,
                                pearl: account.pearl,
                                package: account.package,
                                skill: account.skill,
                            };
                            cb(null, ret);
                        });
                    });

                });
            }
            else {
                cb({ code: 1111111, msg: "你已经领取过新手礼包了" });
            }
        }
        else {
            // 领取奖励
            buzz_reward.getReward(req, account, reward, function (err, results) {

                // 获取奖励成功
                logger.info(FUNC + "获取奖励成功");

                let data = {
                    table: "tbl_account",
                    field: "day_reward_adv",
                    value: 1,
                    id: uid,
                };
                // 设置day_reward_adv为已经领取(1)
                myDao.setField(data, function (err, results) {
                    CacheAccount.setDayRewardAdv(uid, 1);
                    // 返回获取到的物品
                    // 获取玩家全部数据并返回
                    buzz_account.getAccountByToken(req, token, function (err, account) {
                        let ret = {
                            gold: account.gold,
                            pearl: account.pearl,
                            package: account.package,
                            skill: account.skill,
                        };
                        cb(null, ret);
                    });
                });

            });
        }
    });
}


//==============================================================================
// private
//==============================================================================

function _prepare(data, cb) {

    let token = data['token'];
    let giftid = data['giftid'];

    logger.info("token:", token);
    logger.info("giftid:", giftid);

    if (!CommonUtil.isParamExist("buzz_gift", token, "接口调用请传参数token", cb)) return false;
    if (!CommonUtil.isParamExist("buzz_gift", giftid, "接口调用请传参数giftid(广告礼包ID)", cb)) return false;

    return true;

}

function getGiftInfoFromId(id) {
    for (let idx in daily_dailypast_cfg) {
        if (daily_dailypast_cfg[idx].id == id) {
            return daily_dailypast_cfg[idx];
        }
    }
}
