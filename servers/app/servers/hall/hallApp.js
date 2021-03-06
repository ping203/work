const fs = require('fs');
const buzz_redis = require('./src/buzz/buzz_redis');
const RedisUtil = require('./src/utils/RedisUtil');
const rankCache = require('./src/rankCache/rankCache');
const DaoMail = require('./src/dao/dao_mail');
const path = require('path');
const DaoOperation = require('./src/dao/dao_operation');
const DaoChange = require('./src/dao/dao_change');
const CacheOperation = require('./src/buzz/cache/CacheOperation');
const CacheChange = require('./src/buzz/cache/CacheChange');
const CacheMail = require('./src/buzz/cache/CacheMail');
const DropRecord = require('./src/buzz/pojo/DropRecord');
const dao_activity = require('./src/dao/dao_activity');
const routes = require('./routes/index');
const common_mathadjust_const_cfg = require('../../utils/imports').GAME_CFGS.common_mathadjust_const_cfg;
const Global = require('./src/buzz/pojo/Global');
const logger = loggerEx(__filename);
const dao = require('./src/dao/dao');
const omelo = require('omelo');
const redisClient = require('../../utils/dbclients').redisClient;
const mysqlClient = require('../../utils/dbclients').mysqlClient;

class HallApp {

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
        this._loadInitData();
        logger.info('大厅服务启动成功');
    }

    stop() {
        redisClient.stop();
        mysqlClient.stop();
        logger.info('大厅服务关闭');
    }

    _loadInitData() {
        global.mysqlPool = mysqlConnector;
        global.myDao = dao.withDbPool();

        RedisUtil.init(redisConnector.cmd, redisConnector.pubCmd, redisConnector.subCmd);
        buzz_redis.addListener();
        rankCache.run();
        DaoMail.loadMail(mysqlConnector, function () {
            logger.info('[MYSQL] 邮件数据从数据库加载到缓存成功, 共加载邮件数据%d条', CacheMail.length());
        });

        DaoOperation.loadAll(mysqlConnector, function () {
            logger.info('[MYSQL] 共加载%d条运营配置数据', CacheOperation.length());
        });

        DaoChange.loadAll(mysqlConnector, function () {
            logger.info('[MYSQL] 共加载%d条实物兑换数据', CacheChange.length());
        });
        DropRecord.init(mysqlConnector);
        dao_activity.updateGift(mysqlConnector, function () {
            logger.info('updateGift');
        });

        Global.pumpBegin(
            mysqlConnector,
            common_mathadjust_const_cfg.time1 * 1000,
            common_mathadjust_const_cfg.time2 * 1000,
            common_mathadjust_const_cfg.time3 * 1000,
            common_mathadjust_const_cfg.extract,
            common_mathadjust_const_cfg.addvalue,
            common_mathadjust_const_cfg.reducevalue
        );
    }

    uncaughtException() {
        let admin_server = require('./routes/api/admin_server');
        admin_server.shutdownWithCrash(mysqlConnector);
    }
}

module.exports = new HallApp();