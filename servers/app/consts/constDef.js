module.exports = {
    PALYER_STATE:{
        OFFLINE:0,
        ONLINE:1
    },
    CACHE_DATA_TYPE:{
        PUMPWATER:1, //系统抽水系数变化
        PLATFORM_CATCHRATE:2, //平台捕获率变化
        BONUS_POOL:2, //平台奖池变化
        PUMP_POOL:3, //平台抽水
    },
    SERVER_PERIOD:{
        GENERAL:0, //普通周期
        OUT_SCORE:1,//出分周期
        EATE_SCORE:2, //吃分周期 
    },
    CHANNEL: {
        TEST: 1000,
        EGRET: 1001,
        WANBA: 1002,
        FACEBOOK: 1003,
        GOOGLE: 1004,
        INNER: 1005,
    },
};