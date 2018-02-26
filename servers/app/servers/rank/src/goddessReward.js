const RankReward = require('./rankReward');
const REDISKEY = require('../../database/consts').REDISKEY;
const dbUtils = require('../../database/').dbUtils;
class GoddessReward extends RankReward {
    constructor() {
        super();
    }

    async handle(task, week) {
        // /* yxl */ console.log('handle');
        await super.handle(task, week);
    }

    _getUids(rankInfo) {
        let uids = [];
        for (let uid in rankInfo.ranks) {
            uids.push(uid);
        }
        return uids;
    }

    async generateChart(rankInfo, week, task) {
        // /* yxl */ console.log('2222222222222222222222222222rankInfo:', rankInfo);
        // /* yxl */ console.log('GoddessReward.generateChart');
        let uids = this._getUids(rankInfo);
        if (uids.length == 0) {
            return;
        }

        let maxWaves = await dbUtils.redisAccountSync.oneCmdAsync(['hmget', `${REDISKEY.MAX_WAVE}`, uids]);

        /* yxl */ console.log('maxWaves', maxWaves);
        console.log('uids', uids);

        let cmds = [];
        for (let uid in rankInfo.ranks) {
            let award = this._getDailyAward(task.awardType, rankInfo.ranks[uid]);
            let ret = {
                award: award,
                rank: rankInfo.ranks[uid],
            };
            cmds.push(['hset', `${REDISKEY.RANK_DAILY_AWARD}:${task.redisKey}`, uid, JSON.stringify(ret)]);
            if (week && task.isResetReward) {
                let i = uids.indexOf(uid);
                award = this._getWeekAward(task.awardType, { rank: rankInfo.ranks[uid], wave: maxWaves[i] });
                let week_ret = {
                    award: award,
                    rank: rankInfo.ranks[uid],
                    score:maxWaves[i]
                };
                // console.log("======================>",award);
                cmds.push(['hset', `${REDISKEY.RANK_WEEK_AWARD}:${task.redisKey}`, uid, JSON.stringify(week_ret)]);
            }
            // console.log("===================>",cmds);
            if (cmds.length >= task.limit) {
                await dbUtils.redisAccountSync.multiAsync(cmds);
                cmds = [];
            }
        }
        await dbUtils.redisAccountSync.multiAsync(cmds);
    }
}

module.exports = GoddessReward;