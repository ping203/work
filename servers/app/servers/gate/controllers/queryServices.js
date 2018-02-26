const omelo = require('omelo');
const dispatcher = require('../../../utils/dispatcher');
const httpCfg = omelo.app.get('http');
const ERROR_OBJ = require('../../../consts/error').ERROR_OBJ;
const logicResponse = require('../../common/logicResponse');

function _getList(uid, enableHttps) {
    const serverInfo = {};

    serverInfo.HTTPS = enableHttps;

    let resource = dispatcher.dispatchEx(uid, httpCfg.resource);
    serverInfo.RESOURCE = {
        address: enableHttps ? resource.http.host : resource.https.host,
        port: enableHttps ? resource.http.port : resource.https.port,
    }

    let hall = dispatcher.dispatchEx(uid, httpCfg.hall);
    serverInfo.HALL = {
        address: enableHttps ? hall.http.host : hall.https.host,
        port: enableHttps ? hall.http.port : hall.https.port,
    }

    let chat = dispatcher.dispatchEx(uid, httpCfg.chat);
    serverInfo.CHAT = {
        address: enableHttps ? chat.http.host : chat.https.host,
        port: enableHttps ? chat.http.port : chat.https.port,
    }

    let game = dispatcher.dispatchEx(uid, httpCfg.game);
    serverInfo.ROOM = {
        address: enableHttps ? game.http.host : game.https.host,
        port: enableHttps ? game.http.port : game.https.port,
    }

    return serverInfo;
}

class QueryServices {
    async lists(data) {
        if(!data.uid || !data.protocol){
            throw ERROR_OBJ.PARAM_MISSING;
        }
        let result = _getList(data.uid, data.protocol == 'https' ? true : false);
        return logicResponse.ask(result);
    }
}

module.exports = new QueryServices();