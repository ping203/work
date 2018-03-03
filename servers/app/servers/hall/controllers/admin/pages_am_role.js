const logicResponse = require('../../../common/logicResponse');
var buzz_admin_utils = require('../../src/buzz/buzz_admin_utils');
var buzz_cst_admin = require('../../src/buzz/cst/buzz_cst_admin');
var buzz_cst_am_role = require('../../src/buzz/cst/buzz_cst_am_role');
var _ = require('underscore');

function _makeVar() {
    var TXT_EN = buzz_cst_admin.TXT_SIDEBAR_EN;
    TXT_EN = _.extend(TXT_EN, buzz_cst_am_role.TXT_CONTENT_EN);

    var TXT_CN = buzz_cst_admin.TXT_SIDEBAR_CN;
    TXT_CN = _.extend(TXT_CN, buzz_cst_am_role.TXT_CONTENT_CN);

    var data = TXT_CN;

    data = _.extend(data, {
        title: 'Role Mgmt',
        expanded_id: 'menu_back_mgmt'
    });
    return data;
}

function _getRoleList(cb) {
    // TODO: 查询数据库获取数据(需要变为回调形式)
    myDao.getRoleList({
        pool: global.mysqlPool
    }, function (err, rows) {
        if (err) {
            //res.success({ type: 1, msg: '更新玩家金币数据失败', err: '' + err });
        } else {
            logger.info("role_list:", rows);
            cb(rows);
        }
    });
}

let exp = module.exports;
exp.get = async function (data) {
    return new Promise(function (resolve, reject) {
        let params = _makeVar();
        _getRoleList(function (rows) {
            params = _.extend(params, {
                role_list: rows
            });
            resolve(logicResponse.askEjs('admin/pages-am-role', params));
        });
    });
};

/* POST: 需要验证token, 决定用户的访问权限. */
exp.post = async function (data) {
    return new Promise(function (resolve, reject) {
        buzz_admin_utils.checkTokenPost({
            body: data
        }, function (err, user_auth) {
            if (err) {
                logger.error('pages-am-role err:', err);
                reject(err);
            }
            var params = _makeVar();
            params = _.extend(params, {
                user_auth: user_auth
            });

            _getRoleList(function (rows) {
                params = _.extend(params, {
                    role_list: rows
                });
                resolve(logicResponse.askEjs("admin/pages-am-role", params));
            });

        });
    });
};