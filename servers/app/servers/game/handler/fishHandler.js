const Handler = require('../../common/hander');
const fishCmd = require('../../../cmd/fishCmd');
const game = require('../../../logic/game/game');

class FishHandler extends Handler{
    constructor(){
        super();
    }

    request(route, msg, session, next) {
        game.request(route, msg, session, (err, result)=>{
            super.response(err, result, next);
        })
    }
}

module.exports = function () {
    let req = fishCmd.request;
    for(let k of Object.keys(req)){
        FishHandler.registe(req[k].route.split('.')[2]);
    }
    return new FishHandler();
};


