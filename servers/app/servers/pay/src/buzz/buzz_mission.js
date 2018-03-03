const RedisUtil = require('../utils/RedisUtil');
const TaskType = require('../dao/dao_activity').TaskType;
const daily_quest_cfg = require('../../../config').gameConfig.daily_quest_cfg;
const BuzzUtil = require('../utils/BuzzUtil');
const DaoCommon = require('../dao/dao_common');
const logger = loggerEx(__filename);

const daily_mission_prefix = "daily_mission:";
const mission_prefix = "mission:";

function getKeys(type) {
    let t = {};
    let prefix = "";
    if (type == 0) {
        prefix = daily_mission_prefix;
    } else {
        prefix = mission_prefix;
    }
    for (let idx in daily_quest_cfg) {
        let quest = daily_quest_cfg[idx];
        if (quest.type == type) {//日常
            t[prefix + quest.condition + "_" + quest.value1] = 1;
        }
    }
    return t;
}

const key1 = getKeys(0);//日常
const key2 = getKeys(1);//非日常

function getStartId(type, condition, value1) {
    for (let idx in daily_quest_cfg) {
        let quest = daily_quest_cfg[idx];
        if (quest.type == type && quest.condition == condition && value1 == quest.value1) {
            return quest.id;
        }
    }
}

function specialValue(account, condition) {
    switch (Number(condition)) {
        case TaskType.UPDATE_USER_LV:
            return account.level;
        case TaskType.UPDATE_WEAPON_LV:
            return account.weapon;
        case TaskType.GET_WEAPON_SKIN:
            return account.weapon_skin.own.length - 1;
        case TaskType.GET_VIP_LV:
            return account.vip;
        case TaskType.GODDESS_LEVEL:
            return account.max_wave;
        case TaskType.PETFISH_TOTAL_LEVEL:
            return account.petfish_total_level;
        case TaskType.GET_RANK_LV:
            return account.match_rank;
        case TaskType.GET_ACHIEVE_POINT:
            return account.achieve_point;
        case TaskType.UNLOCK_GODDESS:
            let goddess = account.goddess;
            let count = 0;
            for (let i in goddess) {
                if (goddess[i].level > 0) {
                    count++;
                }
            }
            return count;
    }
    return null;
}

async function getMissionInfo(account, cb) {
    try {
        let mission_daily_reset = account.mission_daily_reset;
        let mission_only_once = account.mission_only_once;
        mission_only_once.achievePoint = account.achieve_point;
        let cmds_daily = [];
        let key_daily = [];
        let cmds_once = [];
        let key_once = [];
        //建立mission_daily_reset和redis key的对应关系
        let map_daily = {};
        for (let mid in mission_daily_reset) {
            let quest = BuzzUtil.getQuestById(mid);
            if (quest) {
                map_daily[daily_mission_prefix + quest.condition + "_" + quest.value1] = mid;
            }
        }
        let map_once = {};
        for (let mid in mission_only_once) {
            let quest = BuzzUtil.getQuestById(mid);
            if (quest) {
                map_once[mission_prefix + quest.condition + "_" + quest.value1] = mid;
            }
        }

        for (let k in key1) {//日常 type==0
            let a = k.split(":");
            let b = a[1].split("_");
            let newVar = specialValue(account, b[0]);//几个特殊任务直接拿相应的数据，比如等级
            if (newVar == null) {
                cmds_daily.push(['hget', k, account.id]);
                key_daily.push(k);
                continue;
            }
            if (newVar > 0) {
                let key = map_daily[k];
                if (key) {
                    if (mission_daily_reset[key] != -1) {
                        mission_daily_reset[key] = newVar;
                    }
                } else {
                    let mid = getStartId(0, b[0], b[1]);
                    if (mid) {
                        mission_daily_reset[mid] = newVar;
                    }
                }
            }
        }
        let data_daily = await multiFunc(cmds_daily);
        for (let i = 0; i < data_daily.length; i++) {
            let m = key_daily[i];
            let a = m.split(":");
            let b = a[1].split("_");
            let v = data_daily[i];
            let num = Number(v);
            if (v) {
                let k = map_daily[m];
                if (k) {
                    if (mission_daily_reset[k] != -1) {
                        mission_daily_reset[k] = num;
                    }
                } else {
                    let mid = getStartId(0, b[0], b[1]);
                    if (mid) {
                        mission_daily_reset[mid] = num;
                    }
                }
            }
        }

        for (let k in key2) {//日常 type==1
            let a = k.split(":");
            let b = a[1].split("_");
            let newVar = specialValue(account, b[0]);//几个特殊任务直接拿相应的数据，比如等级
            if (newVar == null) {
                cmds_once.push(['hget', k, account.id]);
                key_once.push(k);
                continue;
            }
            if (newVar > 0) {
                let key = map_once[k];
                if (key) {
                    if (mission_only_once[key] != -1) {
                        mission_only_once[key] = newVar;
                    }
                } else {
                    let mid = getStartId(1, b[0], b[1]);
                    if (mid) {
                        mission_only_once[mid] = newVar;
                    }
                }
            }
        }

        let data_once = await multiFunc(cmds_once);
        for (let i = 0; i < data_once.length; i++) {
            let m = key_once[i];
            let a = m.split(":");
            let b = a[1].split("_");
            let v = data_once[i];
            let num = Number(v);
            if (v) {
                let k = map_once[m];
                if (k) {
                    if (mission_only_once[k] != -1) {
                        mission_only_once[k] = num;
                    }
                } else {
                    let mid = getStartId(1, b[0], b[1]);
                    if (mid) {
                        mission_only_once[mid] = num;
                    }
                }
            }
        }
        account.mission_daily_reset = mission_daily_reset;
        account.mission_only_once = mission_only_once;
        account.commit();
        logger.info(mission_daily_reset);
        logger.info(mission_only_once);

        cb && cb(null, {mission_only_once: mission_only_once, mission_daily_reset: mission_daily_reset});
    } catch (err) {
        cb && cb(err);
    }
}

function multiFunc(cmds) {
    return new Promise(function (resolve, reject) {
        RedisUtil.getClient().multi(cmds).exec(function (err, res) {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}

function getMission(req, dataObj, cb) {
    let pool = req.pool;
    let token = dataObj.token;
    DaoCommon.checkAccount(pool, token, async function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        cb && cb(null, {mission_only_once: account.mission_only_once, mission_daily_reset: account.mission_daily_reset});
        // await getMissionInfo(account, cb);
    });
}

exports.getMission = getMission;
exports.getMissionInfo = getMissionInfo;