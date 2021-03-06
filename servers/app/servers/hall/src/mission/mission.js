const RedisUtil = require('../utils/RedisUtil');
const gameConfig = require('../../../../utils/imports').GAME_CFGS;
const active_active_cfg = gameConfig.active_active_cfg;
const active_activequest_cfg = gameConfig.active_activequest_cfg;
const daily_quest_cfg = gameConfig.daily_quest_cfg;

var MissionType = {
    NONE : 0,
    CATCH_FISH : 1,          //捕获x鱼y条，如果x为0则为任意鱼
    USE_SKILL : 2,           //使用x技能y次，如果x为0则为任意技能
    UPDATE_USER_LV : 3,      //角色等级x级
    UPDATE_WEAPON_LV : 4,    //解锁炮台x倍
    USE_FISH_CATCH_FISH : 5, //利用x鱼炸死y条其他鱼
    GET_WEAPON_SKIN : 6,     //获得炮台皮肤x个
    ONE_CATCH_FISH : 7,      //单次开炮捕获鱼x条
    ONE_GET_GOLD : 8,        //单次开炮获得金币x
    GET_GOLD : 9,            //累计获得金币x
    USE_DIAMOND : 10,        //累计消耗钻石x
    USE_GOLD : 11,           //累计消耗金币x
    SHARE_TIMES : 12,        //分享x次
    CONTINUE_LOGIN : 13,     //累计登录x天
    GET_RANK_LV : 14,        //获得排位x阶段位y次
    GET_VIP_LV : 15,         //成为VIPx
    GET_DRAGON_STAR : 16,    //达成龙宫x星y次
    GET_ACHIEVE_POINT : 17,  //获得x点成就点
    GOLD_TIMES : 18 , //金币次数
    CHARG_PEARL : 19, //充值钻石
    DEFEND_GODDESS : 20, //保卫女神
    STOCKING_FISH : 21, //放养鱼
    GODDESS_LEVEL : 22, //女神最高闯关
    PETFISH_TOTAL_LEVEL : 23, //宠物鱼等级和
    UNLOCK_GODDESS : 24, //解锁女神
    PLAY_LITTLE_GAME : 25, //x小游戏中获得y分
    MAX : 26,//最后一个，暂时取消掉了
    MATCH_VICTORS: 28,//排位赛胜利x次
};
/**
 * 0 incr增加
 * 1 equal赋值
 * 2 cover取最大值
 */
const valueType = {
    1: 0,
    2: 0,
    5: 0,
    7: 2,
    8: 2,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    16: 0,
    18: 0,
    19: 0,
    20: 0,
    21: 0,
    25: 0,
    28: 0,
};

/**
 * 距离明天还有多少秒
 */
function getNextDayBySeconds() {
    let today = new Date();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let sec = today.getSeconds();
    return (24 * 3600 - hours * 3600 - minutes * 60 - sec);
}

function _getCurActiveIds() {
    for (let idx in active_active_cfg) {
        let active = active_active_cfg[idx];
        let starttime = new Date(active.starttime);
        let endtime = new Date(active.endtime);
        let curtime = new Date();
        if (curtime > starttime && curtime < endtime) {
            return true;
        }
    }
    return false;
}

//查看此任务是否存在
function exits(type, condition, value1) {
    for (let id in daily_quest_cfg) {
        let mission = daily_quest_cfg[id];
        if (condition == mission.condition && value1 == mission.value1 && type == mission.type) {
            return true;
        }
    }
    return false;
}

function isRepeat(condition, value1) {
    for (let id in active_activequest_cfg) {
        let active = active_activequest_cfg[id];
        if (active.condition == condition && active.value1 == value1) {
            return active.repeat;
        }
    }
    return -1;
}

function add(id, missionType, value1, value2) {
    addMission(id, missionType, value1, value2);
    if (value1 != 0 && missionType == MissionType.CATCH_FISH) {
        addMission(id, missionType, 0, value2);
    }
}

function addMission(id, missionType, value1, value2) {
    let key = "mission:" + missionType + "_" + value1;
    let daily_key = "daily_mission:" + missionType + "_" + value1;
    let activity_key = "activity:" + missionType + "_" + value1;
    let isrep = isRepeat(missionType, value1);
    let isAct = _getCurActiveIds() && isrep != -1;
    let exits1 = exits(0, missionType, value1);//日常
    let exits2 = exits(1, missionType, value1);//非日常
    switch (valueType[missionType]) {
        case 0:
            exits2 && RedisUtil.hincrby(key, id, value2);
            exits1 && RedisUtil.hincrby(daily_key, id, value2);
            isAct && RedisUtil.hincrby(activity_key, id, value2);
            break;
        case 1:
            exits2 && RedisUtil.hset(key, id, value2);
            exits1 && RedisUtil.hset(daily_key, id, value2);
            isAct && RedisUtil.hset(activity_key, id, value2);
            break;
        case 2:
            exits2 && RedisUtil.hget(key, id, function (err, mission) {
                if (mission < value2) {
                    RedisUtil.hset(key, id, value2);
                }
            });
            exits1 && RedisUtil.hget(daily_key, id, function (err, mission) {
                if (mission < value2) {
                    RedisUtil.hset(daily_key, id, value2);
                }
            });
            isAct && RedisUtil.hget(activity_key, id, function (err, mission) {
                if (mission < value2) {
                    RedisUtil.hset(activity_key, id, value2);
                }
            });
            break;
    }
    //过期
    RedisUtil.getClient().ttl(daily_key, function (err, ttl) {
        if (ttl == -1) {
            RedisUtil.expire(daily_key, getNextDayBySeconds());
        }
    });
    RedisUtil.getClient().ttl(activity_key, function (err, ttl) {
        if (!isAct) {
            if (ttl != -2) {
                RedisUtil.del(activity_key);
            }
        } else if (ttl == -1) {
            //判断是否需要每日重置
            if (isrep == 1) {
                RedisUtil.expire(activity_key, getNextDayBySeconds());
            }
        }
    });

}

exports.add = add;
exports.MissionType = MissionType;