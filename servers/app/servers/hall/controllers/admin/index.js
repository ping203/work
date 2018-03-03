const buzz_admin_utils = require('../../src/buzz/buzz_admin_utils');
const buzz_cst_admin = require('../../src/buzz/cst/buzz_cst_admin');
const logicResponse = require('../../../common/logicResponse');
const _ = require('underscore');

function _makeVar() {
    var TXT_EN = buzz_cst_admin.TXT_SIDEBAR_EN;
    var TXT_CN = buzz_cst_admin.TXT_SIDEBAR_CN;
    var data = TXT_CN;

    data = _.extend(data, {
        title: 'Dashboard',
        expanded_id: 'menu_dashboard'
    });
    console.log(data.title);
    return data;
}

let exp = module.exports;
exp.get = async function (data) {
    return logicResponse.askEjs('admin/pages-signin', {
        title: 'Admin Signin'
    });
};
/* POST: 需要验证token, 决定用户的访问权限. */
exp.post = async function (data) {
    return new Promise(function (resolve, reject) {
        buzz_admin_utils.checkTokenPost({
            body: data
        }, function (err, user_auth, user_info) {
            if (err) {
                logger.error('管理员页面 err:', err);
                reject(err);
            }
            // 处理页面权限
            let data = _makeVar();
            let extend_user_info = {
                user_auth: user_auth,
                user_name: user_info['uname'],
                user_role: user_info['role_name']
            };
            data = _.extend(data, extend_user_info);
            resolve(logicResponse.askEjs("admin/index", data));
        });
    });
};