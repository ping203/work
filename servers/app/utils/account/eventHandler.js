const ACCOUNT_EVENT_TYPE = require('../../database/consts/consts').ACCOUNT_EVENT_TYPE;
const common_const_cfg = require('../../utils/imports').GAME_CFGS.common_const_cfg;
const ACCOUNTKEY = require('../../database/consts').ACCOUNTKEY;
const REDISKEY = require('../../database/consts').REDISKEY;
const RewardModel = require('./RewardModel');
const omelo = require('omelo');
const rpc = require('../../logic/net/rpc');
const fishCmd = require('../../cmd/fishCmd');

class EventHandler {
    constructor() {
        this.events = {};
        this.gainLossKeys = new Map([
            [ACCOUNTKEY.RECHARGE, 1],
            [ACCOUNTKEY.CASH, 1],
            [ACCOUNTKEY.COST, 1],
            [ACCOUNTKEY.GOLD, 1]
        ]);
        this.missionKeys = new Map([
            [ACCOUNTKEY.GOLD, 1],
            [ACCOUNTKEY.PEARL, 1],
        ]);
        this.accountChangeKeys = new Map([
            [ACCOUNTKEY.GOLD,1],
            [ACCOUNTKEY.PEARL,1],
            [ACCOUNTKEY.WEAPON,1],
            [ACCOUNTKEY.WEAPON_ENERGY,1],
            [ACCOUNTKEY.WEAPON_SKIN,1],
            [ACCOUNTKEY.SKILL,1],
            [ACCOUNTKEY.VIP,1],
            [ACCOUNTKEY.COMEBACK,1],
        ]);
    }

    addEvent(type, account, fields) {
        switch (type) {
            case ACCOUNT_EVENT_TYPE.GAIN_LOST:

                if (!this.events[type]) {
                    this.events[type] = this.genGainLossFunc(account);
                }
                break;
            case ACCOUNT_EVENT_TYPE.DATA_SYNC:
                if (!this.events[type]) {
                    this.events[type] = this.genSyncFunc(account, fields);
                }
                break;
            case ACCOUNT_EVENT_TYPE.MISSION:
                if (!this.events[type]) {
                    this.events[type] = this.missionFunc(account);
                }
                break;
            case ACCOUNT_EVENT_TYPE.PLAYER_DATA_CHANGE_SYNC:
                if (!this.events[type]) {
                    this.events[type] = this.playerDataSyncFunc(account);
                }
                break;
            default:
                break;
        }
    }

    listenKey(keys, account) {
        keys.forEach(function (key) {
            let tk = key[0];
            if (this.gainLossKeys.has(tk)) {
                this.addEvent(ACCOUNT_EVENT_TYPE.GAIN_LOST, account);
            }
            if (this.missionKeys.has(tk)) {
                this.addEvent(ACCOUNT_EVENT_TYPE.MISSION, account);
            }
            if (this.accountChangeKeys.has(tk)) {
                this.addEvent(ACCOUNT_EVENT_TYPE.PLAYER_DATA_CHANGE_SYNC, account, tk);
            }
        }.bind(this));
    }

    //计算盈亏系数
    _calcGainLoss(account) {
        if (isNaN(account.cash) || isNaN(account.gold) || isNaN(account.cost) || isNaN(account.recharge)) {
            console.error('_calcGainLoss--- 参数异常');
            return null;
        }

        // author YXL
        // 盈亏计算公式错误
        return Math.round(Number(account.cash) + Number(account.gold) / common_const_cfg.CHANGE_CASH_4 - Number(account.recharge));
    }

    genGainLossFunc(account) {
        let self = this;
        return function () {
            let v = self._calcGainLoss(account);
            if (v) {
                let tmpV = account.gain_loss;
                account.gain_loss = v;
                if (account.gain_loss_limit != 0 && account.gain_loss_snapshot == 0) {
                    account.gain_loss_snapshot = account.gain_loss;
                } else if (account.gain_loss_limit == 0 && account.gain_loss_snapshot != 0) {
                    account.gain_loss_snapshot = 0;
                }
                if (tmpV != v) {
                    redisConnector.cmd.zadd('rank:gain', v, account.id);
                    redisConnector.cmd.zadd('rank:loss', v, account.id);
                    account.commit();
                }
            }
        }
    }

    genSyncFunc(account, fields) {
        return function () {
            //dfc 记录改变数据k-v
            let id = account.id;
            redisConnector.cmd.sadd(REDISKEY.UPDATED_DELTA_UIDS, id);
            redisConnector.cmd.sadd(`${REDISKEY.UPDATED_DELTA_FIELDS}:${id}`, fields);
        }
    }

    missionFunc(account) {
        let updates = [];
        updates = updates.concat(account.update);
        return function () {
            for (let i = 0; i < updates.length; i++) {
                let key = updates[i][0];
                let value = updates[i][1];
                //统计金币变化dfc
                let mission = new RewardModel();
                mission.resetLoginData(account.mission_only_once, account.mission_daily_reset);
                let mark = false;
                if (value && 'gold' == key) {
                    mark = true;
                    value > 0 ? mission.addProcess(RewardModel.TaskType.GET_GOLD, value) :
                        mission.addProcess(RewardModel.TaskType.USE_GOLD, Math.abs(value));
                }
                if ('pearl' == key && value < 0) {
                    mark = true;
                    mission.addProcess(RewardModel.TaskType.USE_DIAMOND, Math.abs(value));
                }
                if (mark) {
                    account.mission_only_once = mission.getReadyData2Send(RewardModel.Type.ACHIEVE);
                    account.mission_daily_reset = mission.getReadyData2Send(RewardModel.Type.EVERYDAY);
                    account.commit();
                }
            }
        }
    }

    playerDataSyncFunc(account){
        return function(){
            let serverType = omelo.app.getServerType();
            if(serverType !== 'game'){
                let rpc_target = rpc.getRPCTarget(rpc.serverType.game, rpc.serverModule.game.playerRemote, fishCmd.remote.playerDataChange.route);
                rpc.invoke(rpc_target, rpc.getSession(rpc.serverType.game, account.id), {
                    uid: account.id,
                });
            }
        }
    }

    exec() {
        for (let key in this.events) {
            this.events[key]();
        }
        this.events = {};
    }
}

module.exports = EventHandler;