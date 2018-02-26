const omelo = require('omelo');
const async = require('async');
const eventType = require('../../consts/eventType');
const redisKey = require('../../database').dbConsts.REDISKEY;
console.error('----dataSync load dbClient');
const redisClient = require('../../utils/dbclients').redisClient;
const mysqlClient = require('../../utils/dbclients').mysqlClient;
const changeSync = require('./changeSync');
const pumpwater = require('./pumpwater');
const timeSyc = require('./timeSyc');

class DataSync {
    constructor() {
        pumpwater.on(eventType.PLATFORM_DATA_CHANGE, this.platform_data_change.bind(this));
        changeSync.on(eventType.PLATFORM_DATA_CHANGE, this.platform_data_change.bind(this));
        timeSyc.on(eventType.PLATFORM_DATA_CHANGE, this.platform_data_change.bind(this));
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

        pumpwater.start();
        changeSync.start();
        timeSyc.start();

        logger.info('数据同步服启动成功');
    }

    stop() {
        mysqlClient.stop();
        redisClient.stop();
        timeSyc.stop();
    }

    platform_data_change(type, value) {
        redisClient.pub(eventType.PLATFORM_DATA_CHANGE, {
            type: type,
            value: value
        });
    }

}

module.exports = new DataSync();