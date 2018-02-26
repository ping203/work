module.exports = {
    MissionType: {
        NONE: 0,
        CATCH_FISH: 1,          //捕获x鱼y条，如果x为0则为任意鱼
        USE_SKILL: 2,           //使用x技能y次，如果x为0则为任意技能
        UPDATE_USER_LV: 3,      //角色等级x级
        UPDATE_WEAPON_LV: 4,    //解锁炮台x倍
        USE_FISH_CATCH_FISH: 5, //利用x鱼炸死y条其他鱼
        GET_WEAPON_SKIN: 6,     //获得炮台皮肤x个
        ONE_CATCH_FISH: 7,      //单次开炮捕获鱼x条
        ONE_GET_GOLD: 8,        //单次开炮获得金币x
        GET_GOLD: 9,            //累计获得金币x
        USE_DIAMOND: 10,        //累计消耗钻石x
        USE_GOLD: 11,           //累计消耗金币x
        SHARE_TIMES: 12,        //分享x次
        CONTINUE_LOGIN: 13,     //累计登录x天
        GET_RANK_LV: 14,        //获得排位x阶段位y次
        GET_VIP_LV: 15,         //成为VIPx
        GET_DRAGON_STAR: 16,    //达成龙宫x星y次
        GET_ACHIEVE_POINT: 17,  //获得x点成就点
        GOLD_TIMES: 18, //金币次数
        CHARG_PEARL: 19, //充值钻石
        DEFEND_GODDESS: 20, //保卫女神
        STOCKING_FISH: 21, //放养鱼
        GODDESS_LEVEL: 22, //女神最高闯关
        PETFISH_TOTAL_LEVEL: 23, //宠物鱼等级和
        UNLOCK_GODDESS: 24, //解锁女神
        PLAY_LITTLE_GAME: 25, //x小游戏中获得y分
        MAX: 26,//最后一个，暂时取消掉了
        MATCH_VICTORS: 28,//排位赛胜利x次
    },
    /**
     * 0 incr增加
     * 1 equal赋值
     * 2 cover取最大值
     */
    ValueType: {
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
    },
};