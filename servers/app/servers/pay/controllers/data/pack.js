/**
 * 背包类: 处理背包的相关操作
 */
const data_util = require('./data_util');
const DaoCommon = require('../../src/dao/dao_common');
const DaoReward = require('../../src/dao/dao_reward');
const GameLog = require('../../src/log/GameLog');
const gameConfig = require('../../../../utils/imports').GAME_CFGS;
const common_log_const_cfg = gameConfig.common_log_const_cfg;
const string_strings_cfg = gameConfig.string_strings_cfg;
const item_mix_cfg = gameConfig.item_mix_cfg;
const item_itemtype_cfg = gameConfig.item_itemtype_cfg;
const item_item_cfg = gameConfig.item_item_cfg;
const newweapon_weapons_cfg = gameConfig.newweapon_weapons_cfg;
const drop_droplist_cfg = gameConfig.drop_droplist_cfg;

const DateUtil = require('../../src/utils/DateUtil');
const BuzzUtil = require('../../src/utils/BuzzUtil');
const ObjUtil = require('../../src/buzz/ObjUtil');
const utils = require('../../src/buzz/utils');

const CacheAccount = require('../../src/buzz/cache/CacheAccount');

const ERROR_OBJ = require('../../src/buzz/cst/buzz_cst_error').ERROR_OBJ;

var Item = require('../../src/buzz/pojo/Item'),
    ItemType = Item.ItemType,
    ItemTypeC = Item.ItemTypeC;

class Pack {

    constructor() {

    }


    /**
     * 背包合成
     * @param {*} req 
     * @param {*} res 
     */
    mix(req, res) {
        const FUNC = "Pack:mix --- ";
        const HINT = "背包合成";

        let aes = req.body.aes;
        let dataObj = data_util.parseDataObj(req, HINT);
        BuzzUtil.cacheLinkDataApi(dataObj, "pack_mix");

        let token = dataObj.token;
        let item_key = "" + dataObj.item_key;
        let gain_num = dataObj.num;

        DaoCommon.checkAccount(mysqlPool, token, function (error, account) {
            if (error) {
                data_util.handleReturn(res, aes, error, null, HINT);
                return;
            }
            doNext(account);
        });

        function doNext(account) {
            let uid = account.id;
            if (!_checkMix(account, item_key, gain_num)) return;

            let mix = _getMixInfo(item_key);
            let cost = mix.count * gain_num;
            let gold_cost = mix.gold * gain_num;
            let cost_item = item_key;
            let gain_item = mix.mixid;


            let logString = `${uid} 消耗${cost}个${cost_item}，`;
            logString += `合成${gain_num}个${gain_item}，`;
            logString += `总共消耗金币${gold_cost}。`;
            console.log(FUNC + logString);

            let gain_item_list = [{
                item_id: gain_item,
                item_num: gain_num,
            }];

            let cost_item_list = [
                {
                    item_id: cost_item,
                    item_num: cost,
                },
                {
                    item_id: "i001",
                    item_num: gold_cost,
                }
            ];

            BuzzUtil.putIntoPack(req, account, gain_item_list, function (reward_info) {
                let reward_change = BuzzUtil.getChange(account, reward_info);
                BuzzUtil.removeFromPack(req, account, cost_item_list, function (cost_info) {
                    let cost_change = BuzzUtil.getChange(account, cost_info);
                    let change = ObjUtil.merge(reward_change, cost_change);
                    let ret = {
                        item_list: gain_item_list,
                        change: change,
                    };
                    data_util.handleReturn(res, aes, null, ret, HINT);
                    GameLog.addGameLog(gain_item_list, account, common_log_const_cfg.SYNTHESIS, '物品合成获取');
                    let cost_item_list_log = ObjUtil.clone(cost_item_list);
                    for (let i = 0; i < cost_item_list_log.length; i++) {
                        cost_item_list_log[i].item_num = -cost_item_list_log[i].item_num;
                    }
                    GameLog.addGameLog(cost_item_list_log, account, common_log_const_cfg.SYNTHESIS, '物品合成消耗');
                });
            });
        }

        function _getMixInfo(item_key) {
            for (let idx in item_mix_cfg) {
                let mix = item_mix_cfg[idx];
                if (mix.id == item_key) {
                    return mix;
                }
            }
            return null;
        }

        /**
         * 检测合成原料是否足够.
         */
        function _checkMix(account, item_key, num) {
            let item_type = _getItemType("ITEM_MIX");
            let item = item_item_cfg[item_key];
            // 条件1: 物品类型必须是合成类型
            // 条件2: 物品没有售价, 有售价的物品不能合成
            if (item.type != item_type || item.saleprice > 0) {
                {
                    console.log(FUNC + "item.type:", item.type);
                    console.log(FUNC + "item_type:", item_type);
                    console.log(FUNC + "saleprice:", item.saleprice);
                }
                data_util.handleReturn(res, aes, ERROR_OBJ.MIX_WRONG_ITEM, null, HINT);
                return false;
            }

            let gold = account.gold;
            let pack = account.package;
            let pack_mix = pack["" + item_type];
            if (pack_mix) {
                let raw_num = pack_mix[item_key];

                for (let idx in item_mix_cfg) {
                    let mix = item_mix_cfg[idx];
                    if (mix.id == item_key) {
                        if (mix.count * num > raw_num) {
                            data_util.handleReturn(res, aes, ERROR_OBJ.MIX_RAW_NOT_ENOUGH, null, HINT);
                            return false;
                        }
                        if (mix.gold * num > gold) {
                            data_util.handleReturn(res, aes, ERROR_OBJ.MIX_GOLD_NOT_ENOUGH, null, HINT);
                            return false;
                        }
                        break;
                    }
                }
                return true;
            } else {
                return false;
            }
        }

        function _getItemType(item_name) {
            for (let idx in item_itemtype_cfg) {
                let itemtype = item_itemtype_cfg[idx];
                if (item_name == itemtype.name) {
                    return itemtype.value;
                }
            }
            return 4;
        }

    }

    /**
     * 背包使用
     * @param {*} req 
     * @param {*} res 
     */
    use(req, res) {
        const FUNC = "Pack:use --- ";
        const HINT = "背包使用";

        let aes = req.body.aes;
        let dataObj = data_util.parseDataObj(req, HINT);

        let token = dataObj.token;
        let itemId = dataObj.itemId;
        let num = dataObj.num;

        let itemInfo = item_item_cfg[itemId];
        if (itemInfo && itemInfo.saleprice > 0) {
            this.sell(req, res);
            return;
        }
        BuzzUtil.cacheLinkDataApi(dataObj, "pack_use");

        DaoCommon.checkAccount(mysqlPool, token, function (error, account) {
            if (error) {
                data_util.handleReturn(res, aes, error, null, HINT);
                return;
            }
            doNext(account);
        });

        function doNext(account) {
            let uid = account.id;
            
            if (isNaN(num) || num <= 0) {
                console.log(FUNC + `${uid}传入了非法的数量${num}，使用的物品是${itemId}`);
                let error = {code:-1, msg:"参数非法"};
                data_util.handleReturn(res, aes, error, null, HINT);
                return;
            }

            let itemType = itemInfo.type;
            if (!account.package
                || !account.package[itemType]
                || !account.package[itemType][itemId]) {
                console.log(FUNC + `${uid}尝试使用不存在的物品${itemId}`);
                let error = {code:-1, msg:"物品不存在"};
                data_util.handleReturn(res, aes, error, null, HINT);
                return;
            }
            let itemOwn = account.package[itemType][itemId];

            if (num > itemOwn) {
                console.log(FUNC + `${uid}使用的物品${itemId}数量不足，需要${num}个，实际拥有${itemOwn}个`);
                let error = {code:-1, msg:"物品数量不足"};
                data_util.handleReturn(res, aes, error, null, HINT);
                return;
            }

            // 道具兑换皮肤
            if (itemType === ItemType.SKIN) {
                let mySkin = account.weapon_skin;
                let skinId = itemInfo.dropid;

                let item_list = [];
                if (_checkSkinExist(mySkin, skinId)) {
                    //如果存在，则写入相应的碎片，增加对应碎片数量，扣除道具数量

                    //写入皮肤碎片信息
                    let skinInfo = newweapon_weapons_cfg[skinId];
                    let pieceInfo = skinInfo.piece;

                    console.log(FUNC + `pieceInfo:${pieceInfo}`);
                    if (!account.package[ItemTypeC.SKIN_DEBRIS]) {
                        account.package[ItemTypeC.SKIN_DEBRIS] = {};
                    }
                    if (!account.package[ItemTypeC.SKIN_DEBRIS][pieceInfo[0]]) {
                        account.package[ItemTypeC.SKIN_DEBRIS][pieceInfo[0]] = 0;
                    }
                    account.package[ItemTypeC.SKIN_DEBRIS][pieceInfo[0]] += pieceInfo[1];
                    item_list = [
                        {
                            item_id: pieceInfo[0],
                            item_num: pieceInfo[1],
                        }
                    ];
                }
                else {
                    //如果不存在,则增加一款皮肤，扣除相应道具数量
                    mySkin.own.push(parseInt(skinId));
                    // account.weapon_skin = mySkin;
                    CacheAccount.setWeaponSkin(account, mySkin);
                }

                account.package[itemType][itemId] -= num;
                account.package = account.package;
                account.commit();
                let ret = {
                    item_list: item_list,
                    change: {
                        package: account.package,
                        weapon_skin: account.weapon_skin,
                        charm_point: account.charm_point,
                        charm_rank: account.charm_rank,
                    }
                };
                data_util.handleReturn(res, aes, null, ret, HINT);
                return;
            }
            else {
                account.package[itemType][itemId] -= num;
                // 处理使用物品后的效果
                let doneFunc = function () {
                    _afterUse(mysqlPool, account, itemId, num, function (err, reward) {
                        if (err) {
                            console.log(FUNC + 'err:', err);
                            cb(err);
                        } else {
                            account.package = account.package;
                            account.commit();

                            _replace(account, reward);
                        }
                    });
                };
                //使用成功，若是限时道具，则及时剔除
                let ltype = itemInfo.lengthtype;
                if (ltype === 1 || ltype === 2) {
                    _clearLimitItem(account.id, itemId, itemGotAt, num, function () {
                        doneFunc();
                    });
                } else {
                    doneFunc();
                }
            }
        }

        function _checkSkinExist(mySkin, skinId) {

            if (mySkin.equip == skinId) {
                return true;
            }

            for (let i = 0; i < mySkin.own.length; ++i) {
                if (mySkin.own[i] == skinId) {
                    return true;
                }
            }

            return false;

        }

        function _afterUse(pool, account, itemId, cost, cb) {

            var itemInfo = item_item_cfg[itemId];

            var reward = [];
            while (cost-- > 0) {
                var droplist = drop_droplist_cfg[itemInfo.dropid].drop_id;
                var probability = drop_droplist_cfg[itemInfo.dropid].probability;

                // 需要根据probability的不同获取物品
                var drop_reward = _rewardProbabilityItems(droplist, probability);

                if (drop_reward == null) {
                    drop_reward = [];
                }
                for (var i = 0; i < drop_reward.length; i++) {
                    var drop_key = drop_reward[i];
                    var drop_info = BuzzUtil.getDropInfoFromDropKey(drop_key);

                    console.log(FUNC + "drop_key:", drop_key);
                    console.log(FUNC + "drop_info:", drop_info);

                    // 需要处理有概率掉落的物品使用
                    if (drop_info.item_probability.length > 1) {
                        var drop_list = [[drop_key]];
                        var ret = BuzzUtil.checkDrop(account, drop_list);
                        console.log(FUNC + "ret:", ret);

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
            console.log(FUNC + "sorted reward:", reward);

            DaoReward.getReward(pool, account, reward, function (err, results) {
                console.log(FUNC + "err:", err);
                console.log(FUNC + "results:", results);
                cb(err, reward);

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
            var output = [];
            var temp = {};
            for (var i = 0; i < input.length; i++) {
                var one_reward = input[i];
                var id = one_reward[0];
                var count = one_reward[1];
                if (!temp[id]) {
                    temp[id] = count;
                }
                else {
                    temp[id] += count;
                }
            }
            for (var idx in temp) {
                output.push([idx, temp[idx]]);
            }
            return output;
        }

        /**
         * 获取一个随机物品.
         */
        function _rewardProbabilityItems(droplist, probability) {

            var total = 0;
            for (var i = 0; i < probability.length; i++) {
                total += probability[i];
            }
            // console.log(FUNC + "total:", total);

            var random = utils.randomInt(total);
            // console.log(FUNC + "random:", random);

            total = 0;
            var idx = 0;
            for (var i = 0; i < probability.length; i++) {
                total += probability[i];
                if (total >= random) {
                    idx = i;
                    break;
                }
            }
            console.log(FUNC + "drop reward:", droplist[idx]);
            return droplist[idx];
        }

        function _replace(account, reward) {
            account.package = account.package;
            account.commit();
            // TODO: add more in this place.
            let item_list = BuzzUtil.getItemList(reward);
            let ret = {
                item_list: item_list,
                change: {
                    gold: account.gold,
                    pearl: account.pearl,
                    package: account.package,
                    skill: account.skill,
                    weapon_skin: account.weapon_skin,
                    charm_point: account.charm_point,
                    charm_rank: account.charm_rank,
                }
            };
            data_util.handleReturn(res, aes, null, ret, HINT);
        }

    }


    /**
     * 背包出售
     * @param {*} req 
     * @param {*} res 
     */
    sell(req, res) {
        const FUNC = "Pack:sell --- ";
        const HINT = "背包售出";

        let aes = req.body.aes;
        let dataObj = data_util.parseDataObj(req, HINT);
        BuzzUtil.cacheLinkDataApi(dataObj, "pack_sell");

        let token = dataObj.token;
        let itemId = dataObj.itemId;
        let num = dataObj.num;

        DaoCommon.checkAccount(mysqlPool, token, function (error, account) {
            if (error) {
                data_util.handleReturn(res, aes, error, null, HINT);
                return;
            }
            doNext(account);
        });

        function doNext(account) {
            let uid = account.id;
            
            if (isNaN(num) || num <= 0) {
                console.log(FUNC + `${uid}传入了非法的数量${num}，出售物品是${itemId}`);
                let error = {code:-1, msg:"参数非法"};
                data_util.handleReturn(res, aes, error, null, HINT);
                return;
            }

            let itemInfo = item_item_cfg[itemId];
            if (!itemInfo || itemInfo.saleprice <= 0) {
                console.log(FUNC + `${uid}尝试出售不能出售的物品${itemId}`);
                let error = {code:-1, msg:`物品不能出售`};
                data_util.handleReturn(res, aes, error, null, HINT);
                return;
            }

            let itemType = itemInfo.type;
            if (!account.package
                || !account.package[itemType]
                || !account.package[itemType][itemId]) {
                console.log(FUNC + `${uid}尝试出售不存在的物品${itemId}`);
                let error = {code:-1, msg:"物品不存在"};
                data_util.handleReturn(res, aes, error, null, HINT);
                return;
            }

            let itemOwn = account.package[itemType][itemId];
            if (num > itemOwn) {
                console.log(FUNC + `${uid}出售的物品${itemId}数量不足，需要${num}个，实际拥有${itemOwn}个`);
                let error = {code:-1, msg:"物品数量不足"};
                data_util.handleReturn(res, aes, error, null, HINT);
                return;
            }

            let sellPrice = itemInfo.saleprice * num;
            account.package[itemType][itemId] -= num;
            let left = account.package[itemType][itemId];
            account.package = account.package;
            account.pearl = sellPrice;
            console.log(FUNC + `${uid}出售的物品${itemId}总价为${sellPrice}，出售数量${num}，剩余数量${left}`);

            logDiamond.push({
                account_id: uid,
                log_at: new Date(),
                gain: sellPrice,
                cost: 0,
                total: account.pearl,
                scene: common_log_const_cfg.SELL,
                nickname: 0,
            });

            let item_list = [
                {
                    item_id: "i002",
                    item_num: sellPrice,
                }
            ];

            account.commit();
            let ret = {
                item_list: item_list,
                change: {
                    pearl: account.pearl,
                    package: account.package,
                }
            };
            data_util.handleReturn(res, aes, null, ret, HINT);

        }

    }

}

const pack = new Pack;
module.exports.mix = pack.mix;
module.exports.use = pack.use;