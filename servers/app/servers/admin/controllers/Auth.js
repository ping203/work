const _ = require('underscore');
const omelo = require('omelo');
const ERROR_OBJ = require('../../../consts/error').ERROR_OBJ;
const ObjUtil = require('../utils/ObjUtil');
const AUTH_CONFIG = require('../configs/auth');
const ROLE_CONFIG = require('../configs/role');
const SQL_CONFIG = require('../configs/sql');
const askEjs = require('../../common/logicResponse').askEjs;

class Auth {
    async login(data) {
        ObjUtil.checkFields(data, 'login');
        let result = await ObjUtil.query(SQL_CONFIG.getAccountByUname, [data.username]);
        let account = result[0];
        let encodePwd = ObjUtil.encodePwd(account.salt, data.password);
        if (encodePwd == account.password) {
            let role = ROLE_CONFIG[account.role];
            let data = {};
            let locals = require('../configs/locals/en-US');
            data = _.extend(data, locals);
            return askEjs(role.sidebar, data);
        } else {
            throw ERROR_OBJ.USERNAME_OR_PASSWORD_ERROR;
        }
    }
}

module.exports = new Auth();