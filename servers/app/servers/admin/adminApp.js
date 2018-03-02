const omelo = require('omelo');
const redisClient = require('../../utils/database').redisClient;
const mysqlClient = require('../../utils/database').mysqlClient;

//后台管理服务
class AdminApp{
    constructor(){}

    async start(){
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

        logger.info('管理后台服务启动成功');
    }

    stop(){
        logger.info('管理后台服务已经停止');
    }
}

module.exports = new AdminApp();