const MissionType = require('./missionConsts').MissionType;
const GAMECFG = require('../imports').GAME_CFGS;
const DT = 3000;

class Mission {
    constructor() {
        this.map = new Map();
        this.timestamp = null;
    }

    _update(key, id, value, type) {
        if (!value) return;
        let v = this.map.get(key);
        if (!v) {
            let map = new Map();
            map.set(id, value);
            this.map.set(key, map);
        } else {
            let newVar = v.get(id);
            if (!newVar) newVar = 0;
            switch (Number(type)) {
                case 0:
                    newVar += value;
                    break;
                case 1:
                    newVar = value;
                    break;
                case 2:
                    if (newVar < value) {
                        newVar = value;
                    }
                    break;
            }
            v.set(id, newVar);
            this.map.set(key, v);
        }
    }

    _getType(condition) {
        if (condition == 7 || condition == 8) {
            return 2;
        }
        return 0;
    }

    _getCmd(cmds, cmds_get, cmds_key, type, redis_key, id, value) {
        switch (type) {
            case 0:
                cmds.push(['hincrby', redis_key, id, value]);
                break;
            case 1:
                cmds.push(['hset', redis_key, id, value]);
                break;
            case 2:
                cmds_get.push(['hget', redis_key, id, value]);
                cmds_key.push({key: redis_key, id: id, value: value});
                break;
        }
    }

    _save() {
        let self = this;
        let cmds = [];
        let cmds_get = [];
        let cmds_key = [];
        let cmds_cover = [];
        let cmds_ttl = [];
        let cmds_ttl_key = [];
        let cmds_del = [];
        let isActive = this._getCurActiveIds();
        this.map.forEach(function (value, key) {
            let type = key.split(":");
            let condition = type[1].split(":")[0];
            let value1 = type[1].split(":")[1];
            let isP = self._isRepeat(condition, value1);
            if (type[0] == "activity") {
                if (isActive) {
                    if (isP == 1) {
                        cmds_ttl.push(['ttl', key]);
                        cmds_ttl_key.push({key: key});
                    }
                } else {
                    cmds_del.push(['del', key]);
                }
            }
            if (type[0] == "daily_mission") {
                cmds_ttl.push(['ttl', key]);
                cmds_ttl_key.push({key: key});
            }
            value.forEach(function (v1, id) {
                switch (type[0]) {
                    case "mission":
                        self._getCmd(cmds, cmds_get, cmds_key, self._getType(condition), key, id, v1);
                        break;
                    case "daily_mission":
                        self._getCmd(cmds, cmds_get, cmds_key, self._getType(condition), key, id, v1);
                        break;
                    case "activity":
                        if (isActive) {
                            self._getCmd(cmds, cmds_get, cmds_key, self._getType(condition), key, id, v1);
                        }
                        break;
                }
            })
        });
        if (cmds.length > 0) {
            redisConnector.cmd.multi(cmds).exec();
        }
        if (cmds_get.length > 0) {
            redisConnector.cmd.multi(cmds_get).exec(function (err, res) {
                for (let i = 0; i < res.length; i++) {
                    let value = cmds_key[i].value;
                    if (value > res[i]) {
                        cmds_cover.push(['hset', cmds_key[i].key, cmds_key[i].id, value]);
                    }
                }
                if (cmds_cover.length > 0) {
                    redisConnector.cmd.multi(cmds_cover).exec();
                }
            });
        }
        if (cmds_ttl.length > 0) {
            let t = this._getNextDayBySeconds();
            redisConnector.cmd.multi(cmds_ttl).exec(function (err, res) {
                let cmds_expire = [];
                for (let i = 0; i < res.length; i++) {
                    if (res[i] == -1) {
                        cmds_expire.push(['expire', cmds_ttl_key[i].key, t]);
                    }
                }
                if (cmds_expire.length > 0) {
                    redisConnector.cmd.multi(cmds_expire).exec();
                }
            });
        }
        if (cmds_del.length > 0) {
            redisConnector.cmd.multi(cmds_del).exec();
        }
        this.map.clear();
    }

    _getNextDayBySeconds() {
        let today = new Date();
        let hours = today.getHours();
        let minutes = today.getMinutes();
        let sec = today.getSeconds();
        return 24 * 3600 - hours * 3600 - minutes * 60 - sec;
    }

    _getCurActiveIds() {
        for (let idx in GAMECFG.active_active_cfg) {
            let active = GAMECFG.active_active_cfg[idx];
            let starttime = new Date(active.starttime);
            let endtime = new Date(active.endtime);
            let curtime = new Date();
            if (curtime > starttime && curtime < endtime) {
                return true;
            }
        }
        return false;
    }

    _exits(type, condition, value1) {
        for (let id in GAMECFG.daily_quest_cfg) {
            let mission = GAMECFG.daily_quest_cfg[id];
            if (condition == mission.condition && value1 == mission.value1 && type == mission.type) {
                return true;
            }
        }
        return false;
    }

    _isRepeat(condition, value1) {
        for (let id in GAMECFG.active_activequest_cfg) {
            let active = GAMECFG.active_activequest_cfg[id];
            if (active.condition == condition && active.value1 == value1) {
                return active.repeat;
            }
        }
        return -1;
    }

    _addMission(id, missionType, value1, value2) {
        let key = "mission:" + missionType + "_" + value1;
        let daily_key = "daily_mission:" + missionType + "_" + value1;
        let activity_key = "activity:" + missionType + "_" + value1;
        let isrep = this._isRepeat(missionType, value1);
        let isActive = this._getCurActiveIds() && isrep != -1;
        let isMissionDaily = this._exits(0, missionType, value1);//日常
        let isMission = this._exits(1, missionType, value1);//非日常
        isMission && this._update(key, id, value2, this._getType(missionType));
        isMissionDaily && this._update(daily_key, id, value2, this._getType(missionType));
        isActive && this._update(activity_key, id, value2, this._getType(missionType));
    }

    add(id, missionType, value1, value2) {
        this._addMission(id, missionType, value1, value2);
        if (value1 != 0 && missionType == MissionType.CATCH_FISH) {
            this._addMission(id, missionType, 0, value2);
        }
        if (!this.timestamp) {
            this.timestamp = new Date().getTime();
        }
        let now = new Date().getTime();
        if (now - this.timestamp >= DT) {
            this._save();
            this.timestamp = now;
        }
    }
}

module.exports = new Mission();