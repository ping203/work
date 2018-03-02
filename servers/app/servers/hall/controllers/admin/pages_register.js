const logicResponse = require('../../../common/logicResponse');
var buzz_admin_utils = require('../../src/buzz/buzz_admin_utils');
var buzz_cst_admin = require('../../src/buzz/cst/buzz_cst_admin');
var buzz_cst_admin_register = require('../../src/buzz/cst/buzz_cst_admin_register');
var _ = require('underscore');

function _makeVar() {
    var TXT_EN = buzz_cst_admin.TXT_SIDEBAR_EN;
    TXT_EN = _.extend(TXT_EN, buzz_cst_admin_register.TXT_CONTENT_EN);
    
    var TXT_CN = buzz_cst_admin.TXT_SIDEBAR_CN;
    TXT_CN = _.extend(TXT_CN, buzz_cst_admin_register.TXT_CONTENT_CN);
    
    var data = TXT_CN;
    
    data = _.extend(data, { title: 'Register', expanded_id: 'menu_statistics' });
    return data;
}

let exp = module.exports;
exp.get = async function (data) {
    var data = _makeVar();
    data = _.extend(data, { user_auth: {} });
    return logicResponse.askEjs('admin/pages-register', data);
};
/* POST: 需要验证token, 决定用户的访问权限. */
exp.post = async function (data) {
    return new Promise(function (resolve, reject) {
        buzz_admin_utils.checkTokenPost({
            body: data
        }, function (err, user_auth) {
            if (err) {
                logger.error('pages-register err:', err);
                reject(err);
            }
            var params = _makeVar();
            params = _.extend(params, { user_auth: user_auth });
            resolve(logicResponse.askEjs("admin/pages-register", params));
        });
    });
};
