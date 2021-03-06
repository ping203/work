const dispatcher = require('./dispatcher');

let routeUtil = module.exports;

routeUtil.chatRoute = function(session, msg, app, cb) {
    let chatServers = app.getServersByType('chat');
    if(!chatServers || chatServers.length === 0) {
        cb(new Error('can not find chat servers.'));
        return;
    }
    let res = dispatcher.dispatchEx(session.get('rid'), chatServers);
    cb(null, res.id);
};

routeUtil.gameRoute = function (session, msg, app, cb) {
    let games = app.getServersByType('game');
    if(!games || games.length === 0) {
        cb(new Error('can not find game servers.'));
        return;
    }

    let res = dispatcher.dispatchEx(session.uid, games);
    cb(null, res.id);


    // if(typeof session.get === 'function'){
    //     cb(null, session.get('gameSid'));
    // }
    // else{
    //     cb(null, session.gameSid);
    // }

};

routeUtil.rankMatchRoute = function (session, msg, app, cb) {
    if(typeof session.get === 'function'){
        cb(null, session.get('rankMatchSid'));
    }
    else{
        cb(null, session.rankMatchSid);
    }
};

