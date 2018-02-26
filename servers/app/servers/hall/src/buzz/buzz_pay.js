const _ = require('underscore');
const CommonUtil = require('./CommonUtil');
const ObjUtil = require('./ObjUtil');
const BuzzUtil = require('../utils/BuzzUtil');
const CstError = require('./cst/buzz_cst_error');
const GameLog = require('../log/GameLog');
const mission = require('../mission/mission');
const MissionType = require('../mission/mission').MissionType;
const buzz_cst_sdk = require('./cst/buzz_cst_sdk');
const CHANNEL_ID = buzz_cst_sdk.CHANNEL_ID;
const buzz_sdk_tencent = require('./sdk/tencent');
const DaoCommon = require('../dao/dao_common');
const CacheAccount = require('./cache/CacheAccount');
const gameConfig = require('../../../../utils/imports').GAME_CFGS;
const ITEM_TYPE = gameConfig.shop_itemtype_const_cfg;
const common_log_const_cfg = gameConfig.common_log_const_cfg;
const shop_shop_buy_type_cfg = gameConfig.shop_shop_buy_type_cfg;
const ERROR_OBJ = CstError.ERROR_OBJ;
const logger = loggerEx(__filename);

let DEBUG = 0;
let ERROR = 1;

const TAG = "【buzz_pay】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.buy = buy;
exports.getGameOrder = getGameOrder;

exports.sig = sig;
exports.sort = sort;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 支付
 */
function buy(req_client, data, cb) {
    const FUNC = TAG + "buy() --- ";

    // 1. 参数验证
    if (!_prepare(data, cb)) return;

    let token = data["token"];
    let uid = token.split("_")[0];
    let channelid = data["channelid"];
    let itemid = data["itemid"];
    let itemtype = data["itemtype"];
    let channelItemId = itemid;

    CacheAccount.getAccountById(uid, function (err, account) {
        switch (channelid) {
            case CHANNEL_ID.WANBA:
                let zoneid = data.zoneid ? data.zoneid : 1;// 默认值
                channelItemId = buzz_sdk_tencent.getFunId(itemid, itemtype, zoneid);
                break;
        }
        data["itemid"] = channelItemId;
        data["id"] = itemid;

        console.log(FUNC + "itemid:", itemid);
        console.log(FUNC + "itemtype:", itemtype);
        console.log(FUNC + "玩吧配置的道具ID:", data.itemid);

        // 2. 订单生成
        getGameOrder(req_client, data, function (err, ret) {
            if (err) {
                cb(err);
                return;
            }
            if (ret == null) {
                // cb(new Error("订单生成失败"));
                cb(ERROR_OBJ.ORDER_CREATE_FAIL);
                return;
            }
            let game_order_id = ret.game_order_id;
            // 3. 第三方接口调用
            _callBuyApi(data, req_client, function (err, succ_chunk) {
                // 假数据: 可以跳过向支付服的请求
                // succ_chunk = {
                //     code:0,
                //     data:[
                //         {cost:1,billno:"test001"}
                //     ]
                // };
                // err = null;
                if (err) {
                    err.game_order_id = game_order_id;
                    console.log(FUNC + "购买失败, 记录到数据库, 可能是openid不合法");
                    cb(err);
                    return;
                }

                succ_chunk.game_order_id = game_order_id;//给客户端返回game_order_id
                if (succ_chunk.code != 0) {
                    console.log(FUNC + "购买失败, 记录到数据库");

                    // 购买失败, 记录到数据库.
                    let cdata = {
                        channel: channelid,
                        channel_cb: succ_chunk,
                        game_order_id: game_order_id,
                        goods_id: channelItemId,// 平台道具ID
                        goods_number: 1,// 购买数量总是为1
                        channel_account_id: data.openid,
                        money: 0,
                    };
                    req_client.dao.setOrderFail(cdata, function (err, results) {
                        cb(null, succ_chunk);
                    });
                }
                else {
                    // 购买成功, 记录到数据库.
                    console.log(FUNC + "购买成功, 记录到数据库");
                    console.log(FUNC + "succ_chunk:", succ_chunk);
                    /**
                     chunk: {
code: 0,
subcode: 0,
message: '',
default: 0,
data: [ { billno: '-8957_A500009_1_1490345431_45919313', cost: 2 } ] }
                     */
                        // 一个积分是0.1元
                    let money = succ_chunk.data[0].cost;
                    let billno = succ_chunk.data[0].billno;

                    let cdata = {
                        channel: channelid,
                        channel_cb: {
                            orderId: billno,
                            id: data.openid,
                            money: money, //价格: 元
                            goodsId: channelItemId,// 平台道具ID
                            goodsNumber: 1,// 购买数量总是为1
                        },
                        game_order_id: game_order_id
                    };

                    req_client.dao.changeOrderStatus(cdata, function (err, results) {
                        buySuccess(req_client, account, uid, token, itemid, game_order_id, function (err, item_info) {
                            if (err) {
                                cb(err);
                                return;
                            }
                            let ret = ObjUtil.merge(succ_chunk, item_info);
                            cb(null, ret);
                        });
                    });
                }
            });
        });
    });


}

/**
 * 获取订单号
 */
function getGameOrder(req, dataObj, cb) {
    if (dataObj.itemid) {
        dataObj.id = dataObj.itemid;
    }
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_game_order");

    _getGameOrder(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'id'], "buzz_pay", cb);
    }
}

function _getGameOrder(req, dataObj, cb) {
    const FUNC = TAG + "_getGameOrder() --- ";
    let uid = dataObj.uid;
    let token = dataObj.token;
    let shop_id = dataObj.id;
    let test = dataObj.test;
    let pool = req.pool;
    logger.info(FUNC + "test:", test);

    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        myDao.getGameOrder(dataObj, function (err, game_order_id) {
            if (err) {
                logger.error("获取玩家订单失败");
                cb(err);
                return;
            }
            logger.info("获取玩家订单成功");

            if (test) {
                buySuccess(req, account, uid, token, shop_id, game_order_id, cb);
            }
            else {
                logger.info(FUNC + "game_order_id:", game_order_id);
                let ret = {game_order_id: game_order_id};
                cb(null, ret);
            }
        });
    }
}

/**
 * 购买成功, 调用此方法获取物品
 */
function buySuccess(req, account, uid, token, shop_id, game_order_id, cb) {
    const FUNC = TAG + "buySuccess() --- ";
    let item_type = ITEM_TYPE.IT_PEARL;
    let item_amount = 0;
    let total = 0;
    let item_list = [];
    let price = 0;

    if (shop_id < 100) {
        let shop_pearl = BuzzUtil.getShopPearlById(shop_id);
        if (null == shop_pearl) {
            cb(ERROR_OBJ.BUY_WRONG_SHOP_ID);
            return;
        }

        item_type = ITEM_TYPE.IT_PEARL;
        total = account.pearl;
        item_amount = shop_pearl.item;
        price = shop_pearl.price;
        // first_buy判定进行首次充值的双倍发放.
        let first_buy = account.first_buy;
        if (typeof(first_buy["" + shop_id]) == "undefined") {
            first_buy["" + shop_id] = 0;
        }
        if (first_buy["" + shop_id] == 0) {
            // 玩家为首次购买
            item_amount *= 2;
            first_buy["" + shop_id] = 1;
        }

        total += item_amount;

        // yDONE: 取出对象操作后赋值给原数据.
        account.first_buy = first_buy;

        item_list = [{
            item_id: shop_shop_buy_type_cfg.BUY_RMB.id,
            item_num: item_amount,
        }];

        // first_buy_gift需要设置
    }
    else if (shop_id >= 100 && shop_id < 1000) {
        let shop_card = BuzzUtil.getShopCardById(shop_id);
        if (null == shop_card) {
            cb(ERROR_OBJ.BUY_WRONG_SHOP_ID);
            return;
        }
        price = shop_card.price;
        item_type = ITEM_TYPE.IT_CARD;
        total = account.pearl;
        item_list = [{
            item_id: "i002",
            item_num: shop_card.diamond,
        }];
        item_amount = 1;//shop_card.diamond;
        total += shop_card.diamond;
    }
    else if (shop_id >= 1000 && shop_id < 10000) {
        let shop_fund = BuzzUtil.getShopFundById(shop_id);
        if (null == shop_fund) {
            cb(ERROR_OBJ.BUY_WRONG_SHOP_ID);
            return;
        }
        let accountComeback = ObjUtil.str2Data(account.comeback);
        let cb_id = accountComeback['cb_id'];
        if (cb_id) {
            cb(ERROR_OBJ.BUY_FUND_ALREADY);
            return;
        }

        let hitrate = shop_fund.hitrate;
        accountComeback.cb_id = shop_id;
        accountComeback.hitrate = hitrate;
        price = shop_fund.price;
        item_type = ITEM_TYPE.IT_FUND;
        total = account.gold;
        item_list = [{
            item_id: "i001",
            item_num: shop_fund.gold,
        }];
        item_amount = shop_fund.gold;
        total += shop_fund.gold;
        account.comeback = accountComeback;
        account.commit();
    }
    else if (shop_id >= 10000) {
        let shop_gift = BuzzUtil.getShopGiftById(shop_id);
        if (null == shop_gift) {
            cb(ERROR_OBJ.BUY_WRONG_SHOP_ID);
            return;
        }
        price = shop_gift.price;
        let cur_time = new Date().getTime();
        let start_time = new Date(shop_gift.starttime).getTime();
        let end_time = new Date(shop_gift.endtime).getTime();
        if (cur_time < start_time || cur_time > end_time) {
            cb(ERROR_OBJ.BUY_WRONG_GIFT_TIME);
            return;
        }

        let buycount = shop_gift.buycount;
        let activityGift = account.activity_gift;
        if (typeof(activityGift["" + shop_id]) == "undefined") {
            activityGift["" + shop_id] = {
                buycount: 0,
                version: 1,
            };
        }
        let my_buycount = activityGift["" + shop_id].buycount;
        if (my_buycount >= buycount) {
            cb(ERROR_OBJ.BUY_GIFT_COUNT_MAX);
            return;
        }
        let shop_gift_reward = shop_gift.item;
        item_type = ITEM_TYPE.IT_GIFT;
        if (shop_gift_reward && shop_gift_reward.length > 0) {
            item_list = BuzzUtil.getItemList(shop_gift_reward);
        } else {
            cb && cb(ERROR_OBJ.BUY_GIFT_CFG_ERR);
            return;
        }
        item_amount = shop_gift_reward;
        activityGift["" + shop_id].buycount += 1;
        // yDONE: 取出activity_gift再赋值回原数据
        account.activity_gift = activityGift;
    }

    let log_data = {
        account_id: uid,
        token: token,
        item_id: shop_id,
        item_type: item_type,
        item_amount: item_amount,
        total: total,
        game_order_id: game_order_id,
    };


    logger.info(account.vip);
    logger.info(account.rmb);

    myDao.addShopLog(log_data, account, function (err, _account) {
        if (err) {
            cb(err);
            return;
        }

        let account = _account[0];

        account.commit();

        // 注意: addShopLog已经将购买的物品放入背包, 无需调用BuzzUtil.puIntoPack()
        let change = BuzzUtil.getChangeFromItemList(account, item_list);
        logger.info(FUNC + "change1:", change);
        change.vip = account.vip;
        change.rmb = account.rmb;
        change.vip_gift = account.vip_gift;
        change.vip_daily_reward = account.vip_daily_reward;
        change.card = account.card;
        change.get_card = account.get_card;
        change.first_buy = account.first_buy;
        change.activity_gift = account.activity_gift;
        change.gold_shopping = account.gold_shopping;
        change.charm_point = account.charm_point;
        change.charm_rank = account.charm_rank;
        change.comeback = account.comeback;

        logger.info(FUNC + "change2:", change);
        let ret = {
            game_order_id: game_order_id,
            item_list: item_list,
            change: change,
            itemId: shop_id,
            itemType: item_type,
        };
        cb(null, ret);

        let scene = common_log_const_cfg.TIMEGIFT_BUY;
        if (ITEM_TYPE.IT_FUND == item_type) scene = common_log_const_cfg.FUND_BUY;
        if (ITEM_TYPE.IT_PEARL == item_type) scene = common_log_const_cfg.STORE;
        if (ITEM_TYPE.IT_CARD == item_type) scene = common_log_const_cfg.BUY_CARD;//TODO DFC error
        let hint = '商城购买时获取';

        // yDONE: 金币数据记录
        let gain = 0;
        for (let i = 0; i < item_list.length; i++) {
            let item = item_list[i];
            let item_id = item.item_id;
            let item_num = item.item_num;
            if ('i001' == item_id) {
                gain += item_num;
            }
        }
        if (gain > 0) {
            GameLog.addGameLog(item_list, account, scene, hint);
        }

        // yDONE: 钻石数据记录
        let diamondGain = 0;
        for (let i = 0; i < item_list.length; i++) {
            let item = item_list[i];
            let item_id = item.item_id;
            let item_num = item.item_num;
            if ('i002' == item_id) {
                diamondGain += item_num;
            }
        }
        if (diamondGain > 0) {
            GameLog.addGameLog(item_list, account, scene, hint);
            //统计钻石充值dfc
            mission.add(account.id, MissionType.CHARG_PEARL, 0, price * 10);
            mission.add(account.id, MissionType.CHARG_PEARL, 1, price * 10);
        }
    });
}

//==============================================================================
// private
//==============================================================================

function _prepare(data, cb) {
    const FUNC = TAG + "_prepare() --- ";

    logger.info(FUNC + "data:", data);

    let channelid = data["channelid"];
    let itemid = data["itemid"];
    let itemtype = data["itemtype"];
    let openid = data["openid"];
    let openkey = data["openkey"];
    let zoneid = data["zoneid"];


    if (!CommonUtil.isParamExist("buzz_pay", channelid, "接口调用请传参数channelid(渠道ID, 用于选择渠道参数)", cb)) return false;
    if (!CommonUtil.isParamExist("buzz_pay", itemid, "接口调用请传参数itemid(物品ID, 玩吧需要映射到平台道具ID)", cb)) return false;
    if (!CommonUtil.isParamExist("buzz_pay", itemtype, "接口调用请传参数itemtype(物品类型, 决定了需要查找的配置表)", cb)) return false;
    if (channelid == buzz_cst_sdk.CHANNEL_ID.WANBA) {
        if (!CommonUtil.isParamExist("buzz_pay", openid, "接口调用请传参数openid(玩家在平台的唯一标识)", cb)) return false;
        if (!CommonUtil.isParamExist("buzz_pay", openkey, "接口调用请传参数openkey(玩家身份验证)", cb)) return false;
        if (!CommonUtil.isParamExist("buzz_pay", zoneid, "接口调用请传参数zoneid(Android-1, iOS-2)", cb)) return false;
    }
    else {
        // do nothing
    }

    return true;

}

function _callBuyApi(data, req_client, cb) {

    let channelid = data["channelid"];

    if (channelid == buzz_cst_sdk.CHANNEL_ID.WANBA) {
        //_callBuyApi_buy_playzone_item(data, req_client, cb);
        buzz_sdk_tencent.callBuyApi(data, req_client, cb);
    }
    else {
        // do nothing
    }
}

function sig(data, path) {

    buzz_sdk_tencent.sig(data, path);
}

/**
 * 输入: {key2:value2, key1:value1}
 * 输出: [[key1, value1], [key2, value2]]
 */
function sort(data) {

    // 对象转数组(_.pairs)
    // 数组排序(_.sortBy)
    return _.sortBy(_.pairs(data), function (item) {
        return item[0];
    });

}

