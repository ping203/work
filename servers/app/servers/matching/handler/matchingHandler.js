const Handler = require('../../common/hander');
const matchingCmd = require('../../../cmd/matchingCmd');
const matching = require('../../../logic/matching/matching');

class MatchingHandler extends Handler {
    constructor() {
        super();
    }

    request(route, msg, session, next) {
        matching.request(route, msg, session, (err, result)=>{
            super.response(err, result, next);
        })
    }
}

module.exports = function () {
    let req = matchingCmd.request;
    for (let k of Object.keys(req)) {
        MatchingHandler.registe(req[k].route.split('.')[2]);
    }
    return new MatchingHandler();
};