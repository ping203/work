const ObjUtil = require('../utils/ObjUtil');
const ask = require('../../common/logicResponse').ask;

class BackMgmt {

    async getOperator(data) {
        ObjUtil.checkFields(data, 'getOperator');
        let ret = require("./temp/backmgmt/getOperator").fake1;
        return ask(ret);
    }

    async addOperator(data) {
        ObjUtil.checkFields(data, 'addOperator');
        let ret = require("./temp/backmgmt/addOperator").fake1;
        return ask(ret);
    }

    async modifyOperatorPassword(data) {
        ObjUtil.checkFields(data, 'modifyOperatorPassword');
        let ret = require("./temp/backmgmt/modifyOperatorPassword").fake1;
        return ask(ret);
    }

    async authSwitch(data) {
        ObjUtil.checkFields(data, 'authSwitch');
        let ret = require("./temp/backmgmt/authSwitch").fake1;
        return ask(ret);
    }

}

module.exports = new BackMgmt();