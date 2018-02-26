const async = require('async');
const CstError = require('./cst/buzz_cst_error');
const ERROR_OBJ = CstError.ERROR_OBJ;
const redisKesy = require('../../../../database').dbConsts.REDISKEY;
const ObjUtil = require('./ObjUtil');
const DateUtil = require('../utils/DateUtil');
const BuzzUtil = require('../utils/BuzzUtil');
const ArrayUtil = require('../utils/ArrayUtil');
const RedisUtil = require('../utils/RedisUtil');
const RandomUtil = require('../utils/RandomUtil');
const DaoCommon = require('../dao/dao_common');
const CacheWeapon = require('./cache/CacheWeapon');
const CacheAccount = require('./cache/CacheAccount');
const gameConfig = require('../../../../utils/imports').GAME_CFGS;
const newweapon_upgrade_cfg = gameConfig.newweapon_upgrade_cfg;
const newweapon_star_cfg = gameConfig.newweapon_star_cfg;
const newweapon_weapons_cfg = gameConfig.newweapon_weapons_cfg;
const logger = loggerEx(__filename);

let MIN_WEAPON_ID = 1;
let MAX_WEAPON_ID = MIN_WEAPON_ID;
for (let id in newweapon_weapons_cfg) {
    let wid = parseInt(id);
    if (wid > MAX_WEAPON_ID) {
        MAX_WEAPON_ID = wid;
    }
}

const TAG = "【buzz_weapon】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.levelup = levelup;
exports.buySkin = buySkin;
exports.equip = equip;

exports.upstar = upstar;
exports.vote = vote;
exports.querySkinVote = querySkinVote;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * yDONE: 125-皮肤投票
 * 皮肤投票.
 */
function vote(req, dataObj, cb) {
    const FUNC = TAG + "vote() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "weapon_skin_vote");

    _vote(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'vote'], "buzz_weapon.vote", cb);
    }
}

/**
 * yDONE: 125-皮肤投票
 * 皮肤投票查询.
 */
function querySkinVote(req, dataObj, cb) {
    const FUNC = TAG + "querySkinVote() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "query_skin_vote");

    _querySkinVote(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_weapon.querySkinVote", cb);
    }
}

/**
 * yDONE: 97-皮肤升星
 * 皮肤升星.
 */
function upstar(req, dataObj, cb) {
    const FUNC = TAG + "upstar() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "weapon_skin_upstar");

    _upstar(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'weapon'], "buzz_weapon.upstar", cb);
    }
}

/**
 * 武器升级
 */
function levelup(req, dataObj, cb) {
    const FUNC = TAG + "levelup() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "weapon_up");

    _levelup(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_weapon", cb);
    }
}

/**
 * 武器皮肤购买
 */
function buySkin(req, dataObj, cb) {
    const FUNC = TAG + "buySkin() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "weapon_buy_skin");

    _buySkin(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_weapon", cb);
    }
}

/**
 * 武器皮肤装备
 */
function equip(req, dataObj, cb) {
    const FUNC = TAG + "equip() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "weapon_equip");

    _equip(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_weapon", cb);
    }
}

//==============================================================================
// private
//==============================================================================

/**
 * yDONE: 125-皮肤投票
 * 皮肤投票.
 */
function _vote(req, dataObj, cb) {
    const FUNC = TAG + "_vote() --- ";
    const EFUNC = "<<<ERROR>>>" + TAG + "_vote() --- ";

    let uid = dataObj.uid;
    let token = dataObj.token;
    let clientVote = dataObj.vote;//玩家投票的皮肤id: [2,3]

    DaoCommon.checkAccount(mysqlPool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        let weapon_skin = account.weapon_skin;
        logger.info(FUNC + 'weapon_skin:', weapon_skin);
        let serverOwn = weapon_skin.own || [];
        let serverVote = weapon_skin.vote || [];
        async.waterfall(
            [
                function step1(cb) {
                    clientVote = filterNotOwn(serverOwn, clientVote);
                    let delta = getDiff(serverVote, clientVote);
                    logger.info(FUNC + 'delta:', delta);
                    cb(null, delta);
                }
                , function step2(delta, cb) {
                let data = [];
                for (let i = 0; i < delta.incr.length; i++) {
                    data.push(['hincrby', redisKesy.WEAPON_VOTE, delta.incr[i], 1]);
                }
                for (let i = 0; i < delta.decr.length; i++) {
                    data.push(['hincrby', redisKesy.WEAPON_VOTE, delta.decr[i], -1]);
                }
                // 有投票动作的玩家需要记录uid到对应武器的集合中
                for (let i = 0; i < serverOwn.length; i++) {
                    data.push(['sadd', redisKesy.SKIN_VOTE_UID + ':' + serverOwn[i], uid]);
                }
                data.push(['sadd', redisKesy.SKIN_VOTE_UID, uid]);
                RedisUtil.multi(data, function (err, res) {
                    cb(null, res);
                })
            }
                , function step3(result, cb) {
                weapon_skin.vote = clientVote;
                account.weapon_skin = weapon_skin;
                account.commit();
                cb(null, 'next');
            }
                , function step4(result, cb) {
                getNewVoteResult(cb);
            }
            ]
            , function (err, result) {
                cb(err, result);
            }
        );
    }
}

/**
 * 过滤不拥有的皮肤.
 */
function filterNotOwn(serverOwn, clientVoteOri) {
    const FUNC = TAG + "filterNotOwn() --- ";
    let clientVote = [];
    for (let i = 0; i < clientVoteOri.length; i++) {
        let voteSkin = parseInt(clientVoteOri[i]);
        if (ArrayUtil.contain(serverOwn, voteSkin)) {
            clientVote.push(voteSkin);
        }
        else {
            logger.error(FUNC + '玩家并不拥有皮肤:', voteSkin);
            logger.error(FUNC + '玩家拥有的皮肤:', serverOwn);
        }
    }
    return clientVote;
}

/**
 * 获取差量(incr为新增, decr为减少)
 */
function getDiff(serverVote, clientVote) {
    const FUNC = TAG + "getDiff() --- ";
    // 投票增量计算
    let incr = [];
    let decr = [];
    for (let i = 0; i < clientVote.length; i++) {
        if (!ArrayUtil.contain(serverVote, clientVote[i])) {
            incr.push(clientVote[i]);
        }
    }
    for (let i = 0; i < serverVote.length; i++) {
        if (!ArrayUtil.contain(clientVote, serverVote[i])) {
            decr.push(serverVote[i]);
        }
    }
    logger.info(FUNC + '新增支持的武器:', incr);
    logger.info(FUNC + '放弃支持的武器:', decr);
    return {incr: incr, decr: decr};
}

/**
 * 获取新的投票结果.
 */
function getNewVoteResult(cb) {
    const FUNC = TAG + "getNewVoteResult() --- ";
    async.waterfall(
        [
            function step1(cb) {
                let data = [];
                for (let i = MIN_WEAPON_ID; i <= MAX_WEAPON_ID; i++) {
                    data.push(['scard', redisKesy.SKIN_VOTE_UID + ':' + i]);
                }
                RedisUtil.multi(data, function (err, res) {
                    let count_list = {};
                    for (let i = 0; i < res.length; i++) {
                        count_list[i + MIN_WEAPON_ID] = res[i];
                    }
                    logger.info('count_list:', count_list);
                    cb(null, count_list);
                });
            }
            , function step2(count_list, cb) {
            let ret = [];
            RedisUtil.repeatHscan(redisKesy.WEAPON_VOTE, 0, 100,
                function op(res, nextCursor) {
                    let voteList = res[1];
                    for (let i = 0; i < voteList.length; i += 2) {
                        let weaponId = voteList[i];
                        logger.info(FUNC + 'weapon id:', voteList[i]);
                        logger.info(FUNC + 'vote count:', voteList[i + 1]);
                        if (count_list[weaponId] > 0) {
                            let count = count_list[weaponId];
                            ret.push({
                                weapon: voteList[i],
                                vote: voteList[i + 1] / count,
                            });
                        }
                    }
                    nextCursor();
                },
                function next() {
                    cb(null, ret);
                }
            );
        }
        ]
        , function (err, result) {
            cb(err, result);
        }
    );
}

/**
 * yDONE: 125-皮肤投票
 * 皮肤投票查询.
 */
function _querySkinVote(req, dataObj, cb) {
    const FUNC = TAG + "_querySkinVote() --- ";
    const EFUNC = "<<<ERROR>>>" + TAG + "_upstar() --- ";

    let uid = dataObj.uid;
    let token = dataObj.token;

    DaoCommon.checkAccount(mysqlPool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        logger.info(FUNC + "进入排行榜查询逻辑");
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        getNewVoteResult(cb);
    }
}

/**
 * yDONE: 97-皮肤升星
 * 皮肤升星.
 */
function _upstar(req, dataObj, cb) {
    const FUNC = TAG + "_upstar() --- ";
    const EFUNC = "<<<ERROR>>>" + TAG + "_upstar() --- ";

    let uid = dataObj.uid;
    let token = dataObj.token;
    let weapon = dataObj.weapon;//需要升星的皮肤id

    DaoCommon.checkAccount(mysqlPool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        let weaponSkin = account.weapon_skin;
        let pack = account.package;
        let goldOwn = account.gold;

        let weaponStar = weaponSkin.star || (weaponSkin.star = {});
        let targetWeaponStar = weaponStar[weapon] || 0;
        let nextWeaponStar = targetWeaponStar + 1;

        let starInfo = getInfoFromWeaponStar(weapon, nextWeaponStar);
        let goldNeed = starInfo.cost;//需要金币
        let item = starInfo.item;
        let itemId = item[0];
        let itemNeed = item[1];
        let itemType = BuzzUtil.getItemTypeById(itemId);

        let itemOwn = pack[itemType][itemId];

        if (goldOwn < goldNeed) {
            logger.info(FUNC + '玩家金币不足');
            logger.info(FUNC + 'goldOwn:', goldOwn);
            logger.info(FUNC + 'goldNeed:', goldNeed);
            cb(ERROR_OBJ.GOLD_NOT_ENOUGH);
            return;
        }

        if (itemOwn < itemNeed) {
            logger.info(FUNC + '玩家碎片不足');
            logger.info(FUNC + 'itemOwn:', itemOwn);
            logger.info(FUNC + 'itemNeed:', itemNeed);
            cb(ERROR_OBJ.CHIP_NOT_ENOUGH);
            return;
        }

        account.gold = -goldNeed;

        pack[itemType][itemId] -= itemNeed;
        account.package = pack;

        weaponStar[weapon] = nextWeaponStar;
        weaponSkin.star = weaponStar;
        account.weapon_skin = weaponSkin;

        CacheAccount.resetCharmPoint(account, function () {
            let ret = {};
            ret.change = {
                gold: account.gold,
                package: account.package,
                // weapon_skin: account.weapon_skin,
                charm_point: account.charm_point,
                charm_rank: account.charm_rank,
            };
            ret.star = {};
            ret.star[weapon] = nextWeaponStar;
            cb && cb(null, ret);
        });
    }

    function getInfoFromWeaponStar(weapon, star) {
        for (let i = 0; i < newweapon_star_cfg.length; i++) {
            let starInfo = newweapon_star_cfg[i];
            if (starInfo.id == weapon && starInfo.star == star) {
                return starInfo;
            }
        }
    }
}

/**
 * 武器升级
 */
function _levelup(req, dataObj, cb) {
    const FUNC = TAG + "_levelup() --- ";
    const EFUNC = "<<<ERROR>>>" + TAG + "_levelup() --- ";
    let uid = dataObj.uid;
    let token = dataObj.token;
    let use_stone = dataObj.use_stone;
    let pool = req.pool;
    let chs = null;

    let need_stone = 0;
    if (typeof(use_stone) == "undefined") {
        use_stone = false;
    }

    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        let weapon_level = account.weapon;
        let weapon_info = BuzzUtil.getWeaponUpgradeByLevel(weapon_level);
        if (!_checkLevelup1()) return;
        let weapon_level_next = weapon_info.weaponlevel;
        let weapon_unlock_cost = weapon_info.unlock_cost;
        let weapon_unlock_material = weapon_info.unlock_material;
        logger.info(FUNC + "weapon_level_next:", weapon_level_next);
        logger.info(FUNC + "weapon_unlock_cost:", weapon_unlock_cost);
        logger.info(FUNC + "weapon_unlock_material:", weapon_unlock_material);
        if (!_checkLevelup2()) return;

        // logger.info(FUNC + "-----------------pearl old:", account.pearl);
        CacheAccount.setPearl(account, account.pearl - weapon_unlock_cost);
        let change = {pearl: account.pearl};
        // logger.info(FUNC + "-----------------change:", change);
        if (0 == weapon_unlock_material.length) {
            didWeaponLevelUp();
            _handleReturn(change, cb);
        }
        else {
            // logger.info(FUNC + "======change:\n", change);
            // 消耗材料
            let item_list_cost = BuzzUtil.getItemList(weapon_unlock_material);
            logger.info(FUNC + "1.item_list_cost:", item_list_cost);
            // 改变武器等级
            // TODO: 锻造可能会失败, 失败
            let unlock_rate = weapon_info.unlock_rate;
            if (use_stone) {
                need_stone = Math.round((1 - unlock_rate) * 100);
                logger.info(FUNC + "need_stone:", need_stone);
                if (!_checkLevelup3()) return;
                if (need_stone > 0)
                    item_list_cost.push({
                        item_id: 'i500',
                        item_num: need_stone,
                    });
                didWeaponLevelUp();
            }
            else {
                // unlock_rate = 0.9, 则random<=0.9可锻造成功
                if (unlock_rate >= RandomUtil.random()) {
                    didWeaponLevelUp();
                }
            }
            logger.info(FUNC + "2.item_list_cost:", item_list_cost);
            BuzzUtil.removeFromPack(req, account, item_list_cost, function (cost_info) {
                let change_m = BuzzUtil.getChange(account, cost_info);
                change = {pearl: account.pearl};
                let change = ObjUtil.merge(change, change_m);
                _handleReturn(change, cb);
            })
        }

        function _handleReturn(change, cb) {
            let ret = {
                change: change,
                weapon_level: weapon_level_next,
                is_success: weapon_level != account.weapon,
            };

            CacheAccount.setWeapon(account, weapon_level, function (chs) {
                if (chs && chs.length == 2) {
                    let charmPoint = chs[0];
                    let charmRank = chs[1];
                    charmPoint >= 0 && (ret.change.charm_point = charmPoint);
                    charmRank >= 0 && (ret.change.charm_rank = charmRank);
                }
                cb && cb(null, ret);
            });
        }

        // 校验方法1
        function _checkLevelup1() {
            if (null == weapon_info) {
                logger.error(FUNC + "查询的武器升级信息为空");
                cb(ERROR_OBJ.WEAPON_INFO_NULL);
                return false;
            }

            return true;
        }

        function _checkLevelup2() {
            if (weapon_unlock_cost > account.pearl) {

                logger.error(FUNC + "玩家解锁武器需要的钻石不足");
                logger.error(FUNC + "武器等级:", weapon_level_next);
                logger.error(FUNC + "需要钻石:", weapon_unlock_cost);
                logger.error(FUNC + "玩家钻石:", account.pearl);

                cb(ERROR_OBJ.WEAPON_UNLOCK_DIAMOND_NOT_ENOUGH);
                return false;
            }

            if (!isWeaponLevelupMaterialEnough(account, weapon_unlock_material)) {

                logger.error(FUNC + "玩家解锁武器需要的材料不足");
                logger.error(FUNC + "武器等级:", weapon_level_next);
                logger.error(FUNC + "需要材料:", weapon_unlock_material);

                cb(ERROR_OBJ.WEAPON_UNLOCK_MATERIAL_NOT_ENOUGH);
                return false;
            }

            return true;
        }

        function _checkLevelup3() {
            if (typeof(account.package['9']) == "undefined") {
                account.package['9'] = {};
            }
            if (typeof(account.package['9']['i500']) == "undefined") {
                account.package['9']['i500'] = 0;
            }
            let own_stone = account.package['9']['i500'];
            logger.error(FUNC + "玩家陨石精华:", own_stone);
            if (need_stone > own_stone) {

                logger.error(FUNC + "玩家需要的陨石精华不足");
                logger.error(FUNC + "武器等级:", weapon_level_next);
                logger.error(FUNC + "需要陨石精华:", need_stone);
                logger.error(FUNC + "玩家陨石精华:", own_stone);

                cb(ERROR_OBJ.WEAPON_LEVELUP_YUNSHI_NOT_ENOUGH);
                return false;
            }

            return true;
        }

        /**
         * 确定武器升级.
         */
        function didWeaponLevelUp() {
            let old_level = account.weapon;
            account.weapon = weapon_level_next;
            let accountWeaponEnergy = account.weapon_energy;
            let needpower = 3000;
            if (newweapon_upgrade_cfg[weapon_level_next]
                && newweapon_upgrade_cfg[weapon_level_next].needpower) {
                needpower = newweapon_upgrade_cfg[weapon_level_next].needpower;
            }
            accountWeaponEnergy[account.weapon] = needpower;
            // 隐患，实际weapon_energy会通过客户端进行更新
            account.weapon_energy = accountWeaponEnergy;
            stepMissionWeaponLevel();
            addWeaponLog(account.weapon, old_level);
        }

        /**
         * 玩家升级武器(锻造)所需要的材料是否足够.
         * @param account 玩家数据.
         * @param weapon_unlock_material 锻造需要的材料列表.
         */
        function isWeaponLevelupMaterialEnough(account, weapon_unlock_material) {
            for (let i = 0; i < weapon_unlock_material.length; i++) {
                let material = weapon_unlock_material[i];
                let material_id = material[0];
                let material_num = material[1];

                let material_type = BuzzUtil.getItemTypeById(material_id);
                logger.info(FUNC + "material_type:", material_type);

                let material_own = BuzzUtil.getItemNum(account, material_type, material_id);
                logger.info(FUNC + "材料ID:", material_id);
                logger.info(FUNC + "需要材料:", material_num);
                logger.info(FUNC + "拥有材料:", material_own);
                if (material_num > material_own) {
                    return false;
                }
            }
            return true;
        }

        /**
         * 更新成就任务中的武器倍率进度.
         * 武器成就任务的id模式(2040**).
         */
        function stepMissionWeaponLevel() {
            let mission = account.mission_only_once;
            let mission_weapon_id = BuzzUtil.getWeaponLevelQuestIdByMission(mission);
            mission[mission_weapon_id] = account.weapon;
            account.mission_only_once = mission;
            account.commit();

        }

        /**
         * 向缓存CacheWeapon中增加一条武器升级的日志
         */
        function addWeaponLog(level, old_level) {
            const FUNC = TAG + "addWeaponLog() --- ";
            let weaponLog = {
                account_id: uid,
                log_at: DateUtil.getTime(),
                level: level,
                type: 0,
                level_up: level - old_level,
                nickname: 0,
            };
            logger.info(FUNC + '插入武器升级日志');
            CacheWeapon.push(weaponLog);
        }
    }
}

/**
 * 武器皮肤购买
 */
function _buySkin(req, dataObj, cb) {
    const FUNC = TAG + "_buySkin() --- ";
    let uid = dataObj.uid;
    let token = dataObj.token;
    let pool = req.pool;

    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        if (!_checkBuySkin1()) return;

        // 逻辑
        // 武器皮肤购买需要记录2069**对应的任务进度
        // BuzzUtil.getWeaponSkinQuestIdByMission()

        // 校验方法1
        function _checkBuySkin1() {
            // if (null == vitality) {
            //     cb(ERROR_OBJ.MISSION_WRONG_ACTIVE_IDX);
            //     return false;
            // }

            return true;
        }
    }
}

/**
 * 武器皮肤装备
 */
function _equip(req, dataObj, cb) {
    const FUNC = TAG + "_equip() --- ";
    let uid = dataObj.uid;
    let token = dataObj.token;
    let pool = req.pool;

    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        if (!_checkEquip1()) return;

        // 校验方法1
        function _checkEquip1() {
            // if (null == vitality) {
            //     cb(ERROR_OBJ.MISSION_WRONG_ACTIVE_IDX);
            //     return false;
            // }

            return true;
        }
    }
}


