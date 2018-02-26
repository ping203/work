// //--[[
// description: 排位赛报名机器人
// author: scott (liuwenming@chufengnet.com)
// date: 20171222
// ATTENTION：
// //--]]

const  MatchingUser = require('./matchingUser');
const uuidv1 = require('uuid/v1');
const consts = require('../consts');

class MatchingRobotUser extends MatchingUser {
    constructor (opts) {
        super(opts);
        this.account.kindId = consts.ENTITY_TYPE.ROBOT;
    }

    /**
     * 分配一个合适的机器人.
     * 详细参数可参考传入参数确定
     * @param realUer 
    realUer = MatchingUser {
        account: {
            eventHandler: EventHandler { events: {}, gainLossKeys: [Object] },
            nickname: 'fj_70248',
            weapon_skin: { own: [Array], equip: 9, star: {}, free_draw: [Object], vote: [] },
            figure_url: 'http://p3.wmpic.me/article/2015/05/18/1431913649_GWJqwtVU.jpeg',
            match_rank: 7,
            match_win: 5,
            match_fail: 0,
            match_points: 1259,
            sid: 'connector-server-1',
            uid: '70248',
            kindId: 0 
        }
        _sigupTime: 1514889292402,
        _sword: 2518,
        _float_sword: 0 
    }
     * @param robotInfo
    robotInfo = {
        baseInfo: baseInfo,
        weapon_skin: weapon_skin,
        match_rank: match_rank,
        ior: ior,
    }
     */
    static async allocUser(realUer, robotInfo) {
        logger.error('realUer = ', realUer);

        // 使用玩家uid的相反数作为机器人的uid.
        let rid = -realUer.account.uid;
        logger.error('rid = ', rid);

        // 机器人的武器倍率, 核弹消耗金币没有意义，随便设置一个值
        let weapon = 100;
        let nbomb_cost = 1000;

        let account = {
            uid: rid,
            nickname: robotInfo.baseInfo.nickname,
            figure_url: robotInfo.baseInfo.headUrl,
            weapon_skin: robotInfo.weapon_skin,
            weapon: weapon, 
            match_rank: robotInfo.match_rank,
            nbomb_cost: nbomb_cost,// 本次核弹消耗金币
            match_winning_streak: 0,// 连胜次数
            match_win: 1, // 胜利次数
            match_fail: 0, // 失败次数
            charm_point: 10000, // 魅力点数
            charm_rank: 1, // 魅力等级
            match_rank: 1, // 排位赛段位
            match_season_win: 1, // 赛季胜利次数
            match_points: 1000, // 点数
            ior: robotInfo.ior, // 本段位的平均收支比
        };

        let robot = new MatchingRobotUser({
            ext: {
                sid: '0',
                uid: account.uid,
                isRobot: true,
            },
            account: account,
        });
        return robot;
    }
}

module.exports = MatchingRobotUser;
