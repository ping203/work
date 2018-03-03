const ObjUtil = require('../utils/ObjUtil');
const ask = require('../../common/logicResponse').ask;

class Statistics {

    async realData(data) {
        ObjUtil.checkFields(data, 'realData');
        let ret = require("./temp/statistics/realData").fake2;
        return ask(ret);
    }

    async retentionData(data) {
        ObjUtil.checkFields(data, 'retentionData');
        let ret = require("./temp/statistics/retentionData").fake1;
        return ask(ret);
    }

    async topupData(data) {
        ObjUtil.checkFields(data, 'topupData');
        let ret = require("./temp/statistics/topupData").fake1;
        return ask(ret);
    }

    async topupLog(data) {
        ObjUtil.checkFields(data, 'topupLog');
        let ret = require("./temp/statistics/topupLog").fake1;
        return ask(ret);
    }

    async topupChart(data) {
        logger.info('-------------------------------------========================');
        ObjUtil.checkFields(data, 'topupChart');
        let ret = require("./temp/statistics/topupChart").fake1;
        return ask(ret);
    }
}

module.exports = new Statistics();