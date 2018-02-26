const RankHall = require('./hall');

class RankMatchInstance {
    constructor() {
        this._rankHall = new RankHall();
    }

    start() {
        this._rankHall.start();
    }

    stop() {
        this._rankHall.stop();
    }

    getLoadStatistics() {
        return {
            roomCount: this._rankHall.roomCount
        }
    }

    remoteRpc(method, data, cb) {
        this._rankHall.remoteRpc(method, data, cb);
    }

}

module.exports = RankMatchInstance;