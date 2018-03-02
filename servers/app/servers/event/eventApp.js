const omelo = require('omelo');
const eventType = require('../../consts/eventType');
const redisKey = require('../../database').dbConsts.REDISKEY;
const redisClient = require('../../utils/dbclients').redisClient;
const mysqlClient = require('../../utils/dbclients').mysqlClient;
const changeSync = require('../../logic/event/changeSync');
const pumpwater = require('../../logic/event/pumpwater');
const timeSyc = require('../../logic/event/timeSyc');

class EventApp {
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

        pumpwater.start();
        changeSync.start();
        timeSyc.start();

        logger.info('数据同步服启动成功');
    }

    stop() {
        mysqlClient.stop();
        redisClient.stop();
        timeSyc.stop();
        logger.info('数据同步服关闭');
    }

    platform_data_change(type, value) {
        redisClient.pub(eventType.PLATFORM_DATA_CHANGE, {
            type: type,
            value: value
        });
    }
}

module.exports = new EventApp();