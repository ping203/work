// //--[[
// description: 大陆版player
// author: linyang
// date: 20171129
// ATTENTION：
// //--]]

const Player = require('../../../base/player');
const fishCmd = require('../../../../cmd/fishCmd');
const rankMatchCmd = require('../../../../cmd/rankMatchCmd');
const FishCode = require('../fishCode');
const logBuilder = require('../../../../utils/logSync').logBuilder;
const consts = require('../consts');
const GAMECFG = require('../../../../utils/imports').GAME_CFGS;
const configReader = require('../configReader');
const redisAccountSync = require('../../../../utils/redisAccountSync');
const import_def = require('../../../../database/consts');
const ACCOUNTKEY = import_def.ACCOUNTKEY;
const REDISKEY = import_def.REDISKEY;
const playerChangeEvent = require('../../../../cache/playerChangeEvent');
const gamePlay = require('../gamePlay/gamePlay');
const Pirate = require('./pirate');
const RmatchHelper = require('./rmatchHelper');
const RewardModel = require('../../../../utils/account/RewardModel');
const FishingLog = require('./fishingLog');
const rpc = require('../../../net/rpc');
const FIRE_DELAY = 50; //开炮事件服务端与客户端的延时,单位毫秒
const LOG_DT = 30000; //金币钻石日志写入周期，即每隔指定时间插入一条
const REDIS_DT = 1000; //redis及时存入周期
const CHEAT_MAX = 3; 

const DEBUG = 0;
let log = null;
if (DEBUG === 1) {
    log = logger.error;
} else if (DEBUG === 2) {
    log = logger.info;
}

class FishPlayer extends Player {
    constructor(opts) {
        super(opts);
        this.cost = gamePlay.cost;
        this._account = opts.account || {};
        this._roomId = null;
        this._connectState = CONSTS.constDef.PALYER_STATE.ONLINE;
        this._resetDIY();
        this._sword = 0; //玩家战力（）
        this._skState = {}; //0准备 1进行中 2结束
        this._sceneCfg = null;
        this._fishModel = null;
        this._seatId = -1; //座位号，从0开始
        this._gameInfo = {
            gameMode: null,
            sceneId: null
        };

        this._lastFireFish = null;
        this._bkCost = {};
        this._fireTimestamp = 0;
        this._lastFireIdx = 0;
        this._pirate = null;
        this._pirateTimestamp = null;
        this._log = new FishingLog(this.account);
        this._log.setCheatProc(function (msg, cheatCode) {
            this._cheatOnce(msg, cheatCode);
        }.bind(this));

        this._writeRedisTimestamp = new Date().getTime();
        this._wait2WriteRedis = false;
        this._cheat = {
            count: 0,
            msg: ''
        };
        this._skinDt = 200;
        this._rmHelper = null;
        this._isForbided = this.account.test < 0;
        this._mission = new RewardModel();
        this._mission.resetLoginData(this.account.mission_only_once, this.account.mission_daily_reset);

        playerChangeEvent.on(this.uid, this._playerChangeEvt.bind(this));
    }

    _playerChangeEvt(key, value) {
        this.account[key] = value;
    }

    set roomId(value) {
        this._roomId = value;
    }

    get roomId() {
        return this._roomId;
    }

    set connectState(value) {
        this._connectState = value;
    }

    get connectState() {
        return this._connectState;
    }

    /**
     * 获取玩家战力
     * weapon
     * @returns {number}
     */
    get sword() {
        return this._sword;
    }

    /**
     * 设置场景配置
     * @param value
     */
    set sceneCfg(value) {
        this._sceneCfg = value;
    }

    set fishModel(value) {
        this._fishModel = value;
    }

    get fishModel() {
        return this._fishModel;
    }

    setDIY(key, value) {
        if (this._DIY[key]) {
            this._DIY[key] = value;
        }
    }

    get DIY() {
        return this._DIY;
    }

    get seatId() {
        return this._seatId;
    }

    set seatId(id) {
        this._seatId = id;
        logger.info('seatId changed = ', id);
    }

    set gameInfo(info) {
        this._gameInfo = info;
    }

    get gameInfo() {
        return this._gameInfo;
    }

    set account(value) {
        this._account = value;
    }

    get account() {
        return this._account;
    }

    save() {
        this.account.commit();
    }

    c_query_fishes(data, cb) {
        let fm = this.fishModel;
        let fishes = fm.getLiveFish();
        utils.invokeCallback(cb, null, {
            fishes: fishes,
        });
        logger.debug('--c_query_fishes--done');
    }

    static sBaseField() {
        const baseField = [
            ACCOUNTKEY.NICKNAME,
            ACCOUNTKEY.SEX,
            ACCOUNTKEY.LEVEL,
            ACCOUNTKEY.WEAPON,
            ACCOUNTKEY.WEAPON_SKIN,
            ACCOUNTKEY.GOLD,
            ACCOUNTKEY.PEARL,
            ACCOUNTKEY.VIP,
            ACCOUNTKEY.COMEBACK,
            ACCOUNTKEY.WEAPON_ENERGY,
            ACCOUNTKEY.HEARTBEAT,
            ACCOUNTKEY.ROIPCT_TIME,
            ACCOUNTKEY.SKILL,
            ACCOUNTKEY.EXP,
            ACCOUNTKEY.FIGURE_URL,
            ACCOUNTKEY.BONUS,
            ACCOUNTKEY.PIRATE,
            ACCOUNTKEY.BP,
            ACCOUNTKEY.PLATFORM,
            ACCOUNTKEY.TOKEN,
            ACCOUNTKEY.TEST,
            ACCOUNTKEY.MISSION_DAILY_RESET,
            ACCOUNTKEY.MISSION_ONLY_ONCE,
        ];
        return baseField;
    }

    getBaseField() {
        return FishPlayer.sBaseField();
    }


    syncData () {
        logger.error('收到来自数据服的同步通知 ');
        this.account.commit(function () {
            this._regetField();
        }.bind(this));
    }

    _regetField() {
        let tfs = this.getBaseField();
        redisAccountSync.getAccount(this.uid, tfs, function (err, account) {
            if (!!err) {
                logger.error('err = ', err, ' code = ', CONSTS.SYS_CODE.DB_ERROR.code);
                return;
            }
            if (!account) {
                logger.error('err = ', err, ' code = ', CONSTS.SYS_CODE.PLAYER_NOT_EXIST.code);
                return;
            }

            this.account = account;
            if (this._log) {
                this._log.logAll(this.account);
            }

            this._mission && this._mission.resetLoginData(this.account.mission_only_once, this.account.mission_daily_reset);
            this._resetDIY();

            this.emit(fishCmd.push.player_notify.route, {
                player: this,
                data: {
                    seatId: this.seatId,
                    gold: this.account.gold,
                    pearl: this.account.pearl,
                    wp_level: this.DIY.weapon,
                    wp_skin: this.DIY.weapon_skin,
                }
            });
        }.bind(this));
    }

    /**
     * 检查武器皮肤
     */
    _checkBulletSkin (skin) {
        let mySKins = this.account.weapon_skin;
        if (!mySKins || !mySKins.own || mySKins.own.indexOf(parseInt(skin)) === -1) {
            this._cheatOnce('没有这个皮肤 skin = ' + skin);
            mySKins && mySKins.own && logger.error('skin = ', skin, mySKins.own);
            return false;
        }
        return true;
    }

    /**
     * 检查武器等级
     * 是否已升级该等级、当前场景是否允许该等级
     */
    _checkBulletLevel (wpLv) {
        let wpEng = this.DIY.weapon_energy;
        if (wpEng && (wpEng[wpLv] >= 0 || wpLv === 1) && wpLv >= this._sceneCfg.min_level && wpLv <= this._sceneCfg.max_level) {
            return true;
        }
        this._cheatOnce('当前场景没有这个等级 wpLv = ' + wpLv);
        logger.error('wpLv = ', wpLv, wpEng);
        return false;
    }

    /**
     * 封号
     */
    forbidAccount (cheatCode) {
        cheatCode = cheatCode || -1;
        this.account.test = cheatCode;
        this.account.token = 1;
        this.save();

        let timeNow = new Date().getTime();
        redisConnector.cmd.hset(REDISKEY.CHEAT_FORBID_TIME, this.account.id, timeNow);
        this._isForbided = true;
        logger.error('作弊封号，终止操作：', this.account.id);
    }

    /**
     * 作弊标记
     * @param {*作弊信息} msg 
     * @param {*立即剔除玩家标记} cheatCode 
     */
    _cheatOnce (msg, cheatCode) {
        if (msg) {
            msg += ' uid = ' + this.uid;
        }
        this._cheat.msg = msg;
        this._cheat.count ++;
        if (cheatCode && cheatCode < 0) {
            this._cheat.count = CHEAT_MAX;
            this.forbidAccount(cheatCode);
        }
        msg && logger.error(msg, ' cheatC = ', this._cheat.count);
    }

    getCheatingData () {
        return this._isForbided || (this._cheat.count >= CHEAT_MAX ? this._cheat : 0);
    }

    /**
     * 检查子弹的合法性
     */
    _checkBullet (bullet, isFireChecking) {
        this._cheat.count = this._cheat.count || 0;
        if (!bullet) {
            this._cheatOnce('子弹数据有误');
            return -1;
        }
        let bSkin = bullet.skin;
        if (!this._checkBulletSkin(bSkin)) {
            return -2;
        }
        let bLv = bullet.wpLv;
        if (!this._checkBulletLevel(bLv)) {
            return -3;
        }
        if (isFireChecking) {
            let curSkin = this.DIY.weapon_skin;
            if (curSkin != bSkin) {
                this._cheatOnce('武器皮肤不匹配curSkin = ' + curSkin + ' bSkin = ' + bSkin);
                return -4;
            }
            let curWpLv = this.DIY.weapon;
            if (curWpLv != bLv) {
                this._cheatOnce('武器等级不匹配curWpLv = ' + curWpLv + ' bLv = ' + bLv);
                return -5;
            }
        }
        this._cheat.count = 0;
        this._cheat.msg = '';
        return 1;
    }

    /**
     * 定时轮序逻辑
     * @param {*轮询时间差，单位秒} dt 
     */
    update (dt) {
        this._checkBkCostTimeout(dt);
        this._log.checkWriteNow(dt);
    }

    /**
     * 检查bkcost过期
     * @param {*} dt 
     */
    _checkBkCostTimeout (dt) {
        let bks = [];
        for (let k in this._bkCost) {
            this._bkCost[k].dt -= dt;
            if (this._bkCost[k].dt <= 0) {
                bks.push(k);
            }
        }
        let length = bks.length;
        for (let i = 0; i < length; i ++) {
            this._delBkCost(bks[i]);
        }
    }

    _delBkCost (bk) {
        if (!this._bkCost[bk]) return;
        delete this._bkCost[bk];
    }
    /**
     * 增加bk记录
     * @param {*} bk 
     * @param {*} value 
     */
    _addBkCost (bk, value, isSpecial, nextFireBCC) {
        this._bkCost[bk] = this._bkCost[bk] || {};
        this._bkCost[bk].cost = value;
        this._bkCost[bk].dt = 2 + Math.floor(Math.random()*4);
        if (isSpecial) {
            this._bkCost[bk].dt *= 5;
        }
        nextFireBCC > 0 && (this._bkCost[bk].clone = nextFireBCC);
        return true;
    }

    /**
     * 开炮
     */
    c_fire(data, cb) {
        if (this._isForbided) {
            return utils.invokeCallback(cb, null);
        }
        if (!data) {
            utils.invokeCallback(cb, null);
        }
        let wpBk = data.wp_bk;
        let bullet = this.cost.parseBulletKey(wpBk);
        if (this._checkBullet(bullet, true) <= 0) {
            this._delBkCost(wpBk);
            utils.invokeCallback(cb, null, {
                resetWp: {
                    wp_level: this.DIY.weapon,
                    wp_skin: this.DIY.weapon_skin,
                }
            });
            return;
        }
        let curSkin = bullet.skin;
        let curWpLv = bullet.wpLv;
        let now = new Date().getTime();
        if (this._fireTimestamp > 0) {
            let passed = now - this._fireTimestamp;
            //压力测试可关闭开炮频率校验
            //logger.error('passed = ', passed, this._skinDt);
            if (passed < this._skinDt) {
                utils.invokeCallback(cb, FishCode.INVALID_WP_FIRE);
                return;
            }
        }
        this._fireTimestamp = now;

        if (this._bkCost[wpBk]) {
            this._delBkCost(wpBk);
            utils.invokeCallback(cb, FishCode.INVALID_WP_BK);
            return;
        }

        let energy = this.DIY.weapon_energy[curWpLv] || 0;
        let gainLaser = energy;
        let newComebackHitrate = this.account.comeback && this.account.comeback.hitrate || 1;
	    let nextFireBCC = 0; //下一炮子弹可能分裂出的子弹数
        if (this.account.gold > 0) {
            let costGold = this.cost.fire_gold_cost({
                weapon_skin: curSkin,
                weapon: curWpLv
            });
            if (costGold > this.account.gold) {
                costGold = this.account.gold; //最后一炮不足以开炮时，则默认剩余全部用完可开一次，下一次开炮则破产
            }
            nextFireBCC = this.cost.calBulletClonedCount(curSkin);

	        this._addBkCost(wpBk, costGold, curSkin == consts.WP_SKIN_ID.PAOPAOTANG, nextFireBCC);

            let saveData = {
                level: this.account.level,
                exp: this.account.exp,
            };
            let star = this.getSkinStar(curSkin);
            let wpStarCfg = null;
            star && (wpStarCfg = configReader.getWeaponStarData(curSkin, star));

            let gainExp = this.cost.fire_gain_exp({
                gold: costGold,
                godId: -1, //todo
                godLevel: -1, //todo
                starExp: wpStarCfg && wpStarCfg.exp || 0, //星级加成经验
            });

            if (gainExp > 0) {
                let oldLv = saveData.level;
                let result = this.cost.reset_exp_level(oldLv, saveData.exp, gainExp);
                if (!result.full) {
                    if (result.level > oldLv) {
                        saveData.level = result.level; //升级了，数据服负责发放升级奖励
                        this._mission.addProcess(RewardModel.TaskType.UPDATE_USER_LV, saveData.level);////角色等级x级
                    }
                    saveData.exp = result.exp; //注意经验是增量
                }
            }
            newComebackHitrate = this.cost.subComebackHitRate(curWpLv, this.account.comeback);
            if (newComebackHitrate > 0) {
                saveData.comeback_hitrate = newComebackHitrate;
            }
            let heart = this.cost.newHeartBeat(costGold, this._sceneCfg.max_level, this.account.heartbeat_min_cost, this.account.heartbeat, this._maxWpLv);
            gainLaser = this.cost.fire_gain_laser({
                weapon_skin: curSkin,
                weapon: curWpLv,
                energy: energy,
                godId: -1, //todo 
                godLevel: -1, //todo
                starLaser: wpStarCfg && wpStarCfg.powerspeed || 0, //星级加成激光累计速度
            });
            this.DIY.weapon_energy[curWpLv] = gainLaser;
            saveData.weapon_energy = this.DIY.weapon_energy;
            saveData.gold = -costGold;
            saveData.heartbeat = heart[0];
            saveData.heartbeat_min_cost = heart[1];
            this._save(saveData);
            this._log.addGoldLog(GAMECFG.common_log_const_cfg.GAME_FIGHTING, saveData.gold, this.account.level, true);
            this.checkPersonalGpctOut();
        }

        utils.invokeCallback(cb, null, {
            wp_laser: {
                wp_level: curWpLv,
                laser: gainLaser
            },
            exp: this.account.exp,
            level: this.account.level,
            gold: this.account.gold,
            comeback_hitrate: newComebackHitrate,
            nextFireBCC: nextFireBCC,
        });

        if (this.account.gold > 0) {
            let sd = {
                seatId: this.seatId,
                fire_point: data.fire_point,
                gold: this.account.gold,
                wp_bk: wpBk,
            };
            data.fire_fish && (sd.fire_fish = data.fire_fish);
            data.clone && (sd.clone = data.clone);
            this.emit(fishCmd.push.fire.route, {
                player: this,
                data: sd
            });
        }
    }

    /**
     * 子弹克隆：反弹或分裂
     */
    c_fire_clone (data, cb) {
        if (!data) {
            return utils.invokeCallback(cb, null);
        }
        let srcWbk = data.src;
        let clones = data.clones;
        if (!srcWbk) {
            return utils.invokeCallback(cb, null);
        }
        let bkData = this._bkCost[srcWbk];
        let srcBullet = this.cost.parseBulletKey(srcWbk);
        if (this._checkBullet(srcBullet) <= 0) {
            return utils.invokeCallback(cb, null);
        }
        let srcSkin = srcBullet.skin;
        if (srcSkin == consts.WP_SKIN_ID.LIMING) {
            //星舰黎明反弹处理：反弹子弹标识与原始子弹相同
            if (clones) {
                return utils.invokeCallback(cb, null); 
            }
            let costValue = -1;
            let cloneC = 0;
            if (bkData) {
                costValue = bkData.cost;
                if (bkData.clone > 0) {
                    bkData.clone --;
                }else {
                    this._delBkCost(srcWbk);
                    return utils.invokeCallback(cb, null);
                }
                cloneC = bkData.clone;
            }
            this._addBkCost(srcWbk, costValue, cloneC);
        }else if (srcSkin == consts.WP_SKIN_ID.PAOPAOTANG || srcSkin == consts.WP_SKIN_ID.JIAN20 || srcSkin == consts.WP_SKIN_ID.YUELIANGTU) {
            //泡泡膛、歼20、月亮兔 克隆个数检查
            let onceMax = 8;
            if (srcSkin == consts.WP_SKIN_ID.YUELIANGTU) {
                onceMax = 1;
            }else{
                if (!bkData) {
                    this._cheatOnce('无原始子弹，疑似作弊=' + srcWbk);
                    return utils.invokeCallback(cb, null);
                }
                onceMax = bkData.clone || 8;
            }
            if (!clones || clones.length > onceMax) {
                this._delBkCost(srcWbk);
                return utils.invokeCallback(cb, null); 
            }
            for (let i = 0; i < clones.length; i ++) {
                let wbk = clones[i];
                let bullet = this.cost.parseBulletKey(wbk);
                if (this._checkBullet(bullet) <= 0 || bullet.skin != srcSkin || bullet.wpLv != srcBullet.wpLv) {
                    this._delBkCost(srcWbk);
                    return utils.invokeCallback(cb, null);
                }
                this._addBkCost(wbk, -1, srcSkin == consts.WP_SKIN_ID.PAOPAOTANG);//克隆子弹特殊标记
            }
        }else if (clones.length === 1 && clones[0] == srcWbk) {
            this._addBkCost(clones[0], -1, false);
        }else {
            this._cheatOnce('非克隆子弹发克隆消息，疑似作弊');
        }
        utils.invokeCallback(cb, null);
    }

    /**
     * 碰撞鱼捕获率判定
     */
    c_catch_fish(data, cb) {
        if (this._isForbided) {
            return utils.invokeCallback(cb, null);
        }

        let isReal = this.isRealPlayer();
        //校验子弹是否真的存在过 //子弹不存在，则无消耗，不能碰撞
        let bFishes = data.b_fishes;
        if (!bFishes || !bFishes.length) {
            return utils.invokeCallback(cb, null, {});
        }
        let cFishes = {};
        let bks = [];
        let costTotal = 0;
        let fireTotal = 0;
        let minWplv = Math.min(this._maxWpLv, this._sceneCfg.max_level);

        for (let i = 0; i < bFishes.length; ++i) {
            let bdata = bFishes[i];
            let bk = bdata.wp_bk; 
            let bullet = this.cost.parseBulletKey(bk);
            if (this._checkBullet(bullet) <= 0) {
                this._delBkCost(bk);
                continue;
            }
            bks.push(bk);
            if (bk.indexOf('=') > 0) {
                //被鱼技能打死的鱼，不做此校验
                cFishes[bk] = {
                    fishes: bdata.fishes,
                    skill_ing: bdata.skill_ing,
                };
                continue;
            }

            let bkd = this._bkCost[bk];
            if (!bkd) {
                log && log('numberTest--无效碰撞', bk);
                this._delBkCost(bk);//碰撞事件比开火事件先收到，视为无效碰撞，则下一次收到该开火事件时不处理
                delete bFishes[bk];
            } else {
                cFishes[bk] = {
                    fishes: bdata.fishes,
                    skill_ing: bdata.skill_ing,
                };
                let tp = bullet.wpLv / minWplv;
                if (tp >= 0.1) {
                    if (bkd.cost > 0) {
                        costTotal += bkd.cost;
                        fireTotal ++;
                    }
                }
            }
        }

        let tData = this.cost.catchNot(cFishes, this.account, this.fishModel, isReal, this._maxWpLv);
        let ret = tData.ret;
        let gainGold = 0;
        let oldRrewardFishGold = this.account.bonus && this.account.bonus.gold_count || 0;
        let rewardFishNum = 0;
        let pirateData = null;
        let fireFlagGolds = {};
        let gotC = 0;
        for (let fk in ret) {
            let rd = ret[fk];
            let gold = rd.gold;
            if (gold >= 0) {
                let fireFlag = rd.fireFlag;
                fireFlagGolds[fireFlag] = fireFlagGolds[fireFlag] || {
                    count: 0,
                    gold: 0,
                    score: 0,
                };
                let score = this.fishModel.getActorData(fk).goldVal;
                let fg = fireFlagGolds[fireFlag];
                if (fireFlag === consts.FIRE_FLAG.BOMB) {
                    fg.score += score;
                    if (fg.score < 100) {
                        fg.count ++;
                        fg.gold += gold;
                    }else{
                        fg.score = 100;
                    }
                }else{
                    fg.score += score;
                    fg.count ++;
                    fg.gold += gold;
                }
                let temp = this._missionCoutWithFish(fk, gold, rd.skin);
                temp.rewardFishFlag === 1 && (rewardFishNum ++);
                temp.pirateFlag > 0 && this._pirate && (pirateData = this._pirate.getProgress());
                fg.fish_id = temp.fish_id;
                gotC ++;
            }
        }
        for (let fk in fireFlagGolds) {
            gainGold += fireFlagGolds[fk].gold;
        }
        let newRrewardFishGold = this.account.bonus && this.account.bonus.gold_count || 0;
        newRrewardFishGold -= oldRrewardFishGold;
        newRrewardFishGold = Math.max(newRrewardFishGold, 0);
        this._mission.addProcess(RewardModel.TaskType.ONE_GET_GOLD, gainGold);//单次开炮获得金币x
        for (let fk in fireFlagGolds) {       
            let flag = parseInt(fk);
            if (flag === consts.FIRE_FLAG.LIGHTING || flag === consts.FIRE_FLAG.BOMB) {
                let fg = fireFlagGolds[fk];
                this._mission.addProcess(RewardModel.TaskType.USE_FISH_CATCH_FISH, fg.count, fg.fish_id);//利用x鱼炸死y条其他鱼
            }
        }

        //打死已经被捕获的鱼，补偿其开炮金币
        let fireCostBack = tData.costGold;
        if (fireCostBack) {
            for (let bk in fireCostBack) {
                let fc = fireCostBack[bk];
                let bkd = this._bkCost[bk];
                if (bkd) {
                    log && log('fc = ', fc, bk, bkd);
                    if (bkd.cost > 0 && fc) {
                        gainGold += bkd.cost;
                    }
                    this._delBkCost(bk);
                }
            }
        }
        for (let i = 0; i < bks.length; i++) {            
            this._delBkCost(bks[i]);
        }

        //排位赛统计
        isReal && this._rmHelper && this._rmHelper.fireCount(bks, ret, this.fishModel);

        this._save({
            gold: gainGold,
            roipct_time: tData.roipct_time,
            pirateData: pirateData,
        });

        let sceneFlags = {
            '0': GAMECFG.common_log_const_cfg.GAME_FIGHTING, //普通命中
            '1': GAMECFG.common_log_const_cfg.FISH_LIGHTING, //鱼闪电技能命中
            '2': GAMECFG.common_log_const_cfg.FISH_BOMB, //鱼炸弹技能命中
            '3': GAMECFG.common_log_const_cfg.NUCLER_DROP, //被核弹打中
            '4': GAMECFG.common_log_const_cfg.NUCLER_LASER, //被激光打中
        };
        for (let fk in fireFlagGolds) {            
            this._log.addGoldLog(sceneFlags[fk], fireFlagGolds[fk].gold, this.account.level, false, parseInt(fk) > 0);
        }
        costTotal && fireTotal && this._log.addGoldGot(gainGold, costTotal, fireTotal); //有消耗时才统计

        let res = {};
        if (rewardFishNum > 0) {
            res = {
                bonus: this.account.bonus,
                rewardFishGold: newRrewardFishGold,
                rewardFishNum: rewardFishNum,
            };
        }
        pirateData && (res.pirateData = pirateData);
        utils.invokeCallback(cb, null, res);

        //打死鱼才广播
        ret && Object.keys(ret).length > 0 && this.emit(fishCmd.push.catch_fish.route, {
            player: this,
            data: {
                seatId: this.seatId,
                catch_fishes: ret,
                gold: this.account.gold
            }
        });
    }

    /**
     * 技能消耗之后处理
     */
    _afterSkillCost(skillId, ret) {
        let saveData = {};
        let skill = this.account.skill;
        if (skill) {
            skill[skillId] = ret.skillC;
            saveData.skill = skill;
            saveData.skillUsed = {
                id: skillId,
                ct: ret.skillC,
            };
            this._mission.addProcess(RewardModel.TaskType.USE_SKILL, 1, skillId);//使用x技能y次，如果x为0则为任意技能
        }
        let costVal = 0;
        ret.costPearl > 0 && (saveData.pearl = -ret.costPearl, costVal = ret.costPearl);
        ret.costGold > 0 && (saveData.gold = -ret.costGold, costVal = ret.costGold);

        this._save(saveData);

        let common = {
            skill_id: skillId,
            skill_count: ret.skillC,
        };
        ret.pearl >= 0 && (common.pearl = ret.pearl);
        ret.gold >= 0 && (common.gold = ret.gold);
        this._log.addSkillUsingLog(skillId, ret.skillC);
        return common;
    }

    /**
     * 开始使用技能
     */
    c_use_skill(data, cb) {
        if (this._isForbided) {
            return utils.invokeCallback(cb, null);
        }
        let skillId = data.skill;
        if (!this._skState) {
            this._skState = {};
        }
        if (!this._skState[skillId]) {
            this._skState[skillId] = {};
        }
        if (this._skState[skillId].ticker) {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL_ING);
            return;
        }
        if (this._skState[skillId].flag) {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL_STATE);
            return;
        }

	    let curWpLv = this.DIY.weapon;
        if (data.wp_level != curWpLv) {
            return utils.invokeCallback(cb, null);
        }
        let sdata = {
            common: {
                skill_id: skillId,
            },
        };
        if (data.call) {
            let callFish = data.call.fish;
            const cfg = configReader.getValue('skill_skill_cfg', skillId);
            if (!callFish || !cfg || !cfg.summon_type || cfg.summon_type.indexOf(callFish) === -1) {
                return utils.invokeCallback(cb, null);
            }
            sdata.call_ready = data.call;
        }

        //核弹在确认发射时才扣钱
        if (skillId === consts.SKILL_ID.SK_NBOMB0 || skillId === consts.SKILL_ID.SK_NBOMB1 || skillId === consts.SKILL_ID.SK_NBOMB2) {
            let notEnough = this.cost.checkEnough(skillId, data.wp_level, this.account);
            if (notEnough > 0) {
                utils.invokeCallback(cb, FishCode.INVALID_SKILL);
                return;
            }
            if (this._rmHelper && !this._rmHelper.isNormalFireEnd()) {
                utils.invokeCallback(cb, null, {
                    rmatch: true,
                });
                return;
            }

            this._skState[skillId].flag = 0;
            utils.invokeCallback(cb, null, {
                skill_id: skillId,
            });
            
            this.emit(fishCmd.push.use_skill.route, {
                player: this,
                data: sdata
            });
            return;
        }

        let ret = this.cost.useSkill(skillId, data.wp_level, this.account);
        //开始持续时间定时器，结束时即技能结束
        if (skillId === consts.SKILL_ID.SK_FREEZ || skillId === consts.SKILL_ID.SK_AIM) {
            this._startSkillTicker(skillId);
        } else if (skillId === consts.SKILL_ID.SK_LASER && ret.notEnough === 3) {
            utils.invokeCallback(cb, FishCode.INVALID_WP_LASER);
            return;
        } else if (ret.notEnough > 0) {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL);
            return;
        }

        this._skState[skillId].flag = 0;
        let common = this._afterSkillCost(skillId, ret);
        utils.invokeCallback(cb, null, common);
        this.emit(fishCmd.push.use_skill.route, {
            player: this,
            data: sdata
        });
    }

    /**
     * 锁定技能，锁定鱼
     */
    c_use_skill_lock_fish(data, cb) {
        let tfishKey = data.tfish;
        let fish = this.fishModel.getActorData(tfishKey);
        if (!fish) {
            utils.invokeCallback(cb, FishCode.LOCK_FAILD);
            return;
        }

        let skillId = consts.SKILL_ID.SK_AIM;
        if (!this._skState[skillId]) {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL_STATE);
            return;
        }
        let flag = this._skState[skillId].flag;
        if (flag === undefined || flag === null || !this._skState[skillId].ticker) {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL_STATE);
            return;
        }
        this._skState[skillId].flag = 1;

        utils.invokeCallback(cb, null);
        this.emit(fishCmd.push.use_skill.route, {
            player: this,
            data: {
                skill_lock: tfishKey,
                skill_id: skillId,
            }
        });
    }

    /**
     * 召唤技能,召唤鱼
     */
    c_use_skill_call_fish(data, cb) {
        let skillId = consts.SKILL_ID.SK_CALL;
        if (!this._skState[skillId] || this._skState[skillId].flag !== 0 || this._skState[skillId].ticker) {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL_STATE);
            return;
        }
        this._skState[skillId].flag = 1;
        this._startSkillTicker(skillId);

        let fishKey = data.tfish;
        let fishPath = data.path;
        let call = {
            fish_key: fishKey,
            fish_path: fishPath,
        };
        utils.invokeCallback(cb, null);

        this.emit(fishCmd.push.use_skill.route, {
            player: this,
            data: {
                skill_call: call,
                skill_id: skillId,
            }
        });
    }

    _isNbomb(skillId) {
        return skillId === consts.SKILL_ID.SK_NBOMB0 || skillId === consts.SKILL_ID.SK_NBOMB1 || skillId === consts.SKILL_ID.SK_NBOMB2;
    }

    /**
     * 激光或核弹确定打击位置
     */
    c_use_skill_sure(data, cb) {
        let skillId = data.skill;
        if (!this._skState[skillId] || this._skState[skillId].flag !== 0 || this._skState[skillId].ticker) {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL_STATE);
            return;
        }
        let skillPower = null;
        if (skillId === consts.SKILL_ID.SK_LASER || this._isNbomb(skillId)) {
            let wpBk = data.wp_bk;
            let bullet = this.cost.parseBulletKey(wpBk);
            if (this._checkBullet(bullet, true) <= 0) {
                this._delBkCost(wpBk);
                return utils.invokeCallback(cb, null);
            }
            let curWpLv = bullet.wpLv;
            this._addBkCost(wpBk, this._powerSkillCost, true);//技能使用时，特殊标记
            this._powerSkillCost = 0;

            let firePoint = data.fire_point;
            skillPower = firePoint;
            this._skState[skillId].flag = 1;
            this._startSkillTicker(skillId);
            if (skillId === consts.SKILL_ID.SK_LASER) {
                let reset = 0;
                this.DIY.weapon_energy[curWpLv] = reset;
                this._save({
                    weapon_energy: this.DIY.weapon_energy,
                });
                utils.invokeCallback(cb, null, {
                    wp_level: curWpLv,
                    laser: reset,
                });
            } else {
                //核弹需要在确认发射时才扣钱
                let ret = null;
                if (this.isRealPlayer() && this._rmHelper) {
                    ret = this.cost.useSkillWithRmatch(skillId, data.wp_level, this.account, this._rmHelper.nbombCost);
                    this._rmHelper.nbFlag(true);
                } else {
                    ret = this.cost.useSkill(skillId, data.wp_level, this.account);
                }
                let common = this._afterSkillCost(skillId, ret);
                utils.invokeCallback(cb, null, common);
            }
            this.emit(fishCmd.push.use_skill.route, {
                player: this,
                data: {
                    skill_power: skillPower,
                    skill_id: skillId,
                    wp_bk: wpBk,
                }
            });
        } else {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL);
            return;
        }
    }

    /**
     * 战斗行为通知
     * 注意，只是变更通知，并不需持久化
     */
    c_fighting_notify(data, cb) {
        let event = data.event;
        let evtData = data.event_data;
        let ret = null;
        switch (event) {
            case consts.FIGHTING_NOTIFY.WP_LEVEL: {
                let wpLv = evtData.wp_level;
	            if (this._checkBulletLevel(wpLv)) {
	                this.DIY.weapon = wpLv;
	            } else {
	                utils.invokeCallback(cb, null);
	                return;
	            }
            }
            break;

            case consts.FIGHTING_NOTIFY.MINI_GAME: {
                let mini = evtData.mini;
                if (mini) {
                    let mtype = mini.type;
                    let mgold = mini.gold;
                    if (mgold === 0) {
                        this._miniTimestamp = new Date().getTime();
                    } else if (mgold > 0 && this._miniTimestamp) {
                        let cfg = null;
                        if (mtype === 0) {
                            cfg = configReader.getValue('new_mini_game_coincatch_cfg', 1001);
                        } else if (mtype === 1) {
                            cfg = configReader.getValue('new_mini_game_crazyfugu_cfg', 1001);
                        } else {
                            return;
                        }
                        let dt = cfg.cd * 1000;
                        let now = new Date().getTime();
                        now -= this._miniTimestamp;
                        const goldMax = cfg.maxscore;
                        if (now >= dt && mgold > 0 && mgold < goldMax && this.isRealPlayer()) {
                            this._mission.addProcess(RewardModel.TaskType.PLAY_LITTLE_GAME, mtype, mgold);
                            this._save({
                                gold: mgold,
                            }, GAMECFG.common_log_const_cfg.MINI_GAME);
                            ret = {
                                gold: this.account.gold,
                            };
                        }
                        this._miniTimestamp = null;
                    }
                }
            }
            break;

            case consts.FIGHTING_NOTIFY.DROP: {
                let drop = evtData.drop;
                if (drop && drop.isPirateReward) {
                    let pirate = this._pirate;
                    if (pirate && pirate.isFinished()) {
                        pirate.reset();
                        this._save({
                            pirateData: -1,
                        });
                        this._pirate = null;
                    }
                }
            }
            break;

            case consts.FIGHTING_NOTIFY.RMATCH_READY: {
                let rmatch_ready = evtData.rmatch_ready;
                this._rmatchReady(rmatch_ready);
            }
            break;

            case consts.FIGHTING_NOTIFY.RMATCH_NB: {
                let rmatch_nb = evtData.rmatch_nb;
                if (this._rmHelper && !rmatch_nb) {
                    this._rmHelper.nbFlag(false);
                    this.rpcRankMatchCall(rankMatchCmd.remote.cancelNbomb.route);
                    this.clearRmatch();
                }
            }
            break;
        }

        utils.invokeCallback(cb, null, ret);

        this.emit(fishCmd.push.fighting_notify.route, {
            player: this,
            data: {
                seatId: this.seatId,
                event: event,
                event_data: evtData,
            }
        });
    }

    /**
     * 查询海盗任务
     */
    c_query_pirate(data, cb) {
        let pirate = this._generatePirate();
        let pirateData = pirate && pirate.getProgress() || null;
        utils.invokeCallback(cb, null, {
            pirateData: pirateData
        });
    }

    /**
     * 战斗内聊天
     */
    c_room_chat(data, cb) {
        utils.invokeCallback(cb, null);
        if (data.matchFlag > 0) {
            let tdata = {
                type: data.type,
                idx: data.idx,
                matchFlag: data.matchFlag,
            };
            this._rmHelper && this.rpcRankMatchCall(rankMatchCmd.remote.rmatchChat.route, tdata);
        } else {
            this.emit(fishCmd.push.fighting_notify.route, {
                player: this,
                data: {
                    seatId: data.seatId,
                    type: data.type,
                    idx: data.idx,
                    data: data,
                }
            });
        }
    }

    /**
     * 排位赛：查询排位赛进度
     */
    c_query_rmatch(data, cb) {
        this._generateRmHelper(data);
        this.rpcRankMatchCall(rankMatchCmd.remote.query_playerInfo.route, null, function (err, playersInfos) {
            if (err || !playersInfos) {
                //排位赛结束
                this.clearRmatch();
                return utils.invokeCallback(cb, null, {});
            } else {
                for (let i = 0; i < playersInfos.length; i ++) {
                    let p = playersInfos[i];
                    if (p.uid == this.uid) {
                        this._rmHelper.resetWithContinue(p.status.fire, p.status.score);
                        break;
                    }
                }
                return utils.invokeCallback(cb, null, {
                    players: playersInfos
                });
            }
        }.bind(this));
    }

    /**
     * 清除技能持续时间定时器
     */
    clearSkillTickers() {
        if (this._skState) {
            for (let skillId in this._skState) {
                this._clearSkillTicker(skillId);
            }
            this._skState = null;
        }
    }

    /**
     * 开启指定技能定时器
     */
    _startSkillTicker(skillId) {
        const cfg = configReader.getValue('skill_skill_cfg', skillId);
        let duration = cfg.skill_duration;
        let isReal = this.isRealPlayer();
        let id = this.account.id;
        if (duration > 0 && this._skState[skillId] && !this._skState[skillId].ticker) {
            let self = this;
            this._skState[skillId].ticker = setTimeout(function () {
                let skId = this;
                self._clearSkillTicker(skId);
                //广播某玩家某技能结束 
                self.emit(fishCmd.push.use_skill_end.route, {
                    player: self,
                    data: {
                        seatId: self.seatId,
                        skill: skId,
                    }
                });
            }.bind(skillId), duration * 1000);
        }
    }

    /**
     * 关闭指定技能定时器
     */
    _clearSkillTicker(skillId) {
        if (!this._skState) return;
        let ts = this._skState[skillId];
        if (!ts) return;
        ts.ticker && clearTimeout(ts.ticker);
        ts.ticker = null;
        ts.flag = null;
    }

    /**
     * 重置diy
     * 注意：重置的武器倍率不能超过当前场景允许的最大等级
     */
    _resetDIY() {
        let account = this.account;
        let aw = account.weapon;
        let weapon = this.DIY && this.DIY.weapon || 1;
        let oldWpLv = weapon;
        if (!this._sceneCfg) {
            weapon = aw;
        } else if (aw >= this._sceneCfg.min_level && aw <= this._sceneCfg.max_level) {
            weapon = aw;
        }
        if (oldWpLv && weapon > oldWpLv && this.DIY && this.DIY.weapon_energy && this.DIY.weapon_energy[weapon]) {
            weapon = oldWpLv;
        }
        //排位赛时，皮肤变化需要及时通知
        let wpSkin = account.weapon_skin.equip;
        if (this.DIY && this.DIY.weapon_skin != wpSkin) {
            this.rpcRankMatchCall(rankMatchCmd.remote.weaponChange.route, {
                wp_skin: wpSkin,
            });
        }

        this._DIY = {
            weapon: weapon,
            weapon_skin: wpSkin,
            weapon_energy: account.weapon_energy,
        };

        //注意：原始数据可能无1倍激光能量标记，此处兼容处理
        this.DIY.weapon_energy = this.DIY.weapon_energy || {};
        let cfg = GAMECFG.newweapon_upgrade_cfg;
        let wbks = Object.keys(cfg);
        for (let i = 0; i < wbks.length; i++) {
            let lv = parseInt(wbks[i]);
            if (lv > aw) {
                break;
            }
            if (!this.DIY.weapon_energy[lv]) {
                this.DIY.weapon_energy[lv] = lv == aw ? cfg[lv].needpower : 0;
                this.account.weapon_energy = this.DIY.weapon_energy;
                this.save();
            }
        }
        this._makePirateFieldValid();
        this._resetSkinDt();
    }

    _resetSkinDt () {
        let curSkin = this._DIY.weapon_skin;
        let SKIN_CFG = configReader.getValue('newweapon_weapons_cfg', curSkin);
        let offset = FIRE_DELAY + Math.floor(Math.random()*50);
        this._skinDt = (SKIN_CFG.interval || 0.2) * 1000 - offset;
        this._maxWpLv = this.cost.getWpLevelMax(this.DIY.weapon_energy);
    }

    getSkinStar (skin) {
        skin = skin || this.DIY.weapon_skin;
        let star = 0;
        if (this.account.weapon_skin.star) {
            star = this.account.weapon_skin.star[skin] || 0;
        }
        return star;
    }

    /**
     * 机器人开火
     */
    robotFire() {
    }

    /**
     * 是否是真人
     */
    isRealPlayer() {
        return true;
    }

    /**
     * 将更新后的数据及时持久化
     * 注意：
     * 1、房间内不能直接改变武器等级和皮肤并持久化，因为武器升级和切换皮肤在数据服操作，且实际武器等级可能超过了当前房间所允许的区间
     * 2、data所含字段必须是account含有字段，反之不会持久化
     */
    _save(data) {
        if (this.isRealPlayer() && data && Object.keys(data).length > 0) {
            data.hasOwnProperty('gold') && (this.account.gold = data.gold);
            data.hasOwnProperty('weapon_energy') && (this.account.weapon_energy = data.weapon_energy);
            data.hasOwnProperty('heartbeat') && (this.account.heartbeat = data.heartbeat);
            data.hasOwnProperty('heartbeat_min_cost') && (this.account.heartbeat_min_cost = data.heartbeat_min_cost);
            data.hasOwnProperty('roipct_time') && (this.account.roipct_time = data.roipct_time);
            data.hasOwnProperty('pearl') && (this.account.pearl = data.pearl);
            data.hasOwnProperty('skill') && (this.account.skill = data.skill);
            data.hasOwnProperty('exp') && (this.account.exp = data.exp);
            data.hasOwnProperty('level') && (this.account.level = data.level);
            this.account.comeback && data.hasOwnProperty('comeback_hitrate') && (this.account.comeback.hitrate = data.comeback_hitrate, this.account.comeback = this.account.comeback);
           
            let goldChange = data.gold;
            if(goldChange > 0){
                this._mission.addProcess(RewardModel.TaskType.GET_GOLD, goldChange);
            }else if (goldChange < 0){
                this._mission.addProcess(RewardModel.TaskType.USE_GOLD, -goldChange);
            }

            let mission_only_once = this._mission.getReadyData2Send(RewardModel.Type.ACHIEVE);
            let mission_daily_reset = this._mission.getReadyData2Send(RewardModel.Type.EVERYDAY);
            mission_only_once && (this.account.mission_only_once = mission_only_once);
            mission_daily_reset && (this.account.mission_daily_reset = mission_daily_reset);

            if (data.hasOwnProperty('pirateData') && data.pirateData) {
                let td = this.account.pirate;
                let tp = data.pirateData;
                if (tp === -1) {
                    delete this.account.pirate[this._sceneCfg.name];
                    td = this.account.pirate;
                } else {
                    td[this._sceneCfg.name] = tp;
                }
                this.account.pirate = td;
            }

            //减缓及时存入，两次操作间隔大于某值时写入
            this._wait2WriteRedis = true;
            let now = new Date().getTime();
            if (this._writeRedisTimestamp) {
                let passed = now - this._writeRedisTimestamp;
                if (passed >= REDIS_DT) {
                    this.account.commit();
                    this._writeRedisTimestamp = now;
                    this._wait2WriteRedis = false;
                    this._updateRankWithBP();
                }
            }
        }
    }

    /**
     * 退出房间之前，立即写入尚未写入的日志
     */
    clear() {
        this.clearSkillTickers();
        this.removeAllListeners();

        playerChangeEvent.removeAllListeners(this.uid);
        this._log.logAll();
    
        this.save();
        this._updateRankWithBP();
    }

    /**
     * 捕获鱼相关任务统计
     */
    _missionCoutWithFish(fk, gold, skin) {
        let temp = fk.split('#');
        let fishID = temp[0];
        let cfg = fishID && this.fishModel.getFishCfgWithID(fishID) || null;
        let data = {};
        if (cfg) {
            let star = this.getSkinStar(skin);
            let wpStarCfg = configReader.getWeaponStarData(skin, star);

            //奖金鱼统计
            if (cfg.display_type === 4) {
                let bonus = this.account.bonus;
                if (!bonus.fish_count) {
                    bonus.fish_count = 0;
                }
                bonus.fish_count += 1;
                if (!bonus.gold_count) {
                    bonus.gold_count = 0;
                }
                let reward = this.cost.calGoldenFishReward(gold, skin, star, wpStarCfg);
                bonus.gold_count += reward;
                this.account.bonus = bonus;
                data.rewardFishFlag = 1;
            }

            //海盗任务统计(排位赛进行中不统计)
            if (this._pirate && !this._rmHelper) {
                let fishName = this.fishModel.getFishName(fishID);
                fishName && (data.pirateFlag = this._pirate.countFish(fishName));
            }

            //捕鱼积分统计,注意星级加成
            let fishingScore = gold;
            wpStarCfg && (fishingScore *= (1 + (wpStarCfg.fishing || 0)));
            this._countBp(fishingScore);

            //日常、成就统计
            this._mission.addProcess(RewardModel.TaskType.CATCH_FISH, 1, cfg.fish_id); //打死指定鱼1条
            this._mission.addProcess(RewardModel.TaskType.CATCH_FISH, 1, 0); //打死任意鱼统计  
            data.fish_id = cfg.fish_id;
        }
        return data;
    }

    /**
     * 返回玩家重连时需要继续的关键数据
     */
    getContinueData() {
        let data = {};
        let mBIdx = this._lastFireIdx;
        mBIdx > 0 && (data.mBIdx = mBIdx);
        return data;
    }

    /**
     * 其他消耗:
     * 购买皮肤、购买月卡、购买VIP礼包、购买道具（提现功能内非实物类购买）、购买钻石、购买技能等各种其他非赌博消耗
     * 即未参于奖池和抽水
     */
    addCostOther(costVal) {}

    /**
     * 个人捕获率修正过期检查
     */
    checkPersonalGpctOut() {}

    /**
     * 初始化海盗任务
     */
    _generatePirate() {
        if (!this.isRealPlayer()) {
            return null;
        }
        if (this.account.pirate && this._sceneCfg && !this._pirate) {
            let now = new Date().getTime();
            if (this._pirateTimestamp && now - this._pirateTimestamp < this._sceneCfg.pirate_time * 1000) {
                return null;
            }
            let name = this._sceneCfg.name;
            this._pirate = new Pirate(this.account.pirate[name], this._sceneCfg);
            this._pirateTimestamp = now;
        }
        return this._pirate;
    }

    /**
     * 海盗任务字段合法化
     */
    _makePirateFieldValid() {
        if (this.account.pirate && typeof (this.account.pirate) === 'string') {
            this.account.pirate = JSON.parse(this.account.pirate);
        }
    }

    _generateRmHelper (data) {
        if (!this._rmHelper) {
            this._rmHelper = new RmatchHelper();
        }
        this._rmHelper.setServerData({
            serverId: data.serverId,
            roomId: data.roomId,
        });
    }

    /**
     * 排位赛：客户端准备就绪，等待开始通知
     */
    _rmatchReady(evtData) {
        this._generateRmHelper(evtData);
        this.rpcRankMatchCall(rankMatchCmd.remote.ready.route, {
            gameSid: this.sid,
            isContinue: evtData.isContinue,
        });
    }

    /**
     * 排位赛：正式开始
     */
    startRmatch(evtData) {
        if (!this._rmHelper) return;
        this._rmHelper.setNbCost(evtData.nbomb_cost);
        this._rmHelper.registerUpdateFunc(function (data) {
            //logger.error('当前战绩===', data);
            if (data.nbomb) {
                this.rpcRankMatchCall(rankMatchCmd.remote.useNbomb.route, data);
                this.clearRmatch();
            } else {
                //比赛结算时，注意皮肤星级加成
                if (this._rmHelper.isNormalFireEnd()) {
                    let curSkin = this.DIY.weapon_skin;
                    let star = this.getSkinStar(curSkin);
                    let wpStarCfg = null;
                    star && (wpStarCfg = configReader.getWeaponStarData(curSkin, star));
                    if (wpStarCfg) {
                        data.star = {
                            skin: curSkin,
                            score : wpStarCfg.score,    //--比赛分数提高
                            rank : wpStarCfg.rank,    //--比赛胜点提高
                        };
                    }
                }
                this.rpcRankMatchCall(rankMatchCmd.remote.fightInfo.route, data);
            }
        }.bind(this));
    }

    /**
     * 排位赛：全程结束，销毁
     */
    clearRmatch() {
        this._rmHelper = null;
        logger.error('比赛结束，重置状态');
    }

    /**
     * 战斗服向比赛服发送数据
     * @param {*} method
     * @param {*} data
     * @param {*} cb
     */
    rpcRankMatchCall(method, data, cb) {
        if (!this.isRealPlayer()) return;
        if (!this._rmHelper) return;
        data = data || {};
        data.uid = this.account.id;
        data.roomId = this._rmHelper.roomId;

        let rpc_target = rpc.getRPCTarget(rpc.serverType.rankMatch, rpc.serverModule.rankMatch.rankMatchRemote, method);
        rpc.invoke(rpc_target, rpc.getSession(rpc.serverType.rankMatch, this._rmHelper.rankMatchSid), data, cb);
    }

    /**
     * 统计捕鱼积分
     */
    _countBp(gold) {
        this.account.bp += gold;
    }

    /**
     * 捕鱼积分送入排行榜
     */
    _updateRankWithBP() {
        const BP = "rank:bp"; //捕鱼积分排行榜
        let redis = redisConnector.cmd;
        let platform = this.account.platform;
        let score = this.account.bp;
        let member = this.account.id;
        redis.zadd(BP + ":" + platform, score, member);
        redis.hset(BP + ":timestamp", member, new Date().getTime());
    }
}

module.exports = FishPlayer;