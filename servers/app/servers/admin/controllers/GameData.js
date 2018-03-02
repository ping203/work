const ObjUtil = require('../utils/ObjUtil');
const ask = require('../../common/logicResponse').ask;

class GameData {

    async goldData(data) {
        ObjUtil.checkFields(data, 'goldData');
        let ret = require("./temp/gamedata/goldData").fake1;
        return ask(ret);
    }

    async loginLog(data) {
        ObjUtil.checkFields(data, 'loginLog');
        let ret = require("./temp/gamedata/loginLog").fake1;
        return ask(ret);
    }

    async playerData(data) {
        ObjUtil.checkFields(data, 'playerData');
        let ret = require("./temp/gamedata/playerData").fake1;
        return ask(ret);
    }

    async freezePlayer(data) {
        ObjUtil.checkFields(data, 'freezePlayer');
        let ret = require("./temp/gamedata/freezePlayer").fake1;
        return ask(ret);
    }

    async activityLog(data) {
        ObjUtil.checkFields(data, 'activityLog');
        let ret = require("./temp/gamedata/activityLog").fake1;
        return ask(ret);
    }

    async goldLog(data) {
        ObjUtil.checkFields(data, 'goldLog');
        let ret = require("./temp/gamedata/goldLog").fake1;
        return ask(ret);
    }

    async itemLog(data) {
        ObjUtil.checkFields(data, 'itemLog');
        let ret = require("./temp/gamedata/itemLog").fake1;
        return ask(ret);
    }
}

module.exports = new GameData();