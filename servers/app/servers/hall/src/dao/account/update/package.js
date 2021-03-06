﻿const utils = require('../../../buzz/utils');
const ObjUtil = require('../../../buzz/ObjUtil');
const buzz_limit_items = require('../../../buzz/buzz_limit_items');
const StringUtil = require('../../../utils/StringUtil');
const BuzzUtil = require('../../../utils/BuzzUtil');
const CacheAccount = require('../../../buzz/cache/CacheAccount');
const gameConfig = require('../../../../../../utils/imports').GAME_CFGS;
const item_item_cfg = gameConfig.item_item_cfg;
const drop_droplist_cfg = gameConfig.drop_droplist_cfg;
const DaoReward = require('../../dao_reward');
const newweapon_weapons_cfg = gameConfig.newweapon_weapons_cfg;
const Item = require('../../../buzz/pojo/Item'),
    ItemType = Item.ItemType,
    ItemTypeC = Item.ItemTypeC;
const SCENE = gameConfig.common_log_const_cfg;

let DEBUG = 0;
let ERROR = 1;

const TAG = "【dao/account/update/package】";

exports.update = update;
exports.rewardProbabilityItems = _rewardProbabilityItems;
/**
 * 账户数据更新(每日任务完成度).
 */
function update(pool, data, cb, account) {
    const FUNC = TAG + "update() --- ";

    if (DEBUG) logger.info(FUNC + "CALL...");

    let package_param = data['package'];
        
    // 使用物品
    if (package_param.use) {
        if (DEBUG) logger.info("使用物品");
        _use(pool,package_param, account, cb);
    }
    else {
        if (DEBUG) logger.info("替换背包的全部数据");
        _replace(pool,package_param, account, cb);
    }
}


function _checkSkinExist(mySkin, skin_id) {

    if(mySkin.equip == skin_id){
        return true;
    }

    for(let i = 0; i< mySkin.own.length; ++i){
        if(mySkin.own[i] == skin_id){
            return true;
        }
    }

    return false;

}

//todo:linyng
// function _use(pool, cb, account_id, token, used_item, pack, my_account) {
function _use(pool,used_item, account, cb) {
    const FUNC = TAG + "_use() --- ";

    if (StringUtil.isString(used_item)) {
        used_item = ObjUtil.str2Data(used_item);
    }

    let item_id = used_item.id;
    let cost = used_item.cost;
    let total = used_item.total;
    let itemGotAt = used_item.gotAt;

    let pack = account.package;

    logger.info(pack);

    
    // if (DEBUG) logger.info(FUNC + 'pack:', pack);
    if (DEBUG) logger.info(FUNC + 'used_item:', used_item);
    if (DEBUG) logger.info(FUNC + 'item_id:', item_id);
    if (DEBUG) logger.info(FUNC + 'total:', total);

    if (!pack) {
        let err_info = "服务器记录的背包数据为空";
        if (ERROR) logger.error(err_info);
        cb(new Error(err_info));
        return;
    }

    let item_info = item_item_cfg[item_id];
    if (item_info && item_info.saleprice > 0) {
        logger.info(FUNC + "item_info:", item_info);
        // 出售物品(技能除外, 技能出售在dao_skill中进行处理)
        sellItem(pool, cost, item_id, item_info, account, cb);
    }
    else {

        //道具兑换皮肤
        let item_type = item_info.type;
        if(item_type === ItemType.SKIN){
            let itemList = pack[ItemTypeC.SKIN];
            if (!itemList[item_id]) {
                errNotEnough(cost, 0, cb);
                return;
            }

            let mySkin = account.weapon_skin;
            let skin_id = item_info.dropid;
            if (_checkSkinExist(mySkin, skin_id)){
                //如果存在，则写入相应的碎片，增加对应碎片数量，扣除道具数量

                //写入皮肤碎片信息
                let skin_info = newweapon_weapons_cfg[skin_id];
                let piece_info = skin_info.piece;

                logger.info(FUNC + "--------------------1.piece_info:", piece_info);
                if (!pack[ItemTypeC.SKIN_DEBRIS]) {
                    pack[ItemTypeC.SKIN_DEBRIS] = {};
                }
                if (!pack[ItemTypeC.SKIN_DEBRIS][piece_info[0]]) {
                    pack[ItemTypeC.SKIN_DEBRIS][piece_info[0]] = 0;
                }
                pack[ItemTypeC.SKIN_DEBRIS][piece_info[0]] += piece_info[1];

            }
            else {
                //如果不存在,则增加一款皮肤，扣除相应道具数量
                // logger.info(FUNC + "skin_id:", skin_id);
                // logger.info(FUNC + "--------------------1.mySkin:", mySkin);
                mySkin.own.push(parseInt(skin_id));
                // logger.info(FUNC + "--------------------2.mySkin:", mySkin);
                CacheAccount.setWeaponSkin(account, mySkin);
            }

            pack[item_type][item_id] -= 1;

            account.package = pack;
            account.commit();
            logger.info(FUNC + "返回客户端用户数据");
            cb && cb(null, [account]);
            return;
        }

        let itemList = pack[ItemTypeC.GIFT];
        if (!itemList[item_id]) {
            errNotEnough(cost, 0, cb);
            return;
        }

        for (let itemKey in itemList) {
            if (itemKey == item_id) {
                
                // 处理对应id的物品
                let count = itemList[itemKey];
                if (count < cost) {
                    errNotEnough(cost, count, cb);
                    return;
                }
                if (count - cost != total) {
                    let err_info = "物品数据不匹配：" + count + " - " + cost + " != " + total;
                    if (ERROR) logger.error(err_info);
                }
                // 以count - cost为准
                itemList[itemKey] = count - cost;
                pack['7'] = itemList;
                // 处理使用物品后的效果
                let doneFunc = function () {
                    _afterUse(pool, account, item_id, cost, function (err, results) {
                        if (err) {
                            if (DEBUG) logger.info('[ERROR] package._afterUse()');
                            if (DEBUG) logger.info(JSON.stringify(err));
                            cb(err);
                        } else {
                            account.package = pack;
                            account.commit();

                            _replace(pool, account, cb);
                        }
                    });
                };
                //使用成功，若是限时道具，则及时剔除
                let ltype = item_info.lengthtype;
                if (ltype === 1 || ltype === 2) {
                    buzz_limit_items.clearLimitItem(account.id, item_id, itemGotAt, cost, function () {
                        doneFunc();
                    });
                }else{
                    doneFunc();
                }
                break;
            }
        }
    }
}

/**
 * 出售物品.
 * @param cost 出售物品的个数.
 * @param item_id 出售物品的ID, 用于验证玩家物品是否足够和改变背包数据.
 * @param item_info 物品信息, 直接传入减少一次查表操作.
 * @param my_account 玩家信息.
 */
// function sellItem(pool, uid, cost, item_id, item_info, my_account, cb) {
function sellItem(pool, cost, item_id, item_info, account, cb) {
    const FUNC = TAG + "sellItem() --- ";

    // 验证物品是否足够
    let item_type = item_info.type;
    let item_i_have = account.package['' + item_type][item_id];
    if (cost > item_i_have) {
        errNotEnough(cost, item_i_have, cb);
        return;
    }

    let total_sell_price = item_info.saleprice * cost;
    if (DEBUG) logger.info(FUNC + "总售价——total_sell_price:", total_sell_price);
    if (DEBUG) logger.info(FUNC + "当前玩家拥有金币数量——current account gold:", account.gold);
    
    if (DEBUG) logger.info(FUNC + "使用前package:", account.package);

    account.package['' + item_type][item_id] -= cost;
    account.package = account.package;
    account.gold = total_sell_price;

    // yDONE: 金币数据记录(售出物品增加金币总量)
    logGold.push({
        account_id: account.id,
        log_at: new Date(),
        gain: total_sell_price,
        cost: 0,
        duration: 0,
        total: account.gold,
        scene: SCENE.SELL,
        nickname: 0,
        level: account.level,
    });

    if (DEBUG) logger.info(FUNC + "使用后package:", account.package);

    account.commit();
    cb(null, [account]);
}

function errNotEnough(cost, count, cb) {
    let err_info = "物品数量不够，需要使用" + cost + "个，实际拥有" + count + "个";
    if (ERROR) logger.error(err_info);
    cb(new Error(err_info));
}
// pool, account, item_id, cost,
function _afterUse(pool, account, item_id, cost, cb) {
    const FUNC = TAG + "_afterUse() --- ";
    
    let item_info = item_item_cfg[item_id];
    
    let reward = [];
    while (cost-- > 0) {
        let droplist = drop_droplist_cfg[item_info.dropid].drop_id;
        let probability = drop_droplist_cfg[item_info.dropid].probability;
        
        // 需要根据probability的不同获取物品
        let drop_reward = _rewardProbabilityItems(droplist, probability);
        
        if (drop_reward == null) {
            drop_reward = [];
        }
        for (let i = 0; i < drop_reward.length; i++) {
            let drop_key = drop_reward[i];
            let drop_info = BuzzUtil.getDropInfoFromDropKey(drop_key);
            
            if (DEBUG) logger.info(FUNC + "drop_key:", drop_key);
            if (DEBUG) logger.info(FUNC + "drop_info:", drop_info);

            // 需要处理有概率掉落的物品使用
            if (drop_info.item_probability.length > 1) {
                let drop_list = [[drop_key]];
                let ret = BuzzUtil.checkDrop(account, drop_list);
                if (DEBUG) logger.info(FUNC + "ret:", ret);

                if (ret != 0 && ret.length > 0) {
                    reward.push([drop_info.item_id, drop_info.item_num]);
                }
            }
            else {
                reward.push([drop_info.item_id, drop_info.item_num]);
            }
        }
    }
    reward = _sortReward(reward);
    if (DEBUG) logger.info(FUNC + "reward:", reward);
    
    DaoReward.getReward(pool, account, reward, function (err, results) {
        if (DEBUG) logger.info(FUNC + "err:", err);
        if (DEBUG) logger.info(FUNC + "results:", results);
        cb(err, results);

        // yDONE: 金币数据记录(使用某些特殊物品后获得金币)
        let gain = 0;
        for (let i = 0; i < reward.length; i++) {
            if ('i001' == reward[i][0]) {
                gain = reward[i][1];
            }
        }
        if (gain > 0) {
            logGold.push({
                account_id: account.id,
                log_at: new Date(),
                gain: gain,
                cost: 0,
                duration: 0,
                total: account.gold,
                scene: SCENE.USE,
                nickname: 0,
                level: account.level,
            });
        }

    });
}

/**
 * 将冗余的奖品获得进行整理, 同样的都放在一个数组元素中.
 */
function _sortReward(input) {
    let output = [];
    let temp = {};
    for (let i = 0; i < input.length; i++) {
        let one_reward = input[i];
        let id = one_reward[0];
        let count = one_reward[1];
        if (!temp[id]) {
            temp[id] = count;
        }
        else {
            temp[id] += count;
        }
    }
    for (let idx in temp) {
        output.push([idx, temp[idx]]);
    }
    return output;
}

/**
 * 获取一个随机物品.
 */
function _rewardProbabilityItems(droplist, probability) {
    const FUNC = TAG + "_rewardProbabilityItems() --- ";

    let total = 0;
    for (let i = 0; i < probability.length; i++) {
        total += probability[i];
    }
    if (DEBUG) logger.info(FUNC + "total:", total);

    let random = utils.randomInt(total);
    if (DEBUG) logger.info(FUNC + "random:", random);
    
    total = 0;
    let idx = 0;
    for (let i = 0; i < probability.length; i++) {
        total += probability[i];
        if (total >= random) {
            idx = i;
            break;
        }
    }
    if (DEBUG) logger.info(FUNC + "reward:", droplist[idx]);
    return droplist[idx];
}

function _replace(pool, account, cb) {
    const FUNC = TAG + "_replace() --- ";
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    account.package = account.package;
    account.commit();
    //--------------------------------------------------------------------------
    cb(null, [account]);
}
