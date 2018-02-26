var logger = require('omelo-logger').getLogger(__filename);

module.exports = function(opts) {
    return new Module(opts);
};

module.exports.moduleId = 'onlineUser';

var Module = function(opts) {
    opts = opts || {};
    this.app = opts.app;
    this.type = opts.type || 'pull';
    this.interval = opts.interval || 5;
};

Module.prototype.monitorHandler = function(agent, msg) {
    var connectionService = this.app.components.__connection__;
    if(!connectionService) {
        logger.error('not support connection: %j', agent.id);
        return;
    }

    let statisticsInfo = connectionService.getStatisticsInfo();
    agent.notify(module.exports.moduleId, {
        serverId:statisticsInfo.serverId,
        totalConnCount:statisticsInfo.totalConnCount,
        loginedCount:statisticsInfo.loginedCount,
    });
};

Module.prototype.masterHandler = function(agent, msg) {
    if(!msg) {
        var list = agent.typeMap['connector'];
        if(!list || list.length === 0) {
            return;
        }
        agent.notifyByType('connector', module.exports.moduleId);
        return;
    }

    var data = agent.get(module.exports.moduleId);
    if(!data) {
        data = {};
        agent.set(module.exports.moduleId, data);
    }

    data[msg.serverId] = msg;
};

Module.prototype.clientHandler = function(agent, msg, cb) {
    cb && cb(null, agent.get(module.exports.moduleId));
};
