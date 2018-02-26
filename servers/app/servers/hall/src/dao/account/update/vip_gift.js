const StringUtil = require('../../../utils/StringUtil');
const ArrayUtil = require('../../../utils/ArrayUtil');
const BuzzUtil = require('../../../utils/BuzzUtil');
const ObjUtil = require('../../../buzz/ObjUtil');
const CstError = require('../../../buzz/cst/buzz_cst_error');
const gameConfig = require('../../../../../../utils/imports').GAME_CFGS;
const vip_vip_cfg = gameConfig.vip_vip_cfg;
const item_item_cfg = gameConfig.item_item_cfg;
const common_log_const_cfg = gameConfig.common_log_const_cfg;
const shop_shop_buy_type_cfg = gameConfig.shop_shop_buy_type_cfg;
const DaoGold = require('../../dao_gold');
const DaoPearl = require('../../dao_pearl');
const DaoSkill = require('../../dao_skill');
const ERROR_OBJ = CstError.ERROR_OBJ;
const logger = loggerEx(__filename);

let DEBUG = 0;
let ERROR = 1;
const TAG = "【update/vip_gift】";


exports.update = _update;

/**
 * 账户数据更新(每日任务完成度).
 */
function _update(pool, data, cb, my_account) {
    const FUNC = TAG + "_update() --- ";
    logger.info("CALL vip_gift.update()");

    let coinId = shop_shop_buy_type_cfg.BUY_VIPGIFT.id;
    let coinType = shop_shop_buy_type_cfg.BUY_VIPGIFT.name;

    let account_id = my_account['id'];
    let uid = account_id;

    let vip_gift = ObjUtil.str2Data(data['vip_gift']);

    let vip_level = vip_gift['vip'];
    logger.info("vip_level: " + vip_level);

    let vip_info = vip_vip_cfg[vip_level];
    logger.info("vip_info: ", vip_info);

    let gift_price = vip_info['gift_price2'];// 消耗钻石，更新数据库
    let gift_item = vip_info['gift_item'];
    logger.info(gift_item);

    for (let i = 0; i < gift_item.length; i++) {
        let item_name = gift_item[i][0];
        let item_amount = gift_item[i][1];
        logger.info(i + ")item_name: " + item_name);
        logger.info("  item_amount: " + item_amount);
    }

    let vip_level_old = my_account['vip'];
    let coin_old = my_account[coinType];
    let vip_gift_old = my_account['vip_gift'];
    let vip_gift_old_json = [];
    if (vip_gift_old != null && vip_gift_old != "") {
        if (vip_gift_old == "[object Object]") {
            vip_gift_old_json = [];
        }
        else {
            let vip_gift_old = StringUtil.trim(vip_gift_old, ",");
            vip_gift_old_json = ObjUtil.str2Data("[" + vip_gift_old + "]");//数组
        }
    }

    // 数据有效性验证
    if (ArrayUtil.contain(vip_gift_old_json, vip_level)) {
        let extraErrInfo = {debug_info: 'vip_gift.update()-玩家已经购买了此等级VIP的礼包，请勿重复购买!'};
        cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.REPEAT_OPERATION));
        return;
    }

    if (vip_level_old < vip_level) {
        let extraErrInfo = {debug_info: 'vip_gift.update()-不允许购买高于玩家VIP等级的物品，如需购买，请先升级VIP!'};
        cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.VIP_NOT_ENOUFH));
        return;
    }

    if (coin_old < gift_price) {
        let extraErrInfo = {debug_info: 'vip_gift.update()-钻石数量不足，请先充值钻石!'};
        cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.DIAMOND_NOT_ENOUGH));
        return;
    }

    vip_gift_old_json.push(vip_level);

    let vip_gift_new = vip_gift_old_json.toString();

    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    my_account.vip_gift = vip_gift_old_json;

    BuzzUtil.useCoin(my_account, coinId, gift_price, function (err, res) {
        _updateItem1(pool, my_account, gift_item, function (err, res) {
            my_account.commit();
            cb(err, res);

            // 增加金币或钻石的消耗日志
            let logInfo = {
                account_id: uid,
                log_at: new Date(),
                gain: 0,
                cost: gift_price,
                total: my_account[coinType],
                scene: common_log_const_cfg.VIPGIFT_BUY,
                nickname: 0,
            };
            switch (coinType) {
                case "pearl":
                    logger.info(FUNC + uid + "购买VIP礼包消耗钻石");
                    logDiamond.push(logInfo);
                    break;
                case "gold":
                    logger.info(FUNC + uid + "购买VIP礼包消耗金币");
                    logInfo.duration = 0;
                    logInfo.level = my_account.level;
                    logGold.push(logInfo);
                    break;
            }
        });
    });
}


//==============================================================================
// private
//==============================================================================

// 更新礼包第一个物品
function _updateItem1(pool, account, gift_item, cb) {
    const FUNC = TAG + "_updateItem1() --- ";
    let item = gift_item[0];
    _updateItem(pool, account, item, function (err, results) {
        if (err) {
            logger.error(FUNC + "更新物品1（" + item[0] + "）出现问题");
            let extraErrInfo = {debug_info: 'vip_gift._updateItem1()-更新物品1（' + item[0] + '）出现问题', err_obj: err};
            cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.DB_ERR));
            return;
        }
        _updateItem2(pool, account, gift_item, cb);
    });
}

// 更新礼包第二个物品
function _updateItem2(pool, account, gift_item, cb) {
    const FUNC = TAG + "_updateItem2() --- ";
    logger.info("[_updateItem2()] gift_item: ", gift_item);
    let item = gift_item[1];
    _updateItem(pool, account, item, function (err, results) {
        if (err) {
            logger.error("更新物品2（" + item[0] + "）出现问题");
            let extraErrInfo = {debug_info: 'vip_gift._updateItem2()-更新物品2（' + item[0] + '）出现问题', err_obj: err};
            cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.DB_ERR));
            return;
        }
        logger.info(FUNC + "购买VIP礼包成功, 返回玩家数据");
        cb(err, [account]);
    });
}

let ITEM_TYPE = {
    gold: 1,
    pearl: 2,
    skill: 3,
};

/**
 * 通用的物品更新方法.
 */
function _updateItem(pool, account, item, cb) {
    logger.info("-------item: ", item);
    let item_name = item[0];    // 物品名
    let item_amount = item[1];  // 物品数量
    // 查表item_item_cfg
    let item_info = item_item_cfg[item_name];
    let item_type = item_info['type'];
    let item_id = item_info['id']; // 如果是技能就是对应的技能ID，需要更新技能字段
    let data = null;//接口调用时需要传输的参数

    let account_id = account['id'];
    let token = account['token'];
    let gold = account['gold'];
    let pearl = account['pearl'];
    let skill = account['skill'];

    // 处理skill
    if (skill == null) {
        skill = {};
    }
    else {
        try {
            skill = ObjUtil.str2Data(skill);
        }
        catch (err) {
            logger.error("account_id:", account_id);
            logger.error("skill:", skill);
            throw err;//仍然抛出
        }
    }
    let skill_total = item_amount;
    if (skill["" + item_id]) {
        skill_total += skill["" + item_id];
    }

    switch (item_type) {
        case ITEM_TYPE.gold:
            // yDONE: 金币数据记录
            data = {
                account_id: account_id,
                token: token,
                total: gold + item_amount,
                duration: 0,
                group: [{
                    "gain": item_amount,
                    "cost": 0,
                    "scene": common_log_const_cfg.VIPGIFT_BUY
                }],
            };
            DaoGold.addGoldLogEx(account, data, function (err_gold, results_gold) {
                if (err_gold) {
                    logger.error("更新金币数据出现错误");
                    let extraErrInfo = {debug_info: 'vip_gift._updateItem()-更新金币数据出现错误', err_obj: err_gold};
                    cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.DB_ERR));
                    return;
                }
                cb(null);
            });
            break;
        case ITEM_TYPE.pearl:
            data = {
                account_id: account_id,
                token: token,
                total: pearl + item_amount,
                group: [{"gain": item_amount, "cost": 0, "scene": 4}],
            };
            DaoPearl.addPearlLogEx(account, data, function (err_pearl, results_pearl) {
                if (err_pearl) {
                    logger.error("更新钻石数据出现错误");
                    let extraErrInfo = {debug_info: 'vip_gift._updateItem()-更新钻石数据出现错误', err_obj: err_pearl};
                    cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.DB_ERR));
                    return;
                }
                cb(null);
            });
            break;
        case ITEM_TYPE.skill:
            data = {
                account_id: account_id,
                token: token,
                skill_data: [{"id": item_id, "gain": item_amount, "cost": 0, "total": skill_total}],
            };
            DaoSkill.addSkillLogEx(account, data, function (err_skill, results_skill) {
                if (err_skill) {
                    logger.error("更新技能数据出现错误");
                    let extraErrInfo = {debug_info: 'vip_gift._updateItem()-更新技能数据出现错误', err_obj: err_skill};
                    cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.DB_ERR));
                    return;
                }
                cb(null);
            });
            break;
        default:
            logger.info("不支持的物品类型，请检查配置");//此处跳过
            cb(null);
            break;
    }
}