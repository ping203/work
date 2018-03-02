const ObjUtil = require('../utils/ObjUtil');
const ask = require('../../common/logicResponse').ask;

class Operation {

    async getChangeLog(data) {
        ObjUtil.checkFields(data, 'getChangeLog');
        let ret = require("./temp/operation/getChangeLog").fake1;
        return ask(ret);
    }

    async confirmChange(data) {
        ObjUtil.checkFields(data, 'confirmChange');
        let ret = require("./temp/operation/confirmChange").fake1;
        return ask(ret);
    }

    async cancelChange(data) {
        ObjUtil.checkFields(data, 'cancelChange');
        let ret = require("./temp/operation/cancelChange").fake1;
        return ask(ret);
    }

    async queryJackpot(data) {
        ObjUtil.checkFields(data, 'queryJackpot');
        let ret = require("./temp/operation/queryJackpot").fake1;
        return ask(ret);
    }

    async queryServerPeriod(data) {
        ObjUtil.checkFields(data, 'queryServerPeriod');
        let ret = require("./temp/operation/queryServerPeriod").fake1;
        return ask(ret);
    }

    async queryPlayer(data) {
        ObjUtil.checkFields(data, 'queryPlayer');
        let ret = require("./temp/operation/queryPlayer").fake1;
        return ask(ret);
    }

    async getCashData(data) {
        ObjUtil.checkFields(data, 'getCashData');
        let ret = require("./temp/operation/getCashData").fake1;
        return ask(ret);
    }

    async getProfitChart(data) {
        ObjUtil.checkFields(data, 'getProfitChart');
        let ret = require("./temp/operation/getProfitChart").fake1;
        return ask(ret);
    }

    async changeCatchRate(data) {
        ObjUtil.checkFields(data, 'changeCatchRate');
        let ret = require("./temp/operation/changeCatchRate").fake1;
        return ask(ret);
    }

    async changeQueryServerPeriod(data) {
        ObjUtil.checkFields(data, 'changeQueryServerPeriod');
        let ret = require("./temp/operation/changeQueryServerPeriod").fake1;
        return ask(ret);
    }

    async getPlayerData(data) {
        ObjUtil.checkFields(data, 'getPlayerData');
        let ret = require("./temp/operation/getPlayerData").fake1;
        return ask(ret);
    }

    async modifyPlayerData(data) {
        ObjUtil.checkFields(data, 'modifyPlayerData');
        let ret = require("./temp/operation/modifyPlayerData").fake1;
        return ask(ret);
    }
    
    async getFireData(data) {
        ObjUtil.checkFields(data, 'getFireData');
        let ret = require("./temp/operation/getFireData").fake1;
        return ask(ret);
    }

}

module.exports = new Operation();