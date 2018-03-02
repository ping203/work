const Cost = require('./cost');
const VietnamCost = require('./vietnamCost');
const versions = require('../../../../utils/imports').versions;

class GamePlay {
    constructor() {
        switch (versions.PUB) {
            case versions.GAMEPLAY.VIETNAM:
                this._cost = new VietnamCost();
                break;
            case versions.GAMEPLAY.LOCAL:
            case versions.GAMEPLAY.WANBA:
                this._cost = new Cost();
                break;
            default:
                break;
        }
    }

    get cost() {
        return this._cost;
    }
}

module.exports = new GamePlay();