const omelo = require('omelo');
const redisClient = require('../../utils/dbclients').redisClient;
const mysqlClient = require('../../utils/dbclients').mysqlClient;
const payApp = require('../../servers/pay/payApp');

class Pay {
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

        payApp.start();
        logger.info('支付服务启动成功');
    }

    stop() {
        payApp.stop();
        redisClient.stop();
        mysqlClient.stop();
        logger.info('支付服务关闭');
    }
}

module.exports = new Pay();

