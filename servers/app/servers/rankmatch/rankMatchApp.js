const omelo = require('omelo');
const redisClient = require('../../utils/dbclients').redisClient;
const mysqlClient = require('../../utils/dbclients').mysqlClient;
const GAME_TYPE = require('../../utils/imports').sysConfig.GAME_TYPE;
const plugins = require('../../logic/plugins');

class MatchingApp {
    constructor(){
        this._instance = new plugins[GAME_TYPE].MatchRankInstance();
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
        omelo.app.rankMatch = this;
        this._instance.start();
        logger.info('排位赛比赛服启动成功');
    }

    stop() {
        this._instance.stop();
        redisClient.stop();
        mysqlClient.stop();
        logger.info('排位赛比赛服关闭');
    }

    remoteRpc(method, data, cb) {
        this._instance.remoteRpc(method, data, cb);
    }

    getLoadInfo() {
        this._instance.getLoadStatistics();
    }
}

module.exports = new MatchingApp();