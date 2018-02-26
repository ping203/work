const Handler = require('../../common/hander');
const gateCmd = require('../../../cmd/gateCmd');
const gate = require('../../../logic/gate/gate');

class GateHandler extends Handler{
    constructor() {
        super();
    }

    request(route, msg, session, next) {
        gate.request(route, msg, session, (err, result)=>{
            super.response(err, result, next);
        })
    }
}

module.exports = function () {
    let req = gateCmd.request;
    for(let k of Object.keys(req)){
        GateHandler.registe(req[k].route.split('.')[2]);
    }
    return  new GateHandler();
};