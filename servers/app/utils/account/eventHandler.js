const ACCOUNT_EVENT_TYPE = require('../../database/consts/consts').ACCOUNT_EVENT_TYPE;
const common_const_cfg = require('../../utils/imports').GAME_CFGS.common_const_cfg;
const ACCOUNTKEY = require('../../database/consts').ACCOUNTKEY;
const REDISKEY = require('../../database/consts').REDISKEY;
const mission = require('./mission');
const missionConsts = require('./missionConsts');

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
        ])
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
            default:
                break;
        }
    }

    listenKey(keys, account) {
        keys.forEach(function (key) {
            if (this.gainLossKeys.has(key[0])) {
                this.addEvent(ACCOUNT_EVENT_TYPE.GAIN_LOST, account);
            }
            if (this.missionKeys.has(key[0])) {
                this.addEvent(ACCOUNT_EVENT_TYPE.MISSION, account);
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
                }
                else if (account.gain_loss_limit == 0 && account.gain_loss_snapshot != 0) {
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
                if (value && 'gold' == key) {
                    value > 0 ? mission.add(account.id, missionConsts.MissionType.GET_GOLD, 0, value)
                        : mission.add(account.id, missionConsts.MissionType.USE_GOLD, 0, Math.abs(value));
                }
                if ('pearl' == key && value < 0) {
                    mission.add(account.id, missionConsts.MissionType.USE_DIAMOND, 0, Math.abs(value));
                }
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