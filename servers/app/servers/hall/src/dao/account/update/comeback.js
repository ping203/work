const ObjUtil = require('../../../buzz/ObjUtil');
const ErrorUtil = require('../../../buzz/ErrorUtil');
let gameConfig = require('../../../../../../utils/imports').GAME_CFGS;
const shop_fund_cfg = gameConfig.shop_fund_cfg;
const vip_vip_cfg = gameConfig.vip_vip_cfg;
const CacheAccount = require('../../../buzz/cache/CacheAccount');

const FUND_10 = 1001;

exports.update = _update;

/**
 * 翻盘数据更新(每日重置为{}).
 * 处理的数据格式为{comeback:{cb_id:?}}
 */
function _update(pool, data, cb, my_account) {
    let uid = my_account['id'];
    let comeback = ObjUtil.str2Data(data['comeback']);
    let cb_id = parseInt(comeback['cb_id']);

    // 获取my_account中的对应字段
    let old_comeback_json = my_account["comeback"];
    try {
        old_comeback_json = ObjUtil.str2Data(old_comeback_json);
    }
    catch (err_parse) {
        logger.error('err:', err_parse);
        cb(new Error("解析错误: 账户数据中的json字符串无法解析为json格式"));
        return;
    }
    // TODO: 数据有效性验证

    // 查看当日的翻盘基金是否已经购买
    if (_alreadyBuy(old_comeback_json, cb)) return;

    // 没有购买，则设置当前的翻盘基金ID
    old_comeback_json['cb_id'] = cb_id;

    let price = 0;
    let gold = 0;
    let isFundFound = false;
    // 获取翻盘基金获取的金币数额和RMB的数额
    for (let i = 0; i < shop_fund_cfg.length; i++) {
        let fund = shop_fund_cfg[i];
        if (fund['id'] == cb_id) {
            price = fund['price'] * 100;// 配置表中的单位为元，此处转换为分
            gold = fund['gold'];
            isFundFound = true;
            old_comeback_json['hitrate'] = fund['hitrate'];
            break;
        }
    }
    if (_cantFoundFund(isFundFound, cb)) return;
    if (FUND_10 == cb_id && _isPlayerCanBuy(my_account, cb)) return;

    // 购买翻盘基金的必要条件就是玩家金币数量已经为0
    // 此处直接设置金币数量, 不再使用叠加

    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    CacheAccount.setGold(uid, gold);
    CacheAccount.addRmb(uid, price);
    CacheAccount.setComeback(uid, old_comeback_json);
    CacheAccount.getAccountById(uid, function (err, account) {
        cb(null, [account]);
    });
}


// 玩家对应的VIP等级没有开通翻盘基金
function _isPlayerCanBuy(my_account, cb) {
    // 检查玩家是否达到了可以购买翻盘基金的条件
    for (let i = 0; i < vip_vip_cfg.length; i++) {
        let temp_vip = vip_vip_cfg[i];
        if (temp_vip['vip_level'] == my_account['vip']) {
            return ErrorUtil.checkError(temp_vip['vip_specialskill'] == 0, "玩家对应的VIP等级没有开通翻盘基金，请升级VIP后购买。", cb);
        }
    }
}

// 已经购买则返回错误.
function _alreadyBuy(old_comeback_json, cb) {
    let cb_id = old_comeback_json['cb_id'];
    return ErrorUtil.checkError(cb_id, "今日玩家已经购买了翻盘基金，请勿重复购买。", cb);
}

// 无法查找到Fund返回错误信息.
function _cantFoundFund(isFundFound, cb) {
    return ErrorUtil.checkError(!isFundFound, "传入的翻盘基金ID错误", cb);
}