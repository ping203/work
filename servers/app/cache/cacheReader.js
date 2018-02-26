const cache = require('./cache');
const redisKey = require('../database').dbConsts.REDISKEY;

class CacheReader{
    constructor(){
       this._data = new Map();
    }

    //读取平台抽水系数
    get pumpwater(){
        return cache.get(redisKey.PLATFORM_DATA.PUMPWATER);
    }

    //读取平台捕获率
    get platformCatchRate(){
        return cache.get(redisKey.PLATFORM_DATA.PLATFORM_CATCHRATE);
    }

    //读取平台奖金池
    get bonuspool(){
        return cache.get(redisKey.PLATFORM_DATA.BONUS_POOL);
    }

    //读取平台抽水池
    get pumppool(){
        return cache.get(redisKey.PLATFORM_DATA.PUMP_POOL);
    }

    // /全服提现修正
    get catchRevise () {
        return cache.get(redisKey.PLATFORM_DATA.PLATFORM_CATCH_REVISE);
    }

    


}

module.exports = new CacheReader();