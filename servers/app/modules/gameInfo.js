const logger = require('omelo-logger').getLogger(__filename);




module.exports = function (opts) {
    return new GameInfoModule(opts);
}
module.exports.moduleId = 'gameInfo';
class GameInfoModule {
    constructor(opts) {
        opts = opts || {};
        this.app = opts.app;
        this.type = opts.type || 'pull';
        this.interval = opts.interval || 5;
    }

    monitorHandler(agent, msg) {
        if (this.app.getServerType() !== 'game') {
            logger.error('not support type: %j', agent.id);
            return;
        }
        let game = require('../logic/game/game');
        let loadInfo = game.getLoadInfo();

        agent.notify(module.exports.moduleId, {
            serverId: agent.id,
            playerLoad: loadInfo.playerCount,
            roomLoad: loadInfo.roomCount
        });
    }

    masterHandler(agent, msg) {
        if (!msg) {
            let list = agent.typeMap.game;
            if (!list || list.length === 0) {
                return;
            }
            agent.notifyByType('game', module.exports.moduleId);
            return;
        }

        let data = agent.get(module.exports.moduleId);
        if (!data) {
            data = {};
            agent.set(module.exports.moduleId, data);
        }
        data[msg.serverId] = msg;
    }

    clientHandler(agent, msg, cb) {
        let data = agent.get(module.exports.moduleId);
        let sData = {};
        let list = agent.typeMap.game;
        if(!list || !data){
            cb && cb(null, sData);
            return;
        }
        for (let i = 0; i < list.length; ++i) {
            sData[list[i].id] = data[list[i].id];
        }
        cb && cb(null, sData);
    }
}