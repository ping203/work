const _ = require('underscore');
const CommonUtil = require('../buzz/CommonUtil');
const ObjUtil = require('../buzz/ObjUtil');
const DateUtil = require('./DateUtil');
const RandomUtil = require('../../../../utils/RandomUtil');
const StringUtil = require('./StringUtil');
const RedisUtil = require('./RedisUtil');
const buzz_reward = require('../buzz/buzz_reward');
const Reward = require('../buzz/pojo/Reward');
const ItemType = require('../buzz/pojo/Item').ItemType;
const ItemTypeC = require('../buzz/pojo/Item').ItemTypeC;
const DropRecord = require('../buzz/pojo/DropRecord');
const redisKeys = require('../../../../database').dbConsts.REDISKEY;
const dao_drop = require('../dao/dao_drop');
const CacheAccount = require('../buzz/cache/CacheAccount');
const CacheLink = require('../buzz/cache/CacheLink');
const api_map = require('../../controllers/api_map');
const gameConfig = require('../../../../utils/imports').GAME_CFGS;
const item_item_cfg = gameConfig.item_item_cfg;
const daily_quest_cfg = gameConfig.daily_quest_cfg;
const daily_vitality_cfg = gameConfig.daily_vitality_cfg;
const active_activequest_cfg=gameConfig.active_activequest_cfg;
const newweapon_upgrade_cfg = gameConfig.newweapon_upgrade_cfg;
const change_change_cfg = gameConfig.change_change_cfg;
const goddess_goddess_cfg = gameConfig.goddess_goddess_cfg;
const goddess_goddessup_cfg = gameConfig.goddess_goddessup_cfg;
const goddess_rankreward_cfg = gameConfig.goddess_rankreward_cfg;
const goddess_defend_cfg = gameConfig.goddess_defend_cfg;
const treasure_treasure_cfg = gameConfig.treasure_treasure_cfg;
const drop_droplist_cfg = gameConfig.drop_droplist_cfg;
const drop_drop_cfg = gameConfig.drop_drop_cfg;
const aquarium_petfish_cfg = gameConfig.aquarium_petfish_cfg;
const aquarium_petup_cfg = gameConfig.aquarium_petup_cfg;
const player_level_cfg = gameConfig.player_level_cfg;
const shop_pearl_cfg = gameConfig.shop_pearl_cfg;
const shop_card_cfg = gameConfig.shop_card_cfg;
const shop_fund_cfg = gameConfig.shop_fund_cfg;
const shop_gift_cfg = gameConfig.shop_gift_cfg;
const vip_vip_cfg = gameConfig.vip_vip_cfg;
const string_strings_cfg = gameConfig.string_strings_cfg;
const social_guerdon_cfg = gameConfig.social_guerdon_cfg;
const rank_ranklist_cfg = gameConfig.rank_ranklist_cfg;
const rank_rankgame_cfg = gameConfig.rank_rankgame_cfg;
const logger = loggerEx(__filename);

const TAG = "【BuzzUtil】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.checkParams = checkParams;
exports.cacheLinkDataApi = cacheLinkDataApi;
exports.cacheLinkAccountApi = cacheLinkAccountApi;
exports.cacheLinkAdminApi = cacheLinkAdminApi;
exports.getUidFromToken = getUidFromToken;

exports.putIntoPack = putIntoPack;
exports.removeFromPack = removeFromPack;
exports.getChange = getChange;
exports.getItemList = getItemList;
exports.getItemNum = getItemNum;
exports.getItemListByTid = getItemListByTid;
exports.getItemListFromDroplistId = getItemListFromDroplistId;

exports.getItemById = getItemById;
exports.getItemTypeById = getItemTypeById;
exports.getQuestById = getQuestById;
exports.getQuestListByConditionAndValue1 = getQuestListByConditionAndValue1;
exports.getVitalityByIdx = getVitalityByIdx;

exports.getGoddessById = getGoddessById;
exports.getGoddessUpByIdAndLevel = getGoddessUpByIdAndLevel;
exports.getGoddessChartRewardByRank = getGoddessChartRewardByRank;
exports.getTidByGidxAndWave = getTidByGidxAndWave;

exports.getWeaponByLevel = getWeaponByLevel;
exports.getWeaponUpgradeByLevel = getWeaponUpgradeByLevel;

exports.getOrderId = getOrderId;
exports.getChangeById = getChangeById;

exports.getPetfishFromId = getPetfishFromId;
exports.getPetupFromLevel = getPetupFromLevel;
exports.getRewardTimes4Petfish = getRewardTimes4Petfish;
exports.getDroplistIdFromTid = getDroplistIdFromTid;
exports.getDropInfoFromDropKey = getDropInfoFromDropKey;
exports.getDropServerLimit = getDropServerLimit;

exports.getPlayerLevelByLevel = getPlayerLevelByLevel;

exports.getShopPearlById = getShopPearlById;
exports.getShopGoldByAmount = getShopGoldByAmount;
exports.getShopCardById = getShopCardById;
exports.getShopFundById = getShopFundById;
exports.getShopGiftById = getShopGiftById;

exports.makeRewardList = _makeRewardList;
exports.getChangeFromItemList = getChangeFromItemList;

exports.getAchieveQuestIdByMission = getAchieveQuestIdByMission;
exports.getGoldQuestIdByMission = getGoldQuestIdByMission;
exports.getWeaponLevelQuestIdByMission = getWeaponLevelQuestIdByMission;
exports.getWeaponSkinQuestIdByMission = getWeaponSkinQuestIdByMission;

exports.getGoldRewardFromItemList = getGoldRewardFromItemList;
exports.getAchieveRewardFromItemList = getAchieveRewardFromItemList;

exports.checkDrop = _checkDrop;

exports.getVipGiveItem = getVipGiveItem;
exports.getCNName = getCNName;
exports.isCanGiveItem = isCanGiveItem;
exports.isNotice = isNotice;
exports.rewardPeopleCostByDiamonds = rewardPeopleCostByDiamonds;
exports.getChartRewardByTypeAndRank = getChartRewardByTypeAndRank;
exports.getSeasonRewardFromRankgameCfg = getSeasonRewardFromRankgameCfg;
exports.getRankIdFromPoints = getRankIdFromPoints;
exports.getRankIdFromPointsAndRank = getRankIdFromPointsAndRank;
exports.getMaxFriendNum = getMaxFriendNum;
exports.isBomb = isBomb;
exports.getActivequestById=getActivequestById;

exports.addCoin = addCoin;
exports.useCoin = useCoin;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
function checkParams(input, params, hint, cb) {
    for (let i = 0; i < params.length; i++) {
        let param_name = params[i];
        let param = input[params[i]];
        if (!CommonUtil.isParamExist(hint, param, "接口调用请传参数" + param_name, cb)) return false;
    }
    return true;
}

/**
 * 记录连接状态到缓存中(data_api).
 */
function cacheLinkDataApi(data, api_name) {
    if (!data.uid && data.token) {
        data.uid = getUidFromToken(data.token);
    }
    if (data.uid) {
        _cacheLink(data, api_name, api_map.DATA_API);
    }
}

/**
 * 记录连接状态到缓存中(account_api).
 */
function cacheLinkAccountApi(data, api_name) {
    if (!data.uid && data.token) {
        data.uid = getUidFromToken(data.token);
    }
    if (data.uid) {
        _cacheLink(data, api_name, api_map.ACCOUNT_API);
    }
}

/**
 * 暂未使用
 * 记录连接状态到缓存中(admin_api).
 */
function cacheLinkAdminApi(data, api_name) {
    _cacheLink(data, api_name, api_map.ADMIN_API);
}

/**
 * 从token获取uid.
 */
function getUidFromToken(token) {
    return parseInt(token.split("_")[0]);
}

/**
 * 将物品放到背包中.
 * @param account
 * @param item_list 结构为[{item_id:?, item_num:?},{},...]
 */
function putIntoPack(req, account, item_list, cb) {
    let reward_list = _makeRewardList(item_list);

    buzz_reward.getReward(req, account, reward_list, function() {
        let reward = ObjUtil.str2Data(reward_list);
        cb(new Reward(reward));
    });
}

/**
 * 从背包中移除物品.
 * @param account
 * @param item_list 结构为[{item_id:?, item_num:?},{},...]
 */
function removeFromPack(req, account, item_list, cb) {
    let reward_list = _makeRewardList(item_list);

    buzz_reward.cost(req, account, reward_list, function() {
        let reward = ObjUtil.str2Data(reward_list);
        cb(new Reward(reward));
    });
}

/**
 * 获取改变量.
 * @param account 缓存中的用户信息.
 * @param item_list 玩家新获取的物品信息.
 */
function getChange(account, rewardInfo) {
    const FUNC = TAG + "getChange() --- ";
    logger.info(FUNC + "CALL...");

    let change = {};

    let gold = rewardInfo.gold;
    let pearl = rewardInfo.pearl;
    let active_point = rewardInfo.active_point;
    let achieve_point = rewardInfo.achieve_point;
    let skill_inc = rewardInfo.skill;
    let debris_inc = rewardInfo.debris;
    let gift_inc = rewardInfo.gift;
    let tokens_inc = rewardInfo.tokens;
    let mix_inc = rewardInfo.mix;
    let skin_inc = rewardInfo.skin;
    let skin_debris_inc = rewardInfo.skin_debris;

        logger.info(FUNC + "gold:", gold);
        logger.info(FUNC + "pearl:", pearl);
        logger.info(FUNC + "active_point:", active_point);
        logger.info(FUNC + "achieve_point:", achieve_point);
        logger.info(FUNC + "skill_inc:", skill_inc);
        logger.info(FUNC + "debris_inc:", debris_inc);
        logger.info(FUNC + "gift_inc:", gift_inc);
        logger.info(FUNC + "tokens_inc:", tokens_inc);
        logger.info(FUNC + "mix_inc:", mix_inc);
        logger.info(FUNC + "skin_inc:", skin_inc);
        logger.info(FUNC + "skin_debris_inc:", skin_debris_inc);

    // gold: 40000
    if (gold > 0) {
        change.gold = account.gold;
    }
    if (pearl > 0) {
        change.pearl = account.pearl;
    }
    if (active_point > 0) {
        change.active_point = account.mission_daily_reset.dailyTotal;
    }
    if (achieve_point > 0) {
        change.achieve_point = account.achieve_point;
    }
    // skill_inc: { '1': 3, '3': 3 }
    if (skill_inc && _.keys(skill_inc).length > 0) {
        change.skill = {};
        for (let idx in skill_inc) {
            change.skill[idx] = account.skill[idx];
            CacheAccount.addSkill(account.id, [{sid:idx, num:skill_inc[idx]}]);
        }
    }
    // debris_inc: { i603: 8, i702: 4, i623: 4 }
    if (debris_inc && _.keys(debris_inc).length > 0) {
        if (!change.package) change.package = {};
        if (!change.package[ItemTypeC.DEBRIS]) change.package[ItemTypeC.DEBRIS] = {};
        for (let idx in debris_inc) {
            if (change.package && change.package[ItemTypeC.DEBRIS]
                && account.package && account.package[ItemTypeC.DEBRIS]) {
                change.package[ItemTypeC.DEBRIS][idx] = account.package[ItemTypeC.DEBRIS][idx];
            }
        }
    }
    if (gift_inc && _.keys(gift_inc).length > 0) {
        if (!change.package) change.package = {};
        if (!change.package[ItemTypeC.GIFT]) change.package[ItemTypeC.GIFT] = {};
        for (let idx in gift_inc) {
            if (change.package && change.package[ItemTypeC.GIFT]
                && account.package && account.package[ItemTypeC.GIFT]) {
                change.package[ItemTypeC.GIFT][idx] = account.package[ItemTypeC.GIFT][idx];
            }
        }
    }
    if (tokens_inc && _.keys(tokens_inc).length > 0) {
        if (!change.package) change.package = {};
        if (!change.package[ItemTypeC.TOKENS]) change.package[ItemTypeC.TOKENS] = {};
        for (let idx in tokens_inc) {
            if (change.package && change.package[ItemTypeC.TOKENS]
                && account.package && account.package[ItemTypeC.TOKENS]) {
                change.package[ItemTypeC.TOKENS][idx] = account.package[ItemTypeC.TOKENS][idx];
            }
        }
    }
    if (mix_inc && _.keys(mix_inc).length > 0) {
        if (!change.package) change.package = {};
        if (!change.package[ItemTypeC.MIX]) change.package[ItemTypeC.MIX] = {};
        for (let idx in mix_inc) {
            if (change.package && change.package[ItemTypeC.MIX]
                && account.package && account.package[ItemTypeC.MIX]) {
                change.package[ItemTypeC.MIX][idx] = account.package[ItemTypeC.MIX][idx];
            }
        }
    }

    if (skin_inc && _.keys(skin_inc).length > 0) {
        if (!change.package) change.package = {};
        if (!change.package[ItemTypeC.SKIN]) change.package[ItemTypeC.SKIN] = {};
        for (let idx in skin_inc) {
            if (change.package && change.package[ItemTypeC.SKIN]
                && account.package && account.package[ItemTypeC.SKIN]) {
                change.package[ItemTypeC.SKIN][idx] = account.package[ItemTypeC.SKIN][idx];
            }
        }
    }
    if (skin_debris_inc && _.keys(skin_debris_inc).length > 0) {
        if (!change.package) change.package = {};
        if (!change.package[ItemTypeC.SKIN_DEBRIS]) change.package[ItemTypeC.SKIN_DEBRIS] = {};
        for (let idx in skin_debris_inc) {
            if (change.package && change.package[ItemTypeC.SKIN_DEBRIS]
                && account.package && account.package[ItemTypeC.SKIN_DEBRIS]) {
                change.package[ItemTypeC.SKIN_DEBRIS][idx] = account.package[ItemTypeC.SKIN_DEBRIS][idx];
            }
        }
    }

    logger.info(FUNC + "change:", change);

    return change;
}

/**
 * 获取物品列表
 * @param items 配置表中的物品数组 [["i016",1],...]
 * @return [{item_id:"i106", item_num:1},...]
 */
function getItemList(items) {
    let item_list = [];
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        item_list.push({
            item_id: item[0],
            item_num: item[1],
        });
    }
    return item_list;
}

/**
 * 从treasure_id返回item_list.
 */
function getItemListByTid(account, tid) {
    let drop_list = _getDropListFromTreasureId(account, tid);
    let item_list = _getItemList(drop_list);
    return item_list;
}

/**
 * 从droplist_key返回item_list.
 */
function getItemListFromDroplistId(account, droplist_key, dropcount, pool) {
    let drop_list = _getDropListFromDroplistId(account, droplist_key, dropcount, pool);
    let item_list = _getItemList(drop_list);
    return item_list;
}

/**
 * 获取玩家背包中某物品拥有数量.
 * @param account 玩家数据.
 * @param type 物品类型.
 * @param id 物品ID.
 */
function getItemNum(account, type, id) {
    const FUNC = TAG + "getItemNum() --- ";
    logger.info(FUNC + "type:", type);
    logger.info(FUNC + "id:", id);
    if (ItemType.SKILL == type) {
        logger.info(FUNC + "技能物品");
        let skill_id = getItemById(id).id;
        if (null == account.skill) {
            logger.error(FUNC + "null == account.skill");
            return 0;
        }
        if (null == account.skill[skill_id]) {
            logger.error(FUNC + "null == account.skill[skill_id]");
            return 0;
        }
        logger.info(FUNC + "account.skill[skill_id]:", account.skill[skill_id]);
        return account.skill[skill_id];
    }
    else {
        if (null == account.package) {
            return 0;
        }
        if (null == account.package[type]) {
            return 0;
        }
        if (null == account.package[type][id]) {
            return 0;
        }
        return account.package[type][id];
    }
}

function getItemById(item_key) {
    return item_item_cfg[item_key];
}

function getItemTypeById(item_key) {
    return item_item_cfg[item_key].type;
}

function getQuestById(quest_id) {
    for (let idx in daily_quest_cfg) {
        let quest = daily_quest_cfg[idx];
        if (quest_id == quest.id) {
            return quest;
        }
    }
    return null;
}

function getActivequestById(id){
    for(let idx in active_activequest_cfg){
        let quest = active_activequest_cfg[idx];
        if(id == quest.id){
            return quest;
        }
    }
}

/**
 * 由两个条件决定一组相同的任务
 */
function getQuestListByConditionAndValue1(condition, value1) {
    let ret = [];
    for (let idx in daily_quest_cfg) {
        let quest = daily_quest_cfg[idx];
        if (condition == quest.condition && value1 == quest.value1) {
            ret.push(quest.id);
        }
    }
    return ret;
}

/**
 * 根据索引获取活跃值领奖数据.
 */
function getVitalityByIdx(idx) {
    if (idx < 0 || idx >= daily_vitality_cfg.length) {
        return null;
    }
    return daily_vitality_cfg[idx];
}

/**
 * 从女神ID获取女神的数据
 */
function getGoddessById(id) {
    for (let idx in goddess_goddess_cfg) {
        let goddess = goddess_goddess_cfg[idx];
        if (id == goddess.id) {
            return goddess;
        }
    }
    return null;
}

/**
 * 从女神ID和等级获取女神的升级数据.
 */
function getGoddessUpByIdAndLevel(id, level) {
    for (let idx in goddess_goddessup_cfg) {
        let goddessup = goddess_goddessup_cfg[idx];
        if (id == goddessup.id && level == goddessup.level) {
            return goddessup;
        }
    }
    return null;
}

/**
 * 从保卫女神的排名获取奖励数组.
 * @param rank 玩家的排名
 */
function getGoddessChartRewardByRank(rank, max_wave) {
    for (let i = 0; i < goddess_rankreward_cfg.length; i++) {
        let rankreward_info = goddess_rankreward_cfg[i];
        let interval = rankreward_info.interval;
        // interval为INT
        if (i > 0) {
            let rankreward_info_last = goddess_rankreward_cfg[i - 1];
            let interval_last = rankreward_info_last.interval;
            if (rank >= interval_last && rank <= interval) {
                return getWeekRewardByMaxWave(rankreward_info, i, max_wave);
            }
        }
        else {
            if (rank <= interval) {
                return getWeekRewardByMaxWave(rankreward_info, i, max_wave);
            }
        }
    }
    return [];

    function getWeekRewardByMaxWave(rankreward_info, i, max_wave) {
        let limit = rankreward_info.limit;
        if (max_wave < limit) {
            if (i >= goddess_rankreward_cfg.length - 1) {
                return [];
            }
            else {
                rankreward_info = goddess_rankreward_cfg[i + 1];
                return getWeekRewardByMaxWave(rankreward_info, i + 1, max_wave);
            }
        }
        return rankreward_info.weekreward;
    }
}

/**
 * 从波数和女神索引获取宝箱ID.
 */
function getTidByGidxAndWave(gidx, wave) {
    let defend = getDefendByWave(wave);
    if (null != defend) {
        return defend.treasure[gidx];
    }
    return null;
}

function getDefendByWave(wave) {
    for (let idx in goddess_defend_cfg) {
        let defend = goddess_defend_cfg[idx];
        if (defend.id == wave) {
            return defend;
        }
    }
    return null;
}

let weaponLevelList = [];
if (weaponLevelList.length == 0) {
    for (let idx in newweapon_upgrade_cfg) {
        let weapon = newweapon_upgrade_cfg[idx];
        weaponLevelList.push(weapon.weaponlevel);
    }
}

/**
 * 根据炮的倍率(等级)返回对应炮的信息.
 */
function getWeaponByLevel(level) {
    for (let idx in newweapon_upgrade_cfg) {
        let weapon = newweapon_upgrade_cfg[idx];
        if (weapon.weaponlevel == level) {
            return newweapon_upgrade_cfg[idx];
        }
    }
    return null;
}

/**
 * 获得武器升级到下一级的武器数据.
 */
function getWeaponUpgradeByLevel(level) {
    let next_level = level;
    for (let i = 0; i < weaponLevelList.length; i++) {
        if (weaponLevelList[i] == level) {
            if (i + 1 < weaponLevelList.length) {
                next_level = weaponLevelList[i + 1];
            }
            else {
                // 已经升级到最大等级, 不能再升级了
                return null;
            }
        }
    }
    return getWeaponByLevel(next_level);
}

function getOrderId(sn) {
    return DateUtil.format(new Date(), "yyyyMMdd") + fillNumber(sn, '0', 10);
}

function getChangeById(cid) {
    for (let idx in change_change_cfg) {
        let change = change_change_cfg[idx];
        if (cid == change.id) {
            return change;
        }
    }
    return null;
}

/**
 * 获取宠物鱼数据.
 */
function getPetfishFromId(id) {
    for (let idx in aquarium_petfish_cfg) {
        let petfish = aquarium_petfish_cfg[idx];
        if (id == petfish.id) {
            return petfish;
        }
    }
    return null;
}

/**
 * 获取宠物鱼升级数据.
 */
function getPetupFromLevel(lv) {
    for (let idx in aquarium_petup_cfg) {
        let petup = aquarium_petup_cfg[idx];
        if (lv == petup.level) {
            return petup;
        }
    }
    return null;
}

/**
 * petfish:
 * id
 * lefttime
 * level
 * starttime
 * state
 * time
 */
function getRewardTimes4Petfish(_petfish, goddess_id, goddess_lv) {
    let petfish_id = _petfish.id;
    let petfish_lv = _petfish.level;
    let petfish = getPetfishFromId(petfish_id);
    let petup = getPetupFromLevel(petfish_lv);
    let ret = 0;
    if (petfish != null && petup != null) {
        let probase = petfish.probase;
        let progoldadd = petup.progoldadd;
        let progoddess = 0;
        // 女神加成(等级和阵营判断)
        if (petfish.camp == goddess_id) {
            let goddessup = getGoddessUpByIdAndLevel(goddess_id, goddess_lv);
            if(goddessup.property==7) {
                progoddess = goddessup.value;
            }
        }
        ret = probase + progoldadd + progoddess;
    }
    return ret;
}

/**
 * 获取掉落列表(通过treasure_id查询).
 */
function getDroplistIdFromTid(tid) {
    for (let idx in treasure_treasure_cfg) {
        let treasure_info = treasure_treasure_cfg[idx];
        if (treasure_info.id == tid) {
            return treasure_info.dropid;
        }
    }
    return null;
}

function getDropInfoFromDropKey(drop_key) {
    return drop_drop_cfg[drop_key];
}

/**
 * 遍历drop_drop_cfg, 筛选出需要全服限制的数据(count_limit != [0])
 */
function getDropServerLimit() {
    const FUNC = TAG + "getDropServerLimit() --- ";
    let ret = {};
    for (let drop_key in drop_drop_cfg) {
        let drop_info = drop_drop_cfg[drop_key];
        let limit_type = drop_info.limit_type;
        let limit_count = drop_info.limit_count;
        if (limit_count && limit_count.length >= 1 && limit_count[0] > 0) {
            ret[drop_key] = drop_info;
        }
    }
    return ret;
}

function getChangeFromItemList(account, item_list) {
    let reward_list = _makeRewardList(item_list);
    let reward = ObjUtil.str2Data(reward_list);
    let reward_info = new Reward(reward);
    let change = getChange(account, reward_info);
    return change;
}

//==============================================================================
// private
//==============================================================================
function _cacheLink(data, api_name, api_type) {
    let api_info = api_type[api_name];
    let timestamp = new Date().getTime();
    let uid = data.uid;
    if (api_info.record) {
        CacheLink.push({
            uid: data.uid,
            linked_at: timestamp,
            api: api_info.flag,
        });
    }
    // 每次玩家调用API都会更新玩家的最近在线时间.
    RedisUtil.hset(redisKeys.LAST_ONLINE_TIME, uid, timestamp);
    RedisUtil.hset(redisKeys.TOBE_STORED, uid, 1);
}

function _makeRewardList(item_list) {
    let reward_list = [];
    for (let i = 0; i < item_list.length; i++) {
        let item = item_list[i];
        let reward = [item.item_id, item.item_num];
        reward_list.push(reward);
    }
    return reward_list;
}

function fillNumber(input, fill_char, total_length) {
    let cur_length = StringUtil.strLen("" + input);
    logger.info('total_length: ' + total_length);
    logger.info('cur_length: ' + cur_length);
    for (let i = 0; i < total_length - cur_length; i++) {
        input = fill_char + input;
    }
    logger.info('input: ' + input);
    return input;
}

/**
 * 获取掉落表(通过treasure_id查询).
 */
function _getDropListFromTreasureId(account, bid) {
    let drop_list = [];
    for (let idx in treasure_treasure_cfg) {
        let treasure_info = treasure_treasure_cfg[idx];
        if (treasure_info.id == bid) {
            let droplist_key = treasure_info.dropid;
            let dropcount = treasure_info.dropcount;
            drop_list = _getDropListFromDroplistId(account, droplist_key, dropcount);
        }
    }
    return drop_list;
}

/**
 * 获取掉落表(通过droplist_key查询).
 */
function _getDropListFromDroplistId(account, droplist_key, dropcount, pool) {
    const FUNC = TAG + "_getDropListFromDroplistId() --- ";
    let drop_list = [];
    let drop_info = drop_droplist_cfg[droplist_key];
    if (drop_info) {
        for (let i = 0; i < dropcount; i++) {
            drop_list.push(RandomUtil.randomDrop(drop_info));
        }
        drop_list = _checkDrop(account, drop_list, pool);
        return drop_list;
    }
    else {
        logger.error(FUNC + "drop_info为空, droplist_key:", droplist_key);
        return null;
    }
}

/**
 * 验证掉落是否成功.
 */
function _checkDrop(account, drop_list, pool) {
    let ret = [];
    if (!account) return ret;
    account.drop_once = account.drop_once || {};
    account.drop_reset = account.drop_reset || {};

    // 验证drop_list中的每一项是否掉落成功
    for (let i = 0; i < drop_list.length; i++) {
        let drop_arr = drop_list[i];
        let new_drop_arr = [];
        for (let j = 0; j < drop_arr.length; j++) {
            let drop_key = drop_arr[j];
            let drop_info = drop_drop_cfg[drop_key];
            drop_info.drop_key = drop_key;
            // 在drop_reset和drop_once中增加掉落进度
            let account_drop = _getAccountDrop(account, drop_info);
            if (account_drop) {
                // 没有记录则初始化
                if (!account_drop[drop_key]) {
                    account_drop[drop_key] = 0;
                }

                // DONE: 先判断全服掉落限制
                if (canServerDrop(drop_info, account.platform)) {
                    let probability = _getProbability(drop_info, account_drop, drop_key);
                    let random = RandomUtil.randomInt(100000);
                    if (random < probability) {
                        new_drop_arr.push(drop_arr[j]);
                        cutServerDrop(drop_info, account.platform, pool);
                    }
                }
                account_drop[drop_key]++;
                if (0 == drop_info.reset) {
                    account.drop_once = account_drop;
                    account.commit();
                }
                else if (1 == drop_info.reset) {
                    account.drop_reset = account_drop;
                    account.commit();
                }
            }
        }
        if (new_drop_arr.length > 0) {
            ret.push(new_drop_arr);
        }
    }
    return ret;
}

const LIMIT_TYPE = {
    DAILY: 1,
    HOUR: 2,
};

/**
 * 服务器是否还能掉落，需要负载服来进行统一数据支持
 */
function canServerDrop(drop_info, platform) {
    const FUNC = TAG + "canServerDrop() --- ";
    if (isDropServerLimit(drop_info)) {
        logger.info(FUNC + "platform:", platform);
        let key = makeDropKey(drop_info, platform);
        let current_value = DropRecord.getCurrentValue(key);
        return current_value > 0;
    }
    else {
        return true;
    }
}

function makeDropKey(drop_info, platform) {
    return drop_info.drop_key + "_" + DateUtil.getHourIdx() + "_" + platform;
}

function isDropServerLimit(drop_info) {
    const FUNC = TAG + "isDropServerLimit() --- ";
    let limit_count = drop_info.limit_count;
    let limit_type = drop_info.limit_type;
    if (limit_type == LIMIT_TYPE.DAILY) {
        logger.info(FUNC + "全服限制按天算");
    }
    else if (limit_type == LIMIT_TYPE.HOUR) {
        logger.info(FUNC + "全服限制按小时算");
    }
    return !(limit_count.length == 1 && limit_count[0] == 0);
}

function cutServerDrop(drop_info, platform, pool) {
    const FUNC = TAG + "cutServerDrop() --- ";
    if (isDropServerLimit(drop_info)) {
        logger.error(FUNC + "是全服限制的掉落"); 
        let key = makeDropKey(drop_info, platform);
        DropRecord.cutServerDrop(key);
        // 更新数据库的值并将返回值用于重置DropRecord的值
        if (pool) {
            logger.info(FUNC + "更新数据库的值并将返回值用于重置DropRecord的值"); 
            dao_drop.cutServerDrop(pool, key, function(err, results) {

            });
        }
        else {
            logger.error(FUNC + "pool == null, 无法更新数据库的全服掉落限制值"); 
        }
    }
    else {
        logger.error(FUNC + "不是全服限制的掉落"); 
    }
}

/**
 * 获取账号掉落记录(重置或不重置).
 */
function _getAccountDrop(account, drop) {
    // 不重置
    if (0 == drop.reset) {
        return account.drop_once;
    }
    // 重置
    if (1 == drop.reset) {
        return account.drop_reset;
    }
}

/**
 * 获取当前掉落的概率(100000为分母).
 */
function _getProbability(drop, account_drop, drop_key) {
    let drop_idx = account_drop[drop_key];
    let item_probability = drop.item_probability;
    if (drop_idx < item_probability.length) {
        return item_probability[drop_idx];
    }
    else {
        return item_probability[item_probability.length - 1];
    }
}

/**
 * 获取物品表.
 */
function _getItemList(drop_list) {
    let item_list = [];
    for (let i = 0; i < drop_list.length; i++) {
        let drop_arr = drop_list[i];
        for (let j = 0; j < drop_arr.length; j++) {
            let drop_key = drop_arr[j];
            let drop_info = drop_drop_cfg[drop_key];
            item_list.push({
                item_id: drop_info.item_id,
                item_num: drop_info.item_num,
                drop_count: drop_info.drop_count,
            });
        }
    }
    return item_list;
}

/**
 * 根据等级获得相应的玩家信息.
 */
function getPlayerLevelByLevel(level) {
    for (let i = 0; i < player_level_cfg.length; i++) {
        let player_level = player_level_cfg[i];
        if (player_level.level == level) {
            return player_level;
        }
    }
    return null;
}

/**
 * 获取购买钻石的相关信息.
 */
function getShopPearlById(id) {
    for (let idx in shop_pearl_cfg) {
        let shop_pearl = shop_pearl_cfg[idx];
        if (shop_pearl.id == id) {
            return shop_pearl;
        }
    }
    return null;
}


function getShopGoldByAmount(amount){
    for (let idx in shop_pearl_cfg) {
        let shop_pearl = shop_pearl_cfg[idx];
        if (amount == shop_pearl.price) {
            return shop_pearl;
        }
    }
    return null;
} 

/**
 * 获取购买月卡的相关信息.
 */
function getShopCardById(id) {
    for (let idx in shop_card_cfg) {
        let shop_card = shop_card_cfg[idx];
        if (shop_card.id == id) {
            return shop_card;
        }
    }
    return null;
}

/**
 * 获取购买翻盘基金的相关信息.
 */
function getShopFundById(id) {
    for (let idx in shop_fund_cfg) {
        let shop_fund = shop_fund_cfg[idx];
        if (shop_fund.id == id) {
            return shop_fund;
        }
    }
    return null;
}

/**
 * 获取商城礼包相关信息.
 */
function getShopGiftById(id) {
    for (let idx in shop_gift_cfg) {
        let shop_gift = shop_gift_cfg[idx];
        if (shop_gift.id == id) {
            return shop_gift;
        }
    }
    return null;
}

/** 成就任务类型 */
const MISSON_TYPE = {
    ACHIEVE: 2170,
    GOLD: 2090,
    WEAPON_LEVEL: 2040,
    WEAPON_SKIN: 2060,
};

/**
 * 从任务进度中获取指定类型的任务ID
 * @param mission 任务对象
 * @param type 类型
 */
function getQuestIdByMission(mission, type) {
    for (let id in mission) {
        if (Math.floor(id / 100) == type) {
            return id;
        }
    }
    // 不能返回null, 如果mission中没有则需要初始化
    let init_mission_id = type + "00";
    mission[init_mission_id] = 0;
    return init_mission_id;
}

/** 从任务进度中获取成就点累加任务的任务ID. */
function getAchieveQuestIdByMission(mission) {
    return getQuestIdByMission(mission, MISSON_TYPE.ACHIEVE);
}

/** 从任务进度中获取金币累加任务的任务ID. */
function getGoldQuestIdByMission(mission) {
    return getQuestIdByMission(mission, MISSON_TYPE.GOLD);
}

/** 从任务进度中获取武器升级任务的任务ID. */
function getWeaponLevelQuestIdByMission(mission) {
    return getQuestIdByMission(mission, MISSON_TYPE.WEAPON_LEVEL);
}

/** 从任务进度中获取武器皮肤任务的任务ID. */
function getWeaponSkinQuestIdByMission(mission) {
    return getQuestIdByMission(mission, MISSON_TYPE.WEAPON_SKIN);
}

/**
 * 获取金币奖励数
 */
function getGoldRewardFromItemList(item_list) {
    for (let i in item_list) {
        let item_id = item_list[i].item_id;
        if (item_id == "i001") {
            return item_list[i].item_num;
        }
    }
    return 0;
}

/**
 * 获取成就点奖励数
 */
function getAchieveRewardFromItemList(item_list) {
    for (let i in item_list) {
        let item_id = item_list[i].item_id;
        if (item_id == "i103") {
            return item_list[i].item_num;
        }
    }
    return 0;
}

/**
 * 查看是否拥有送礼物权限
 */
function getVipGiveItem(vip) {
    const FUNC = TAG + "getVipGiveItem() --- ";
    if(!vip) {
        return 0;
    }
    return vip_vip_cfg[vip].vip_giveItem;
}

/**
 * 查看好友上限
 */
function getMaxFriendNum(vip) {
    const FUNC = TAG + "getMaxFriendNum() --- ";
    if(!vip) {
        vip=0;
    }
    return vip_vip_cfg[vip].friend;
}

/**
 * 查看string对应的中文名称
 */
function getCNName(item_name_string_id) {
    const FUNC = TAG + "getCNName() --- ";
    if(!item_name_string_id)return;
    return string_strings_cfg[item_name_string_id].cn;
}

function isBomb(itemId) {
    if(itemId=="i015"||itemId=="i016"||itemId=="i017") {
        return true;
    }
    return false;
}

/**
 * 查看物品是否可以打赏
 * @param item
 */
function isCanGiveItem(item) {
    if (!item)return;
    for (let i = 0; i < social_guerdon_cfg.length; i++) {
        for (let j = 0; j < social_guerdon_cfg[i].reward.length; j++) {
            let itemid = social_guerdon_cfg[i].reward[j][0];
            let num = social_guerdon_cfg[i].reward[j][1];
            if (item[0][0] == itemid && item[0][1] == num) {
                return true;
            }
        }
    }
    return false;
}

/**
 * 打赏物品是否需要公告
 * @param item
 */
function isNotice(item) {
    if (!item)return;
    for (let i = 0; i < social_guerdon_cfg.length; i++) {
        for (let j = 0; j < social_guerdon_cfg[i].notice.length; j++) {
            let itemid = social_guerdon_cfg[i].reward[j][0];
            let num = social_guerdon_cfg[i].reward[j][1];
            if (item[0][0] == itemid && item[0][1] == num) {
                return social_guerdon_cfg[i].notice[j]==1;
            }
        }
    }
    return false;
}

/**
 * 打赏物品消耗钻石
 * @param item
 */
function rewardPeopleCostByDiamonds(item) {
    if (!item)return;
    for (let i = 0; i < social_guerdon_cfg.length; i++) {
        for (let j = 0; j < social_guerdon_cfg[i].notice.length; j++) {
            let itemid = social_guerdon_cfg[i].reward[j][0];
            let num = social_guerdon_cfg[i].reward[j][1];
            if (item[0][0] == itemid && item[0][1] == num) {
                return social_guerdon_cfg[i].price[j];
            }
        }
    }
    return false;
}

/**
 * 由类型和排名决定获取的物品列表
 */
function getChartRewardByTypeAndRank(type, rank) {
    for (let i = 0; i < rank_ranklist_cfg.length; i++) {
        let info = rank_ranklist_cfg[i];
        if (info.type == type && rank >= info.interval[0] && rank <= info.interval[1]) {
            return info.reward;
        }
    }
    return null;
}

/**
 * 从配置表获取赛季奖励信息.
 */
function getSeasonRewardFromRankgameCfg(rank_id) {
    for (let idx in rank_rankgame_cfg) {
        let rankgame_info = rank_rankgame_cfg[idx];
        if (rankgame_info.id == rank_id) {
            return rankgame_info.seasonreward;
        }
    }
}

/**
 * 从玩家的比赛积分计算玩家的段位
 */
function getRankIdFromPoints(points) {
    for (let i = rank_rankgame_cfg.length - 1; i > 0; i--) {
        let rank_info = rank_rankgame_cfg[i];
        if (points >= rank_info.integral) {
            return rank_info.id;
        }
    }
}

/**
 * 从玩家的比赛积分和排名计算玩家的段位(只计算胜点在3600yishangzhe)
 */
function getRankIdFromPointsAndRank(points, rank) {
    let count = rank_rankgame_cfg.length;
    let min_integral = rank_rankgame_cfg[count - 2].integral;
    // 胜点达不到判定指标直接返回false
    // 为什么不调用getRankIdFromPoints返回段位?
    // 一些场合需要立即停止判定，后面的玩家无需进入此逻辑.
    if (points < min_integral) {
        return 0;
    }
    if (points >= min_integral) {
        let rank_info_1 = rank_rankgame_cfg[count - 1];
        let rank_info_2 = rank_rankgame_cfg[count - 2];
        let rank_info_3 = rank_rankgame_cfg[count - 3];
        if (points >= rank_info_1.integral) {
            // 最强王者
            if (rank == 0) {
                return rank_info_1.id;
            }
            // 十大高手
            else if (rank > 0 && rank <= 9) {
                return rank_info_2.id;
            }
            // 钻石一段
            else {
                return rank_info_3.id;
            }
        }
        else if (points >= rank_info_2.integral) {
            // 十大高手
            if (rank >= 0 && rank <= 9) {
                return rank_info_2.id;
            }
            // 钻石一段
            else {
                return rank_info_3.id;
            }
        }
    }
}

/**
 * 增加游戏币(金币，钻石，话费券)
 */
function addCoin(account, coinId, num, cb) {
    let req = {
        pool: mysqlPool,
        dao: myDao
    };

    let item_list = [{
        item_id: coinId,
        item_num: num
    }];

    putIntoPack(req, account, item_list, cb); 
}

/**
 * 减少游戏币(金币，钻石，话费券)
 */
function useCoin(account, coinId, num, cb) {
    let req = {
        pool: mysqlPool,
        dao: myDao
    };

    let item_list = [{
        item_id: coinId,
        item_num: num
    }];

    removeFromPack(req, account, item_list, cb); 
}
