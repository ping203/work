const omelo = require('omelo');
const dispatcher = require('../../../utils/dispatcher');
const httpCfg = omelo.app.get('http');
const ERROR_OBJ = require('../../../consts/error').ERROR_OBJ;
const logicResponse = require('../../common/logicResponse');

function _getList(uid, protocol) {
    const serverInfo = {};
    let enable = protocol == 'https' ? true : false;

    serverInfo.PROTOCOL = protocol;

    let resource = dispatcher.dispatchEx(uid, httpCfg.resource);
    serverInfo.RESOURCE = {
        address: enable ? resource.https.host : resource.http.host,
        port: enable ? resource.https.port : resource.http.port,
    };

    let hall = dispatcher.dispatchEx(uid, httpCfg.hall);
    serverInfo.HALL = {
        address: enable ? hall.https.host : hall.http.host,
        port: enable ? hall.https.port : hall.http.port,
    };

    let chat = dispatcher.dispatchEx(uid, httpCfg.chat);
    serverInfo.CHAT = {
        address: enable ? chat.https.host : chat.http.host,
        port: enable ? chat.https.port : chat.http.port,
    };

    let games = omelo.app.getServersByType('game');
    let game = dispatcher.dispatchEx(uid, games);
    serverInfo.ROOM = {
        address: game.clientHost,
        port: game.clientPort,
    };

    return serverInfo;
}

class QueryServices {
    async lists(data) {
        if(!data.token || !data.protocol){
            throw ERROR_OBJ.PARAM_MISSING;
        }
        let result = _getList(data.uid, data.protocol);
        return logicResponse.ask(result);
    }
}

module.exports = new QueryServices();