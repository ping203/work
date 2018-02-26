const _ = require('underscore');
const BuzzUtil = require('../utils/BuzzUtil');
const CacheAccount = require('../buzz/cache/CacheAccount');
const AccountCommon = require('./account/common');
const DateUtil = require('../utils/DateUtil');
const DaoCommon = require('./dao_common');
const DaoMail = require('./dao_mail');
const gameConfig = require('../../../../utils/imports').GAME_CFGS;
const ITEM_TYPE = gameConfig.shop_itemtype_const_cfg;
const shop_shop_buy_type_cfg = gameConfig.shop_shop_buy_type_cfg;
const buzz_cst_sdk = require('../buzz/cst/buzz_cst_sdk');
const sdk_egret = require('../buzz/sdk/egret');
const dao_reward = require('./dao_reward');
const logger = loggerEx(__filename);

const TAG = "【dao_shop】";

const MAIL_TYPE = DaoMail.MAIL_TYPE;

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getGameOrder = _getGameOrder;
exports.checkOrderStatus = _checkOrderStatus;
exports.changeOrderStatus = _changeOrderStatus;
exports.setOrderFail = setOrderFail;

exports.addShopLog = addShopLog;


//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取订单.
 */
function _getGameOrder(pool, data, cb) {
    //let account_id = data['account_id'];
    let token = data['token'];

    // 错误检验
    //if (account_id == null) {
    //    cb(new Error('接口调用请传参数account_id(玩家ID)'));
    //    return;
    //}
    if (token == null) {
        logger.error("接口调用请传参数token");
        cb(new Error('接口调用请传参数token'));
        return;
    }

    // 检查账户的合法性
    DaoCommon.checkAccount(pool, token, function (err, account) {
        if (err) {
            cb(err);
            return;
        }

        _didGetGameOrder(pool, data, cb);
    });
}

// 查询当日最大序列号(sn), 并在此基础上+1作为新的序列号(订单号是日期字符串加上序列号，有唯一性约束)
function _didGetGameOrder(pool, data, cb) {

    let token = data['token'];
    let shop_id = data['id'];
    let uid = token.split("_")[0];

    let sql = '';
    sql += 'SELECT MAX(`sn`) AS max_sn ';
    sql += 'FROM `tbl_order` ';
    sql += 'WHERE TO_DAYS(NOW()) = TO_DAYS(`created_at`)';

    let sql_data = [];

    logger.info('sql: ', sql);
    logger.info('sql_data: ', sql_data);

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            logger.error('[ERROR] dao_shop._didGetGameOrder()');
            logger.error(JSON.stringify(err));
            cb(err);
        } else {
            logger.info('result: ', result);

            let sn = 0;

            // 今日有订单
            if (result.length > 0) {
                sn = result[0]["max_sn"] + 1;
            }
            logger.info("sn: " + sn);

            _insertOrder(pool, uid, shop_id, sn, cb);

        }
    });
}

// 在tbl_order表中插入一条订单数据
function _insertOrder(pool, uid, shop_id, sn, cb) {
    const FUNC = TAG + "_insertOrder() --- ";
    let game_order_id = BuzzUtil.getOrderId(sn);

    let sql = '';
    sql += 'INSERT INTO `tbl_order` ';
    sql += '(`game_account_id`, `sn`, `game_order_id`) ';
    sql += 'VALUES (?,?,?)';
    let sql_data = [uid, sn, game_order_id];

    logger.info(FUNC + 'sql:\n', sql);
    logger.info(FUNC + 'sql_data:\n', sql_data);

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            logger.error(FUNC + '[ERROR] err:\n', err);
            cb(err);
        } else {
            logger.info(FUNC + 'game_order_id:', game_order_id);
            cb(null, game_order_id);
        }
    });
}

/**
 * 检测订单状态
 */
function _checkOrderStatus(pool, data, cb) {
    // let account_id = data['account_id'];
    let token = data['token'];
    let game_order_id = data['game_order_id'];

    // 错误检验
    // if (account_id == null) {
    //     cb(new Error('接口调用请传参数account_id(玩家ID)'));
    //     return;
    // }
    if (token == null) {
        cb(new Error('接口调用请传参数token'));
        return;
    }
    if (game_order_id == null) {
        cb(new Error('接口调用请传参数game_order_id'));
        return;
    }

    // 检查账户的合法性
    DaoCommon.checkAccount(pool, token, function (err, account) {
        if (err) {
            cb(err);
            return;
        }

        _didCheckOrderStatus(pool, data, account, cb);
    });
}

// 参数检查完毕后进行订单状态查询
function _didCheckOrderStatus(pool, data, account, cb) {
    let token = data['token'];
    let account_id = token.split("_")[0];
    let game_order_id = data['game_order_id'];

    let sql = '';
    sql += 'SELECT * ';
    sql += 'FROM `tbl_order` ';
    sql += 'WHERE game_order_id=? AND game_account_id=?';
    logger.info('sql: ', sql);

    let sql_data = [game_order_id, account_id];

    logger.info('game_order_id: ', game_order_id);
    logger.info('account_id: ', account_id);

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            logger.error('[ERROR] dao_shop._didCheckOrderStatus()');
            logger.error(JSON.stringify(err));
            cb(err);
        } else {
            logger.info('result: ', result);

            // 订单存在，返回订单状态
            if (result.length > 0) {
                let result = result[0];
                if (0 == result.status) {
                    let change = {};
                    change.gold = account.gold;
                    change.pearl = account.pearl;
                    change.vip = account.vip;
                    change.rmb = account.rmb;
                    change.vip_gift = account.vip_gift;
                    change.card = account.card;
                    change.get_card = account.get_card;
                    change.first_buy = account.first_buy;
                    change.activity_gift = account.activity_gift;
                    change.gold_shopping = account.gold_shopping;
                    change.comeback = account.comeback;

                    result.change = change;
                    result.itemId = result.goods_id;
                }
                cb(null, result);
            }
            // 订单不存在，返回错误信息
            else {
                let err_order_not_exist = new Error("订单不存在(订单号:" + game_order_id + ",订单账号:" + account_id + ")");
                cb(err_order_not_exist);
            }

        }
    });
}

/**
 * 改变订单状态
 */
function _changeOrderStatus(pool, data, cb) {
    let channel_cb = data['channel_cb'];
    let game_order_id = data['game_order_id'];

    // 错误检验
    if (channel_cb == null) {
        cb(new Error('接口调用请传参数channel_cb(渠道的回调信息)'));
        return;
    }
    if (game_order_id == null) {
        cb(new Error('接口调用请传参数game_order_id(游戏订单ID)'));
        return;
    }

    _didChangeOrderStatus(pool, data, cb);
}

function setOrderFail(pool, data, cb) {
    const FUNC = TAG + "setOrderFail() --- ";

    let channel_cb = data['channel_cb'];
    let game_order_id = data['game_order_id'];
    let channel = data['channel'];
    let goods_id = data['goods_id'];
    let goods_number = data['goods_number'];
    let channel_account_id = data['channel_account_id'];
    let money = data['money'];

    if (channel == buzz_cst_sdk.CHANNEL_ID.WANBA) {
        let sql = '';
        sql += 'UPDATE `tbl_order` ';
        sql += 'SET `status`=?, `channel_cb`=?, `channel`=?, `goods_id`=?, `goods_number`=?, `channel_account_id`=?, `money`=? ';
        sql += 'WHERE game_order_id=?';
        logger.info(FUNC + 'sql: ', sql);

        let sql_data = [
            1,
            JSON.stringify(channel_cb),
            channel,
            goods_id,
            goods_number,
            channel_account_id,
            money,
            game_order_id
        ];

        pool.query(sql, sql_data, function (err, result) {
            if (err) {
                logger.error(FUNC + '[ERROR] err:', err);
                return;
            }
            logger.info('result: ', result);
            cb(null, "ok");
            return;
        });
    }
    else {
        cb(new Error("not supported channel!!"));
    }
}

// 参数检查完毕后进行订单状态更新
function _didChangeOrderStatus(pool, data, cb) {
    const FUNC = TAG + "_didChangeOrderStatus() --- ";

    let channel_cb = data['channel_cb'];
    let game_order_id = data['game_order_id'];
    let channel = data['channel'];

    // 从channel_cb中获取的参数
    let channel_order_id = channel_cb.orderId;
    let channel_account_id = channel_cb.id;
    let money = channel_cb.money;
    let time = channel_cb.time;
    let serverId = channel_cb.serverId;
    let goods_id = channel_cb.goodsId;
    let goods_number = channel_cb.goodsNumber;
    let sign = channel_cb.sign;

    logger.info(FUNC + "orderId: " + channel_order_id);
    logger.info(FUNC + "id: " + channel_account_id);
    logger.info(FUNC + "money: " + money);
    logger.info(FUNC + "time: " + time);
    logger.info(FUNC + "serverId: " + serverId);
    logger.info(FUNC + "goodsId: " + goods_id);
    logger.info(FUNC + "goodsNumber: " + goods_number);
    logger.info(FUNC + "sign: " + sign);

    let sql = '';
    sql += 'UPDATE `tbl_order` ';
    sql += 'SET `status`=?, `channel_order_id`=?, `channel_account_id`=?, `goods_id`=?, `goods_number`=?, `money`=?, `channel_cb`=?, `channel`=? ';
    sql += 'WHERE game_order_id=?';
    logger.info(FUNC + 'sql: ', sql);

    let sql_data = [
        0,
        channel_order_id,
        channel_account_id,
        goods_id,
        goods_number,
        money,
        JSON.stringify(channel_cb),
        channel,
        game_order_id
    ];

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            logger.error(FUNC + '[ERROR] err:', err);
        } else {
            logger.info(FUNC + 'result: ', result);
            cb(null, "ok");
            sdk_egret.notifyPayment(channel_account_id, channel_order_id, money / 10);
        }
    });
}

/**
 * 增加一条商城流水记录
 */
function addShopLog(pool, data, account, cb) {
    const FUNC = TAG + "addShopLog() --- ";
    let account_id = data['account_id'];
    let token = data['token'];
    let item_id = data['item_id'];
    let item_type = data['item_type'];
    let item_amount = data['item_amount'];
    let total = data['total'];
    let game_order_id = data['game_order_id'];

    // 错误检验
    if (account_id == null) {
        cb(new Error('接口调用请传参数account_id(玩家ID)'));
        return;
    }
    if (token == null) {
        cb(new Error('接口调用请传参数token'));
        return;
    }
    if (item_id == null) {
        cb(new Error('接口调用请传参数item_id(商品ID)'));
        return;
    }
    if (item_type == null) {
        let err_msg = '接口调用请传参数item_type(商品类型';
        err_msg += ': 礼品-' + ITEM_TYPE.IT_GIFT;
        err_msg += ', 金币-' + ITEM_TYPE.IT_GOLD;
        err_msg += ', 钻石-' + ITEM_TYPE.IT_PEARL;
        err_msg += ', 月卡-' + ITEM_TYPE.IT_CARD;
        err_msg += ', 翻盘-' + ITEM_TYPE.IT_FUND;
        err_msg += ')';
        cb(new Error(err_msg));
        return;
    }
    if (item_amount == null) {
        cb(new Error('接口调用请传参数item_amount(商品数量)'));
        return;
    }
    if (total == null) {
        cb(new Error('接口调用请传参数total(当前拥有的该类商品总量，用于校验)'));
        return;
    }
    //if (game_order_id == null) {
    //    cb(new Error('接口调用请传参数game_order_id(游戏订单号, 用于和订单表进行一一对应)'));
    //    return;
    //}

    item_id = parseInt(item_id);
    item_type = parseInt(item_type);
    item_amount = parseInt(item_amount);
    total = parseInt(total);

    if (isNaN(item_id)) {
        cb(new Error('item_id字段请勿输入非数值'));
        return;
    }
    if (isNaN(item_type)) {
        cb(new Error('item_type字段请勿输入非数值'));
        return;
    }
    if (item_type != ITEM_TYPE.IT_GIFT) {
        // 非礼包才判断是否为数值
        if (isNaN(item_amount)) {
            cb(new Error('item_amount字段请勿输入非数值'));
            return;
        }
        if (isNaN(total)) {
            cb(new Error('total字段请勿输入非数值'));
            return;
        }
    }

    // 检查账户的合法性
    logger.info(FUNC + "card:", account.card);
    _didAddShopLog(pool, data, account, cb);
}

// 根据传入的item_type获取配置文件的导入路径
function _getCfgPath(item_type) {
    const FUNC = TAG + "_getCfgPath() --- ";

    let gameConfig = require('../../../../utils/imports').GAME_CFGS;
    let cfg_path = null;
    switch (item_type) {
        case ITEM_TYPE.IT_GIFT:
            logger.info(FUNC + "ITEM_TYPE.IT_GIFT");
            cfg_path = 'shop_gift_cfg';
            break;
        case ITEM_TYPE.IT_GOLD:
            logger.info(FUNC + "ITEM_TYPE.IT_GOLD");
            cfg_path = 'shop_gold_cfg';
            break;
        case ITEM_TYPE.IT_PEARL:
            logger.info(FUNC + "ITEM_TYPE.IT_PEARL");
            cfg_path = 'shop_pearl_cfg';
            break;
        case ITEM_TYPE.IT_CARD:
            logger.info(FUNC + "ITEM_TYPE.IT_CARD");
            cfg_path = 'shop_card_cfg';
            break;
        case ITEM_TYPE.IT_FUND:
            logger.info(FUNC + "ITEM_TYPE.IT_FUND");
            cfg_path = 'shop_fund_cfg';
            break;
        default:
            logger.info(FUNC + "item_type错误, 默认使用shop_pearl_cfg...");
            cfg_path = 'shop_pearl_cfg';
            break;
    }

    return gameConfig[cfg_path];
}

// 验证后加入一条log
function _didAddShopLog(pool, data, account, cb) {
    const FUNC = TAG + "_didAddShopLog() --- ";

    let nickname = (account.nickname != null);

    let account_id = data['account_id'];
    let item_id = data['item_id'];
    let item_type = data['item_type'];
    let item_amount = data['item_amount'];
    let total = data['total'];
    let game_order_id = data['game_order_id'];

    item_id = parseInt(item_id);
    item_type = parseInt(item_type);
    item_amount = parseInt(item_amount);
    if (isNaN(item_amount)) {
        // 组合礼包直接将此字段设置为1
        item_amount = 1;
    }
    total = parseInt(total);

    // TODO: 从shop_gold_cfg中查询对应ID的物品价格
    let price = 0;
    let cfg_list = _getCfgPath(item_type);
    for (let i = 0; i < cfg_list.length; i++) {
        let item = cfg_list[i];
        if (item.id == item_id) {
            price = item.price * 100;// 配置表中的单位是元，转换到数据库中使用分为单位(INT)
        }
    }

    let sql = '';
    sql += 'INSERT INTO `tbl_shop_log` ';
    sql += '(`account_id`,`item_id`,`item_type`,`item_amount`, `price`, `nickname`, `order_id`) ';
    sql += 'VALUES (?,?,?,?,?,?,?)';
    logger.info(FUNC + 'sql: ', sql);

    let sql_data = [account_id, item_id, item_type, item_amount, price, nickname, game_order_id];

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            logger.error(FUNC + '[ERROR] err:\n', err);
            cb(err);
        } else {
            logger.info(FUNC + 'result: ', result);

            _updateAccountRmb(pool, account_id, price, account, function (err_update_rmb, result_update_rmb, charmPoint, charmRank) {
                logger.info('------DD---charmPoint = ', charmPoint, charmRank);
                if (err_update_rmb) {
                    logger.info(FUNC + "err_update_rmb");
                    cb(err_update_rmb);
                    return;
                }
                logger.info(FUNC + "item_type: " + item_type);

                if (item_type == ITEM_TYPE.IT_GIFT) {
                    _updateItem(pool, data, account, cb);
                }
                else if (item_type == ITEM_TYPE.IT_GOLD) {
                    _updateGoldTable(pool, data, account, cb);
                }
                else if (item_type == ITEM_TYPE.IT_PEARL) {
                    _updatePearlTable(pool, data, account, cb);
                    //给邀请者发邮件奖励(10%)
                    _mailMyInvitorWhenChargeSuccess(pool, data, cfg_list, account);
                }
                else if (item_type == ITEM_TYPE.IT_CARD) {
                    _updateCardData(pool, data, account, cfg_list, cb);
                }
                else if (item_type == ITEM_TYPE.IT_FUND) {
                    _updateFundData(pool, data, account, cb);
                }
                else {
                    let errInfo = "不支持的商品类型(";
                    errInfo += "礼品-" + ITEM_TYPE.IT_GIFT;
                    errInfo += "|金币-" + ITEM_TYPE.IT_GOLD;
                    errInfo += "|珍珠-" + ITEM_TYPE.IT_PEARL;
                    errInfo += "|月卡-" + ITEM_TYPE.IT_CARD;
                    errInfo += "|翻盘-" + ITEM_TYPE.IT_FUND;
                    errInfo += ")";
                    logger.info(FUNC + errInfo);
                    cb(new Error(errInfo));
                }
            });
        }
    });
};

/**
 * 当我充值成功时, 向我的邀请者发送一封奖励邮件(10%我充值的钻石数).
 * @param data 可获取uid, item_id
 */
function _mailMyInvitorWhenChargeSuccess(pool, data, shop_pearl_cfg, account) {
    const FUNC = TAG + "_mailMyInvitorWhenChargeSuccess() --- ";
    //--------------------------------------------------------------------------

    if (account.who_invite_me != 0) {
        let who_invite_me = account.who_invite_me;
        let uid = data['account_id'];
        let item_id = data['item_id'];

        let item = getItemFromShopCfg(item_id, shop_pearl_cfg);
        if (item) {
            let pearl_num = item.item;
            let pearl_num_mail = pearl_num / 10;
            // 向who_invite_me发送邮件.
            logger.info("向玩家" + who_invite_me + "发送奖励邮件");

            data = {
                title: "奖励邮件",
                content: "你的好友充值" + pearl_num + "钻, 你作为邀请者获得奖励" + pearl_num_mail + "钻",
                reward: '[["i002",' + pearl_num_mail + ']]',
                type: MAIL_TYPE.SPECIFY,
                player_list: "" + who_invite_me,
            };
            DaoMail.sendMail(pool, data, function (err, result) {
                logger.info(FUNC + "err:", err);
                logger.info(FUNC + "result:", result);
            });
        }
    }
    else {
        logger.info("没有邀请者, 什么都不用做");
    }
}

/**
 * 查询shop表中的元素.
 */
function getItemFromShopCfg(item_id, cfg) {
    for (let idx in cfg) {
        let item = cfg[idx];
        if (item.id == item_id) {
            return item;
        }
    }
    return null;
}

// 更新tbl_account中的rmb字段
function _updateAccountRmb(pool, uid, price, account, cb) {
    const FUNC = TAG + "_updateAccountRmb() --- ";
    logger.info(FUNC + "price:", price);

    let vip_vip_cfg = require('../../../../utils/imports').GAME_CFGS.vip_vip_cfg;

    let prev_vip = account.vip;
    let prev_rmb = account.rmb;
    let prev_pfft = account.pfft_at;
    let curr_rmb = prev_rmb + price;
    let curr_vip = prev_vip;
    for (let key in vip_vip_cfg) {
        let value = vip_vip_cfg[key];
        if (value.vip_unlock * 100 <= curr_rmb) {
            curr_vip = value.vip_level;
        }
    }
    account.rmb = curr_rmb;
    if (prev_pfft == null) {
        account.pfft_at = new Date();
    }
    if (curr_vip > prev_vip) {
        account.vip_daily_reward = 0;
    }
    account.commit();
    // CacheAccount.updateActiveCharge(account, price / 10);
    let cpoint = -1;
    let crank = -1;
    CacheAccount.setVip(account, curr_vip, function (chs) {
        if (chs && chs.length == 2) {
            chs[0] != null && chs[0] >= 0 && (cpoint = chs[0]);
            chs[1] != null && chs[1] >= 0 && (crank = chs[1]);
        }
        cb(null, 1, cpoint, crank);
    });
}

function _getAccountRmb(pool, uid, cb) {
    let sql = '';
    sql += 'SELECT `vip`, `rmb`, `pfft_at` ';
    sql += 'FROM `tbl_account` ';
    sql += 'WHERE `id`=?';
    logger.info('sql: ', sql);

    let sql_data = [uid];
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            logger.error('[ERROR] dao_shop._getAccountRmb()');
            logger.error(JSON.stringify(err));
        }
        cb(err, result);
    });
}

/**
 * 更新限时礼包，注意礼包内容可包含金币、钻石、技能等
 */
function _updateItem(pool, data, account, cb) {
    const FUNC = TAG + "_updateItem() --- ";
    let account_id = data['account_id'];
    let item_amount = data['item_amount'];
    if (account && item_amount && item_amount.length > 0) {
        dao_reward.getReward(pool, account, item_amount, function (err, result) {
            if (err) {
                logger.error(FUNC + " err:\n", err);
                return;
            }
            cb(null, [account]);
        });
    } else {
        logger.info(FUNC + '商城限时礼包数据有误，无法更新缓存数据.');
    }


}

// 更新tbl_gold表中的current_total, shop_count, shop_amount字段
function _updateGoldTable(pool, data, account, cb) {
    const FUNC = TAG + "_updateGoldTable() --- ";
    let uid = data['account_id'];
    let item_id = data['item_id'];
    let item_type = data['item_type'];
    let item_amount = data['item_amount'];
    let total = data['total'];

    item_id = parseInt(item_id);
    item_type = parseInt(item_type);
    item_amount = parseInt(item_amount);
    total = parseInt(total);
    logger.info(FUNC + "total: " + total);

    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    let inc_gold = total - account.gold;
    if (inc_gold > 0) {
        account.gold = inc_gold;
    }

    //--------------------------------------------------------------------------

    let sql = '';
    sql += 'UPDATE `tbl_account` a, `tbl_gold` g ';
    sql += 'SET g.`current_total`=?, g.`shop_count`=`shop_count`+1, g.`shop_amount`=`shop_amount`+?, a.`gold`=? ';
    sql += 'WHERE g.`account_id`=? AND a.`id`=?';
    let sql_data = [total, item_amount, total, uid, uid];

    logger.info(FUNC + 'sql: ', sql);
    logger.info(FUNC + 'sql_data: ', sql_data);

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            logger.error(FUNC + 'err:', err);
            cb(err);
        } else {
            logger.info(FUNC + 'gold result: ', result);
            // DONE: 需要返回用户数据更新客户端界面
            cb(null, [account]);
        }
    });
}

// 更新tbl_pearl表中的current_total, shop_count, shop_amount字段
function _updatePearlTable(pool, data, account, cb) {
    const FUNC = TAG + "_updatePearlTable() --- ";

    let item_amount = data['item_amount'];
    item_amount = parseInt(item_amount);

    let coinId = shop_shop_buy_type_cfg.BUY_RMB.id;
    BuzzUtil.addCoin(account, coinId, item_amount, function (err, res) {
        cb(null, [account]);
    });
}

// 更新tbl_account的card字段以及common_const_cfg中配置的月卡获取物品
function _updateCardData(pool, data, account, cfg_list, cb) {
    const FUNC = TAG + "_updateCardData() --- ";
    logger.info(FUNC + "CALL ...");

    let account_id = data['account_id'];
    let item_id = data['item_id'];

    item_id = parseInt(item_id);
    let start_date = DateUtil.format(new Date(), 'yyyy-MM-dd');
    logger.info(FUNC + "start_date = " + start_date);

    // 普通月卡
    if (item_id == 100) {
        logger.info(FUNC + "CALL _updateNormalCard()");
        _updateNormalCard(pool, data, account, cb, start_date, cfg_list[0]);
    }
    else if (item_id == 101) {
        logger.info(FUNC + "CALL _updateSeniorCard");
        _updateSeniorCard(pool, data, account, cb, start_date, cfg_list[1]);
    }
    else {
        // TODO: 不支持的月卡类型，错误提示
        let err_msg = '[ERROR] dao_shop._updateCardData(): 不支持的月卡类型'
        logger.error(err_msg);
        cb(err_msg);
    }
    // TODO
}

function _updateFundData(pool, data, account, cb) {
    let total = data['total'];
    account.gold = total;
    account.commit();
    cb(null, [account]);
}

// 更新tbl_account中的card.normal以及common_const_cfg中配置的普通月卡获取物品
function _updateNormalCard(pool, data, account, cb, start_date, update_items) {
    _updateCardCommon(pool, data, account, cb, start_date, update_items, "normal");
}

// 更新tbl_account中的card.senior以及common_const_cfg中配置的壕月卡获取物品
function _updateSeniorCard(pool, data, account, cb, start_date, update_items) {
    _updateCardCommon(pool, data, account, cb, start_date, update_items, "senior");
}

function _updateCardCommon(pool, data, account, cb, start_date, update_items, card_type) {
    const FUNC = TAG + "_updateCardCommon() --- ";

    logger.info(FUNC + "dao_shop._update_" + card_type + "Card()");
    let uid = data['account_id'];
    // 数据库中已有对应的月卡信息，判断上次购买的月卡日期是否还有效
    if (AccountCommon.isCardValid(card_type)) {
        // 玩家已经购买月卡且月卡还在有效期内，报错返回.
        let err_msg = '[ERROR] 玩家已经购买月卡且月卡还在有效期内，请月卡到期后再购买';
        logger.error(FUNC + err_msg);
        cb(err_msg);
        return;
    }

    let accOldCard = account.card;
    let newCard = {};
    accOldCard.normal && (newCard.normal = accOldCard.normal);
    accOldCard.senior && (newCard.senior = accOldCard.senior);
    newCard[card_type] = {"start_date": start_date};

    //获取cfg_list中需要更新的物品
    logger.info(FUNC + 'update_items: ', update_items);
    let diamond = update_items["diamond"];

    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    account.pearl += diamond;

    CacheAccount.setCard(account, newCard);
    //--------------------------------------------------------------------------

    let sql = '';
    sql += 'UPDATE `tbl_account` a, `tbl_pearl` p ';
    sql += 'SET p.`current_total`=p.`current_total`+?, p.`shop_count`=p.`shop_count`+1, p.`shop_amount`=p.`shop_amount`+?, ';
    sql += 'a.`pearl`=a.`pearl`+?, a.`card`=? ';
    sql += 'WHERE a.`id`=?';
    let sql_data = [diamond, diamond, diamond, JSON.stringify(newCard), uid];

    logger.info(FUNC + "sql: ", sql);
    logger.info(FUNC + "sql_data: ", sql_data);

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            logger.error(FUNC + "[ERROR] dao_shop._update_" + card_type + "Card(), err:", err);
            cb(err);
        } else {
            logger.info(FUNC + "pearl result: ", result);
            // DONT_NEED: 在tbl_pearl_log中加入记录
            // 不是购买得到的钻石不加入log表中
            cb(null, [account]);
        }
    });
}
