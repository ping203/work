const logger = require('omelo-logger').getLogger(__filename);

module.exports = function (opts) {
    return new Module(opts);
};

module.exports.moduleId = 'matchInfo';

let Module = function (opts) {
    opts = opts || {};
    this.app = opts.app;
    this.type = opts.type || 'pull';
    this.interval = opts.interval || 5;
};

Module.prototype.monitorHandler = function (agent, msg) {
    if (this.app.getServerType() !== 'rankMatch') {
        logger.error('not support type: %j', agent.id);
        return;
    }
    let rankMatchApp = require('../servers/rankmatch/rankMatchApp');
    let loadInfo = rankMatchApp.getLoadInfo();
    agent.notify(module.exports.moduleId, {
        serverId: agent.id,
        load: loadInfo
    });
};

Module.prototype.masterHandler = function (agent, msg) {
    if (!msg) {
        let list = agent.typeMap['rankMatch'];
        if (!list || list.length === 0) {
            return;
        }
        agent.notifyByType('rankMatch', module.exports.moduleId);
        return;
    }
    let data = agent.get(module.exports.moduleId);
    if (!data) {
        data = {};
        agent.set(module.exports.moduleId, data);
    }
    data[msg.serverId] = msg;
};

Module.prototype.clientHandler = function (agent, msg, cb) {
    cb && cb(null, agent.get(module.exports.moduleId));
};