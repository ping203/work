const _ = require('underscore');
const CstError = require('./cst/buzz_cst_error');
const ERROR_OBJ = CstError.ERROR_OBJ;
const ObjUtil = require('./ObjUtil');
const ArrayUtil = require('../utils/ArrayUtil');
const BuzzUtil = require('../utils/BuzzUtil');
const RandomUtil = require('../../../../utils/RandomUtil');
const HttpUtil = require('../utils/HttpUtil');
const DaoUtil = require('../utils/DaoUtil');
let GameLog = require('../log/GameLog');
const DaoCommon = require('../dao/dao_common');
const CacheAccount = require('./cache/CacheAccount');
const gameConfig = require('../../../../utils/imports').GAME_CFGS;
const SCENE = gameConfig.common_log_const_cfg;
const goldfish_goldlevel_cfg = gameConfig.goldfish_goldlevel_cfg;
const goldfish_goldfish_cfg = gameConfig.goldfish_goldfish_cfg;
const item_item_cfg = gameConfig.item_item_cfg;
const item_itemtype_cfg = gameConfig.item_itemtype_cfg;
const item_mix_cfg = gameConfig.item_mix_cfg;
const string_strings_cfg = gameConfig.string_strings_cfg;
const change_change_cfg = gameConfig.change_change_cfg;
const vip_vip_cfg = gameConfig.vip_vip_cfg;

//==============================================================================
// const
//==============================================================================
let DEBUG = 0;
let ERROR = 1;
const TAG = "【buzz_recieve】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.openBox = openBox;
exports.openBoxAsDrop = openBoxAsDrop;
exports.turntableDraw = turntableDraw;
exports.packMix = packMix;
exports.changeInKind = changeInKind;
exports.getCikLog = getCikLog;
exports.getCikInfo = getCikInfo;
exports.cancelCik = cancelCik;

exports.weaponUp = weaponUp;
exports.buyVipGift = buyVipGift;
exports.vipDailyReward = vipDailyReward;

exports.minigameReward = minigameReward;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 开宝箱.
 */
function openBox(req, dataObj, cb) {
    const FUNC = TAG + "openBox() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "open_box");

    _openBox(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'box_id'], "buzz_recieve", cb);
    }
}

/**
 * 开宝箱(实际是掉落逻辑).
 */
function openBoxAsDrop(req, dataObj, cb) {
    const FUNC = TAG + "openBoxAsDrop() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "open_box_as_drop");

    _openBoxAsDrop(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'droplist_key', 'dropcount'], "buzz_recieve", cb);
    }
}

/**
 * 转盘抽奖.
 */
function turntableDraw(req, dataObj, cb) {
    const FUNC = TAG + "turntableDraw() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "turntable_draw");

    _didTurntableDraw(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_recieve", cb);
    }
}

function packMix(req, dataObj, cb) {
    const FUNC = TAG + "packMix() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "pack_mix");

    // TODO
    _didPackMix(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'item_key', 'num'], "buzz_recieve", cb);
    }
}

function changeInKind(req, dataObj, cb) {
    const FUNC = TAG + "changeInKind() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "change_in_kind");

    // TODO
    _didChangeInKind(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'change_id'], "buzz_recieve", cb);
    }
}

function getCikLog(req, dataObj, cb) {
    const FUNC = TAG + "getCikLog() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_cik_log");

    _didGetCikLog(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_recieve", cb);
    }
}

function getCikInfo(req, dataObj, cb) {
    const FUNC = TAG + "getCikInfo() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_cik_info");

    _didGetCikInfo(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_recieve", cb);
    }
}

function cancelCik(req, dataObj, cb) {
    const FUNC = TAG + "cancelCik() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "cancel_cik");

    _didCancelCik(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'orderid'], "buzz_recieve", cb);
    }
}

//----------------------------------------------------------

function weaponUp(req, dataObj, cb) {
    const FUNC = TAG + "weaponUp() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "weapon_up");

    // TODO

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_recieve", cb);
    }
}

function buyVipGift(req, dataObj, cb) {
    const FUNC = TAG + "buyVipGift() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "buy_vip_gift");

    // TODO

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_recieve.buyVipGift", cb);
    }
}

function vipDailyReward(req, dataObj, cb) {
    const FUNC = TAG + "vipDailyReward() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "vip_daily_reward");

    _vipDailyReward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_recieve.vipDailyReward", cb);
    }
    
}

//----------------------------------------------------------

/**
 * 小游戏结算.
 */
function minigameReward(req, dataObj, cb) {
    const FUNC = TAG + "minigameReward() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "minigame_reward");

    // TODO

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_recieve", cb);
    }
}


//==============================================================================
// private
//==============================================================================
//----------------------------------------------------------
// 开宝箱

/**
 * 打开宝箱获取物品.
 */
function _openBox(req, dataObj, cb) {
    const FUNC = TAG + "_openBox() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");
    let uid = dataObj.uid;
    let token = dataObj.token;
    let bid = "" + dataObj.box_id;
    let pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        // TODO: 宝箱验证
        let item_list = BuzzUtil.getItemListByTid(account, bid);

        BuzzUtil.putIntoPack(req, account, item_list, function(reward) {


            let change = BuzzUtil.getChange(account, reward);
            let ret = {
                item_list: item_list,
                change: change,
                box_id: dataObj.box_id,
            };
            cb(null, ret);

            GameLog.addGameLog(item_list, account, SCENE.BOX_REWARD, "在开启宝箱时获得");
        });
    }

}

/**
 * 物品掉落逻辑.
 */
function _openBoxAsDrop(req, dataObj, cb) {
    const FUNC = TAG + "_openBoxAsDrop() --- ";
    let uid = dataObj.uid;
    let token = dataObj.token;
    let droplist_key = "" + dataObj.droplist_key;
    let dropcount = "" + dataObj.dropcount;
    let pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        let item_list = BuzzUtil.getItemListFromDroplistId(account, droplist_key, dropcount, pool);

        BuzzUtil.putIntoPack(req, account, item_list, function(reward) {

            let change = BuzzUtil.getChange(account, reward);
            let ret = {
                item_list: item_list,
                change: change,
                droplist_key: dataObj.droplist_key,
            };
            cb(null, ret);

            GameLog.addGameLog(item_list, account, SCENE.FIGHT_DROP, "战斗中掉落");
        });
    }
}

//----------------------------------------------------------
// 转盘抽奖

function _didTurntableDraw(req, dataObj, cb) {
    const FUNC = TAG + "_didTurntableDraw() --- ";
    let uid = dataObj.uid;
    let token = dataObj.token;
    let goldlevel = "" + dataObj.goldlevel;
    let pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        if (!_checkTurntableDraw(account, goldlevel, cb)) return;

        // record wintimes
        let bonus = account.bonus;
        if (!bonus.wintimes) {
            bonus.wintimes = [0,0,0,0,0,0];
        }
        bonus.wintimes[goldlevel - 1]++;
        console.log(`这是等级${goldlevel}的奖金鱼第${bonus.wintimes[goldlevel - 1]}次抽奖`);

        let reward_list = _getRewardList(goldlevel);
        let probability = _getRewardProbability(reward_list);

        if (DEBUG) console.log(FUNC + "reward_list:\n", reward_list);
        if (DEBUG) console.log(FUNC + "probability:\n", probability);

        let drop_info = {
            drop_id: reward_list,
            probability: probability,
        };
        let goldfish_info = RandomUtil.randomDrop(drop_info);

        // handle wintimes
        for (let i = 0; i < reward_list.length; i++) {
            let wintimes = reward_list[i].wintimes;
            if (ArrayUtil.contain(wintimes, bonus.wintimes[goldlevel - 1])) {
                goldfish_info = reward_list[i];
                break;
            }
        }

        let item_list = [
            {
                item_id: goldfish_info.item_id,
                item_num: goldfish_info.item_count,
            },
        ];

        // 清除奖金鱼数据
        CacheAccount.setBonus(uid, {
            fish_count:0,
            gold_count:0,
            got:false,
            wintimes: bonus.wintimes
        });

        BuzzUtil.putIntoPack(req, account, item_list, function(reward) {
            let change = BuzzUtil.getChange(account, reward);
            let ret = {
                item_list: item_list,
                change: change,
                item: goldfish_info.item,// goldfish_goldfish_cfg表中的item字段, 用于客户端旋转到转盘的指定位置
            };
            cb(null, ret);
            GameLog.addGameLog(item_list, account, SCENE.GOLDFISH_GAIN, "奖金鱼抽奖抽到");
        });
    }

}

/**
 * 校验客户端传来的数据.
 */
function _checkTurntableDraw(account, goldlevel, cb) {
    // 判断传入的奖金鱼抽奖等级是否合法
    if (goldlevel < 1 || goldlevel > 6) {
        cb(ERROR_OBJ.BONUS_GOLDLEVEL_WRONG);
        return false;
    }
    // TODO: 判断是否满足该等级的抽奖条件(goldfishcount, goldcount)
    let goldfishcount = 10;
    let goldcount = 10000000;
    for (let idx in goldfish_goldlevel_cfg) {
        if (goldfish_goldlevel_cfg[idx].goldlevel == goldlevel) {
            goldfishcount = goldfish_goldlevel_cfg[idx].goldfishcount;
            goldcount = goldfish_goldlevel_cfg[idx].goldcount;
            break;
        }
    }

    // yTODO: 什么时候在对bonus进行修改?
    let bonus = account.bonus;
    if (bonus.fish_count < goldfishcount) {
        cb(ERROR_OBJ.BONUS_FISH_NOT_ENOUGH);
        return false;
    }
    if (bonus.gold_count < goldcount) {
        cb(ERROR_OBJ.BONUS_GOLD_NOT_ENOUGH);
        return false;
    }
    return true;
}

/**
 * 获取当前抽奖等级对应的信息列表.
 */
function _getRewardList(goldlevel) {
    let reward_list = [];
    for (let idx in goldfish_goldfish_cfg) {
        let reward = goldfish_goldfish_cfg[idx];
        if (!reward.wintimes) {
            reward.wintimes = [];
        }
        if (reward.goldlevel == goldlevel) {
            reward_list.push(reward);
        }
    }
    return reward_list;
}

function _getRewardProbability(reward_list) {
    let probability = [];
    for (let i = 0; i < reward_list.length; i++) {
        probability.push(reward_list[i].item_probability);
    }
    return probability;
}

//----------------------------------------------------------
// 背包合成

function _didPackMix(req, dataObj, cb) {
    const FUNC = TAG + "_didPackMix() --- ";
    let uid = dataObj.uid;
    let token = dataObj.token;
    let item_key = "" + dataObj.item_key;
    let num = dataObj.num;
    let pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        if (!_checkMix(account, item_key, num, cb)) return;

        let mix = _getMixInfo(item_key);
        let cost = mix.count * num;
        let gain = num;
        let gold_cost = mix.gold * num;
        let cost_item = item_key;
        let gain_item = mix.mixid;

        if (DEBUG) {
            console.log(FUNC + "cost:", cost);
            console.log(FUNC + "gain:", gain);
            console.log(FUNC + "gold_cost:", gold_cost);
            console.log(FUNC + "cost_item:", cost_item);
            console.log(FUNC + "gain_item:", gain_item);
        }

        let gain_item_list = [{
            item_id: gain_item,
            item_num: gain,
        }];

        let cost_item_list = [
        {
            item_id: cost_item,
            item_num: cost,
        },
        {
            item_id: "i001",
            item_num: gold_cost,
        }];

        BuzzUtil.putIntoPack(req, account, gain_item_list, function(reward_info) {
            let reward_change = BuzzUtil.getChange(account, reward_info);
            BuzzUtil.removeFromPack(req, account, cost_item_list, function(cost_info){
                let cost_change = BuzzUtil.getChange(account, cost_info);
                let change = ObjUtil.merge(reward_change, cost_change);
                let ret = {
                    item_list: gain_item_list,
                    change: change,
                };
                cb(null, ret);
            });
        });
    }

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
function _checkMix(account, item_key, num, cb) {
    const FUNC = TAG + "_checkMix() --- ";
    let item_type = _getItemType("ITEM_MIX");
    let item = item_item_cfg[item_key];
    // 条件1: 物品类型必须是合成类型
    // 条件2: 物品没有售价, 有售价的物品不能合成
    if (item.type != item_type || item.saleprice > 0) {
        if (DEBUG) {
            console.log(FUNC + "item.type:", item.type);
            console.log(FUNC + "item_type:", item_type);
            console.log(FUNC + "saleprice:", item.saleprice);
        }
        cb(ERROR_OBJ.MIX_WRONG_ITEM);
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
                    cb(ERROR_OBJ.MIX_RAW_NOT_ENOUGH);
                    return false;
                }
                if (mix.gold * num > gold) {
                    cb(ERROR_OBJ.MIX_GOLD_NOT_ENOUGH);
                    return false;
                }
                break;
            }
        }
        return true;
    }
    else {
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

//----------------------------------------------------------
// 实物兑换

function _didChangeInKind(req, dataObj, cb) {
    const FUNC = TAG + "_didChangeInKind() --- ";
    let uid = dataObj.uid;
    let token = dataObj.token;
    let change_id = "" + dataObj.change_id;
    let pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        if (!_checkChangeInKind1(account, change_id, cb)) return;

        _checkChangeInKind2(account, change_id, cb, function() {
            afterCheck();
        });

        function afterCheck() {

            let change_info = getChangeInfoFromId(change_id);

            // 兑换物品
            let item = change_info.item;
            let item_key = item[0];
            let item_num = item[1];

            let item_info = BuzzUtil.getItemById(item_key);
            if (null == item_info) {
                console.log(FUNC + "物品信息不存在——item_key:", item_key);
                cb(ERROR_OBJ.CIK_WRONG_ITEM);
                return;
            }
            let item_type = item_info.type;
            let item_list = {
                item_id: item_key,
                item_num: item_num,
            };
            switch(item_type) {
                case ItemType.GOLD:
                    account.gold = item_num;
                break;
                case ItemType.PEARL:
                    account.pearl = item_num;
                break;
                default:
                    // 兑换道具
                    if (typeof(account.package[item_type]) == "undefined") {
                        account.package[item_type] = {};
                    }
                    if (typeof(account.package[item_type][item_key]) == "undefined") {
                        account.package[item_type][item_key] = 0;
                    }
                    account.package[item_type][item_key] += item_num;
                break;
            }
            GameLog.addGameLog(item_list, account, SCENE.CIK, "话费券兑换获取");

            // 扣除相应的兑换券
            let tokens = account.package[ItemType.TOKENS]["i003"];
            let cost = change_info.cost;
            console.log(FUNC + "需要消耗兑换券:", cost);
            account.package[ItemType.TOKENS]["i003"] -= cost;
            let costItemList = {
                item_id: "i003",
                item_num: -cost,
            };
            GameLog.addGameLog(costItemList, account, SCENE.CIK, "话费券兑换时消耗");

            account.package = account.package;
            account.commit();

            // 修改缓存中的库存数量
            // CacheOperation.reduce(change_id, 1, 1);
            // CacheOperation.reduce(change_id, 2, 1);

            let data = {
                cid: change_id,
                value: 1,
            };
            HttpUtil.postBalance('/server_api/cik_reduce', data, function(ret) {
                HttpUtil.handleReturn(ret, function(err, values) {
                    prepareReturn();
                });
            });

            function prepareReturn() {

                let ret = {};
                ret.item_list = {
                    item_id:item_key, 
                    item_num:item_num
                };
                ret.change = {};
                ret.change.package = {
                    "9":{"i003":account.package[ItemType.TOKENS]["i003"]},
                };
                // console.log(FUNC + "item_type:", item_type);
                // console.log(FUNC + "ItemType.PEARL:", ItemType.PEARL);
                switch(item_type) {
                    case ItemType.GOLD:
                        ret.change.gold = account.gold;
                    break;
                    case ItemType.PEARL:
                        ret.change.pearl = account.pearl;
                    break;
                    default:
                        if (!ret.change.package[item_type]) {
                            ret.change.package[item_type] = {};
                        }
                        ret.change.package[item_type][item_key] = account.package[item_type][item_key];
                    break;
                }

                // 兑换记录
                // 可选参数
                let name = dataObj.name;
                let phone = dataObj.phone;
                let address = dataObj.address;
                let item_name_string_id = item_info.name;
                let item_name = string_strings_cfg[item_name_string_id].cn;

                let status = _initStatus(item_type);

                // 需要调用负载均衡服接口
                let data = {
                    uid: uid,
                    name: name,
                    phone: phone,
                    address: address,
                    created_at: new Date().getTime(),
                    // orderid: BuzzUtil.getOrderId(sn),
                    // sn: sn,
                    cid: change_id,
                    catalog: Math.floor(change_id / 1000),
                    count: item_num,
                    cost: cost,
                    itemname: item_name,
                    status: status,
                    icon: item_info.icon,
                };
                HttpUtil.postBalance('/server_api/add_cik_order', data, function(response) {
                    HttpUtil.handleReturn(response, function(err, data) {
                        // prepareReturn();
                        myDao.addChangeLog(data, function() {
                            let op_data = {cfg_id:change_id};
                            myDao.updateOperation(op_data, function() {
                                cb(null, ret);
                            });
                        });
                    });
                });
            }

        }

        function _initStatus(item_type) {
            switch(item_type) {
                case ItemType.CHANGE_FARE:
                case ItemType.CHANGE_PHONE:
                    return 0;
                default:
                    return 2;
            }
        }
    }
}

/**
 * 检查实物兑换是否满足条件.
 */
function _checkChangeInKind1(account, change_id, cb) {
    const FUNC = TAG + "_checkChangeInKind1() --- ";

    let change_info = getChangeInfoFromId(change_id);
    if (change_info == null) {
        cb(ERROR_OBJ.CIK_WRONG_CHANGE_ID);
        return false;
    }

    // 兑换券
    let tokens = 0;
    if (typeof(account.package[ItemType.TOKENS]) == "undefined") {
        cb(ERROR_OBJ.CIK_TOKEN_NOT_ENOUGH);
        return false;
    }
    if (typeof(account.package[ItemType.TOKENS]["i003"]) == "undefined") {
        cb(ERROR_OBJ.CIK_TOKEN_NOT_ENOUGH);
        return false;
    }
    tokens = account.package[ItemType.TOKENS]["i003"];

    // 需要的话费券是否足够判断
    console.log(FUNC + "需要消耗兑换券:", change_info.cost);
    console.log(FUNC + "拥有兑换券:", tokens);
    if (change_info.cost > tokens) {
        cb(ERROR_OBJ.CIK_TOKEN_NOT_ENOUGH);
        return false;
    }
    
    return true;
}


/**
 * 检查实物兑换是否满足条件.
 */
function _checkChangeInKind2(account, change_id, cb, next) {
    const FUNC = TAG + "_checkChangeInKind2() --- ";

    // let count = CacheOperation.findValueByCid(change_info.id, 1);
    // let total = CacheOperation.findValueByCid(change_info.id, 2);

    let change_info = getChangeInfoFromId(change_id);
    let data = {
        cid: change_info.id
    };
    HttpUtil.postBalance('/server_api/find_values_by_cid', data, function(ret) {
        HttpUtil.handleReturn(ret, function(err, values) {
            let count = values.count;
            let total = values.total;

            // 判断总库存是否足够
            if (total > 0) {
                cb(ERROR_OBJ.CIK_TOTAL_NOT_ENOUGH);
                return;
            }

            // 判断有没有库存
            if (count > 0) {
                cb(ERROR_OBJ.CIK_COUNT_NOT_ENOUGH);
                return;
            }

            next();
            // return true;
        });
    });
}

function getChangeInfoFromId(change_id) {
    for (let idx in change_change_cfg) {
        let record = change_change_cfg[idx];
        if (record.id == change_id) {
            return record;
        }
    }
    return null;
}

/**
 * 获取实物兑换记录
 */
function _didGetCikLog(req, dataObj, cb) {
    const FUNC = TAG + "_didGetCikLog() --- ";
    let uid = dataObj.uid;
    // let ret = CacheChange.findChangeLogByUid(uid);

    // 调用负载均衡服的接口获取此数据
    let data = { uid:uid };
    HttpUtil.postBalance('/server_api/get_cik_log', data, function(ret) {
        HttpUtil.handleReturn(ret, cb);
    });
}

/**
 * 返回兑换数据中的每日剩余数量
 */
function _didGetCikInfo(req, dataObj, cb) {
    const FUNC = TAG + "_didGetCikInfo() --- ";
    // let ret = CacheOperation.getChangeDailyLeft();

    // 调用负载均衡服的接口获取此数据
    let data = {};
    HttpUtil.postBalance('/server_api/get_cik_info', data, function(ret) {
        console.log(FUNC + "ret:", ret);
        HttpUtil.handleReturn(ret, cb);
    });
}

/**
 * 玩家取消实物兑换
 */
function _didCancelCik(req, dataObj, cb) {
    const FUNC = TAG + "_didCancelCik() --- ";
    let uid = dataObj.uid;
    let token = dataObj.token;
    let orderid = dataObj.orderid;
    let pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        // let success = CacheChange.cancelCik(uid, orderid);

        // TODO: 调用负载均衡服的接口获取此数据
        // 均衡服返回订单内容, 失败返回NULL
        let data = {
            uid: uid,
            orderid: orderid,
        };
        HttpUtil.postBalance('/server_api/cacel_cik', data, function(ret) {
            HttpUtil.handleReturn(ret, function(err, change) {
                if (change) {

                    myDao.cancelCik(orderid, function(err, result) {

                        // 返回兑换券
                        // let change = CacheChange.findChangeByUidAndOrderId(uid, orderid);
                        let cid = change.cid;
                        let change_info = BuzzUtil.getChangeById(cid);
                        let cost = change_info.cost;
                        let item_list = [{
                            item_id: "i003",
                            item_num: cost,
                        }];

                        BuzzUtil.putIntoPack(req, account, item_list, function(reward_info) {
                            let change = BuzzUtil.getChange(account, reward_info);
                            let ret = {
                                item_list: item_list,
                                change: change,
                            };
                            cb(null, ret);
                        })
                    });
                }
                else {
                    cb(ERROR_OBJ.CIK_CANCEL_FAIL);
                }
            });
        });
    }
}

/** 
 * 领取VIP每日奖励
 */
function _vipDailyReward(req, dataObj, cb) {
    const FUNC = TAG + "_vipDailyReward() --- ";
    let uid = dataObj.uid;
    let token = dataObj.token;
    let pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        if (account.vip_daily_reward == 1) {
            if (ERROR) console.error(FUNC + '玩家今日已经领取了VIP奖励');
            cb(ERROR_OBJ.VIP_DAILY_REWARD_GOTTEN);
            return;
        }

        // 加载配置表数据
        let gift_free = vip_vip_cfg[account.vip].gift_free;
        let item_list = transItemList(gift_free);

        BuzzUtil.putIntoPack(req, account, item_list, function(reward_info) {
            let change = BuzzUtil.getChange(account, reward_info);
            account.vip_daily_reward = 1;
            let ret = {
                item_list: item_list,
                change: change,
                vip_daily_reward: account.vip_daily_reward,
            };
            cb(null, ret);
            account.commit();

            DaoUtil.update('tbl_account', ["vip_daily_reward=1"], [{field:'id', operator:'=', value:uid}]);
        });
    }

}

/**
 * 转换数据格式
 * [["i001",1000]] -> [{item_id:"i001", item_num:1000}]
 */
function transItemList(input) {
    let item_list = [];
    for (let i = 0; i < input.length; i++) {
        item_list.push({
            item_id: input[i][0],
            item_num: input[i][1],
        });
    }
    return item_list;
}


//----------------------------------------------------------
// 通用

let ItemType = require('./pojo/Item').ItemType;