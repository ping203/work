const omelo = require('omelo');
const managerCmd = require('../../cmd/managerCmd');
const redisClient = require('../../utils/dbclients').redisClient;
const mysqlClient = require('../../utils/dbclients').mysqlClient;

class GateApp {
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

        logger.info('网关服务启动成功');
    }

    stop() {
        redisClient.stop();
        mysqlClient.stop();
        logger.info('网关服务已经停止');
    }

    request(route, msg, session, cb){
        this[route](msg, session, cb);
    }

    queryEntry(msg, session, cb){
        omelo.app.rpc.manager.managerRemote[managerCmd.remote.getGameServer.route](session, function(err, serverInfo){
            if(err){
                utils.invokeCallback(cb, null, answer.respNoData(err));
                return;
            }
            utils.invokeCallback(cb, null, serverInfo)
        });
    }
}

module.exports = new GateApp();