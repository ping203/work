const hall = require('../plugins');
const plugins = require('../plugins');
const omelo = require('omelo');
const redisClient = require('../../utils/dbclients').redisClient;
const mysqlClient = require('../../utils/dbclients').mysqlClient;
const GAME_TYPE = require('../../utils/imports').sysConfig.GAME_TYPE;
class RankMatch {
    constructor() {
    }

    async start() {
        let result = await redisClient.start(omelo.app.get('redis'));
        if (!result) {
            process.exit(0);
            return;
        }
        result = await mysqlClient.start(omelo.app.get('mysql'));
        if (!result) {
            process.exit(0);
            return;
        }
        this._instance = new plugins[GAME_TYPE].MatchRankInstance();
        this._instance.start();
        logger.info('排位赛比赛服启动成功');
    }

    stop() {
        this._instance.stop();
    }

    remoteRpc(method, data, cb) {
        this._instance.remoteRpc(method, data, cb);
    }

    getLoadInfo() {
        return this._instance.getLoadStatistics();
    }

}

module.exports = new RankMatch();