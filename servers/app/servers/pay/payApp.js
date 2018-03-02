
const RedisUtil = require('./src/utils/RedisUtil');
const dao = require('./src/dao/dao');

class HallApp {

    start() {
        this._loadInitData();
    }

    stop() {

    }

    _loadInitData() {
        global.mysqlPool = mysqlConnector;
        global.myDao = dao.withDbPool();
        RedisUtil.init(redisConnector.cmd, redisConnector.pubCmd, redisConnector.subCmd);

    }
}

module.exports = new HallApp();