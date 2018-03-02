const ObjUtil = require('../utils/ObjUtil');
const ask = require('../../common/logicResponse').ask;

class GameMgmt {

    async cashRequire(data) {
        ObjUtil.checkFields(data, 'cashRequire');
        let ret = require("./temp/gamemgmt/cashRequire").fake1;
        return ask(ret);
    }

    async cashRequireQuery(data) {
        ObjUtil.checkFields(data, 'cashRequireQuery');
        let ret = require("./temp/gamemgmt/cashRequireQuery").fake1;
        return ask(ret);
    }

    async genGiftCode(data) {
        ObjUtil.checkFields(data, 'genGiftCode');
        let ret = require("./temp/gamemgmt/genGiftCode").fake1;
        return ask(ret);
    }

    async getGiftCodeData(data) {
        ObjUtil.checkFields(data, 'getGiftCodeData');
        let ret = require("./temp/gamemgmt/getGiftCodeData").fake1;
        return ask(ret);
    }

    async addBroadcast(data) {
        ObjUtil.checkFields(data, 'addBroadcast');
        let ret = require("./temp/gamemgmt/addBroadcast").fake1;
        return ask(ret);
    }

    async getBroadcast(data) {
        ObjUtil.checkFields(data, 'getBroadcast');
        let ret = require("./temp/gamemgmt/getBroadcast").fake1;
        return ask(ret);
    }

    async cancelBroadcast(data) {
        ObjUtil.checkFields(data, 'cancelBroadcast');
        let ret = require("./temp/gamemgmt/cancelBroadcast").fake1;
        return ask(ret);
    }

    async sendMail(data) {
        ObjUtil.checkFields(data, 'sendMail');
        let ret = require("./temp/gamemgmt/sendMail").fake1;
        return ask(ret);
    }

    async getMailData(data) {
        ObjUtil.checkFields(data, 'getMailData');
        let ret = require("./temp/gamemgmt/getMailData").fake1;
        return ask(ret);
    }

    async delMail(data) {
        ObjUtil.checkFields(data, 'delMail');
        let ret = require("./temp/gamemgmt/delMail").fake1;
        return ask(ret);
    }


}

module.exports = new GameMgmt();