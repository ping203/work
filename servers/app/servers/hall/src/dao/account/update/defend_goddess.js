const RedisUtil = require('../../../utils/RedisUtil');
const redisKeys = require('../../../../../../database').dbConsts.REDISKEY;
const goddess_goddessup_cfg = require('../../../../../../utils/imports').GAME_CFGS.goddess_goddessup_cfg;
const logger = loggerEx(__filename);

const TAG = "【update.defend_goddess】";

exports.update = _updateGoddess;

/**
 * 获取当前保卫女神的状态, 1为有正在进行的游戏, 0表示没有正在进行的游戏.
 */
function _getOnGoing(goddess) {
    for (let i = 0; i < goddess.length; i++) {
        if (goddess[i].isPauseAway) {
            return 1;
        }
    }
    return 0;
}


//==============================================================================
// private
//==============================================================================

function _getGoddessHp(id, level) {
    let goddess = getGoddessFromId(id, level);
    return goddess.hp;
}

function getGoddessFromId(id, level) {
    for (let idx in goddess_goddessup_cfg) {
        let goddess = goddess_goddessup_cfg[idx];
        if (goddess.id == id && goddess.level == level) {
            return goddess;
        }
    }
    return 
}

function _updateGoddess(pool, data, cb, account) {
    let gods = data['gods'];
    let pass = data['pass'];// 是否结算(结算更新max_wave和max_wave_time, 否则不更新)
    try{
        gods = JSON.parse(gods);
    }
    catch (err){
        cb(err);
        return;
    }

    let isOnGoing = _getOnGoing(gods);
    let max_wave = account.max_wave;
    if(pass) {
        let needUpdate = false;
        for (let idx in gods) {
            let startWaveIdx = gods[idx].startWaveIdx;
            if (max_wave < startWaveIdx) {
                max_wave = startWaveIdx;
                needUpdate = true;
            }
        }
        if(needUpdate) {
            account.max_wave = max_wave;
            RedisUtil.zadd(redisKeys.RANK.GODDESS + ":" + account.platform, max_wave, account.id);
        }
        let pass_idx = data['pass_idx'];
        let goddess_tobe_change = gods[pass_idx];
        goddess_tobe_change.hp = _getGoddessHp(goddess_tobe_change.id, goddess_tobe_change.level);
        goddess_tobe_change.startWaveIdx = 0;
        account.goddess_crossover = 0;
    }
    account.goddess_ongoing = isOnGoing;
    account.goddess = gods;
    account.commit();
    cb(null, "success");
}