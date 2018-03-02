// //--[[
// description: 保卫女神玩家
// author: scott (liuwenming@chufengnet.com)
// date: 20171129
// ATTENTION：
// //--]]
const ChannelPlayer =  require('../entity/channelPlayer');
const FishCode = require('../fishCode');
const fishCmd = require('../../../../cmd/fishCmd');
const ACCOUNTKEY = require('../../../../database').dbConsts.ACCOUNTKEY;
const REDISKEY = require('../../../../database').dbConsts.REDISKEY;
const configReader = require('../configReader');
const SAVE_DT = 30 * 1000;

class GoddessPlayer extends ChannelPlayer {
    constructor (data) {
        super(data);
        this._godIdx = 0;
        this._godHp = 0;
    }

    static sBaseField () {
        let baseField = ChannelPlayer.sBaseField();
        const self = [
            ACCOUNTKEY.GODDESS,
            ACCOUNTKEY.GODDESS_CROSSOVER,
            ACCOUNTKEY.GODDESS_ONGOING,
            ACCOUNTKEY.MAX_WAVE,
            ACCOUNTKEY.PLATFORM,
        ];
        return baseField.concat(self);
    }

    getBaseField(){
        return GoddessPlayer.sBaseField();
    }

    getCurGod (godIdx) {
        godIdx = godIdx || this._godIdx;
        let goddess = this.account.goddess;
        if (goddess && goddess.length > godIdx) {
            return goddess[godIdx];
        }
        return null;
    }

    godStart () {
        let god = this.getCurGod();
        return god.startWaveIdx;
    }

    _isGodUnlocked (godIdx) {
        let god = this.getCurGod(godIdx);
        if (god) {
            let unlock = god.unlock;
            for (let i = 0 ; i < unlock.length; i ++) {
                if (unlock[i] != 2) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    /**
     * 准备就绪
     * @param {*} data 
     * @param {*} cb 
     */
    c_god_ready (data, cb) {
        let godIdx = data.godIdx;
        if (!this._isGodUnlocked(godIdx)) {
            return utils.invokeCallback(cb, FishCode.LOCK_GOD);
        }

        this._godIdx = godIdx;
        let god = this.getCurGod();
        this._godHp = god.hp;
        this._setPauseAwayFlag();//进入房间，则标记暂离

        let cfg = configReader.getGodLevelData(god.id, god.level);
        let hpPercent = god.hp / cfg.hp;
        utils.invokeCallback(cb, null, {
            hpPercent: hpPercent,
        });
        this.emit(fishCmd.push.god_ready.route, {player: this});
    }

    /**
     * 客户端主动暂停，例如打开一个ui弹窗
     * @param {*} data 
     * @param {*} cb 
     */
    c_god_pause (data, cb) {
        let godIdx = data.godIdx;
        if (!this._isGodUnlocked(godIdx)) {
            return utils.invokeCallback(cb, FishCode.LOCK_GOD);
        }
        if (this._godIdx != godIdx) {
            return utils.invokeCallback(cb, FishCode.INVALID_GOD);
        }
        utils.invokeCallback(cb, null, {});
        this.emit(fishCmd.push.god_pause.route, {player: this});
        this.save();
    } 

    /**
     * 客户端主动继续，例如关闭刚刚打开的弹窗
     * @param {*} data 
     * @param {*} cb 
     */
    c_god_continue (data, cb) {
        let godIdx = data.godIdx;
        if (!this._isGodUnlocked(godIdx)) {
            return utils.invokeCallback(cb, FishCode.LOCK_GOD);
        }
        if (this._godIdx != godIdx) {
            return utils.invokeCallback(cb, FishCode.INVALID_GOD);
        }
        utils.invokeCallback(cb, null, {});
        this.emit(fishCmd.push.god_continue.route, {player: this});
    } 

    /**
     * 女神受伤
     * @param {*} data 
     * @param {*} cb 
     */
    c_god_hurt (data, cb) {         
        logger.debug('---client is c_god_hurt.', data.godIdx, data.fishKey, data.isInGroup);
        let godIdx = data.godIdx;
        if (!this._isGodUnlocked(godIdx)) {
            return utils.invokeCallback(cb, FishCode.LOCK_GOD);
        }
        if (this._godIdx != godIdx) {
            return utils.invokeCallback(cb, FishCode.INVALID_GOD);
        }

        let fish = this.fishModel.getActorData(data.fishKey);
        if (!fish) {
            logger.error('该鱼不存在或已死，为啥还要碰撞？');
            utils.invokeCallback(cb, null);
            return;
        }
        if (!this._godHp) {
            logger.error('女神已死');
            utils.invokeCallback(cb, null);
            return;
        }
        let hurtVal = this.fishModel.getHurtValue(data.fishKey);
        if (!hurtVal || hurtVal < 0) {
            logger.error('召唤鱼不攻击或女神受伤数据有误');
            utils.invokeCallback(cb, null);
            return;
        }
        logger.debug('hurtVal = ', hurtVal);
        let god = this.getCurGod();
        let cfg = configReader.getGodLevelData(god.id, god.level);
        this._godHp -= hurtVal;
        let hpPercent = this._godHp / cfg.hp;
        if (hpPercent <= 0) {
            hpPercent = 0;
            this._godHp = 0;
        }
        utils.invokeCallback(cb, null, {
            hpPercent: hpPercent, 
            hurtVal: hurtVal,
        });
        this.emit(fishCmd.push.god_hurt.route, {player: this, hpPercent: hpPercent, fishKey: data.fishKey});
    }

    /**
     * 定时轮序逻辑
     * @param {*轮询时间差，单位秒} dt 
     */
    update (dt) {
        super.update(dt);

        //定时存档
        let now = new Date().getTime();
        if (this._lastTime) {
            let pass = now - this._lastTime;
            if (pass >= SAVE_DT) {
                this.save();
                this._lastTime = now;
            }
        }else{
            this._lastTime = now;
        }
    }

    save(){
        let goddess = this.account.goddess;
        if (goddess && goddess.length > this._godIdx) {
            let god = goddess[this._godIdx];
            if (this._godHp === 0) {
                //女神死了，则恢复到默认血量,且暂离失效
                let cfg = configReader.getGodLevelData(god.id, god.level);
                god.hp = cfg.hp;
                god.isPauseAway = false;
                let max_wave = this.account.max_wave;
                let startWaveIdx = god.startWaveIdx;
                let needUpdate = false;
                if (max_wave < startWaveIdx) {
                    max_wave = startWaveIdx;
                    needUpdate = true;
                }
                if (needUpdate) {
                    this.account.max_wave = max_wave;
                    redisConnector.cmd.zadd(`${REDISKEY.RANK.GODDESS}:${this.account.platform}`, max_wave, this.account.id);
                }
                god.startWaveIdx = 0;
                this.account.goddess_crossover = 0;
                this.account.goddess_ongoing = 0;
            } else {
                god.startWaveIdx = this.fishModel.getStart();
                god.hp = this._godHp;
                god.isPauseAway = true;
                this.account.goddess_ongoing = 1;
            }
            this.account.goddess = goddess;
            super.save();
        }
    }

    _setPauseAwayFlag () {
        let goddess = this.account.goddess;
        if (goddess && goddess.length > this._godIdx) {
            let god = goddess[this._godIdx];
            god.isPauseAway = true;
            this.account.goddess = goddess;
            super.save();
        }
    }
            

}

module.exports = GoddessPlayer;