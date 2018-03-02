const logicResponse = require('../../../common/logicResponse');
var buzz_admin_utils = require('../../src/buzz/buzz_admin_utils');
var buzz_cst_admin = require('../../src/buzz/cst/buzz_cst_admin');
var buzz_cst_gm_active = require('../../src/buzz/cst/buzz_cst_gm_active');
var active_cdkey_cfg = require('../../../../utils/imports').GAME_CFGS.active_cdkey_cfg;

var _ = require('underscore');

function _makeVar() {
    var TXT_EN = buzz_cst_admin.TXT_SIDEBAR_EN;
    TXT_EN = _.extend(TXT_EN, buzz_cst_gm_active.TXT_CONTENT_EN);
    
    var TXT_CN = buzz_cst_admin.TXT_SIDEBAR_CN;
    TXT_CN = _.extend(TXT_CN, buzz_cst_gm_active.TXT_CONTENT_CN);
    
    var data = TXT_CN;
    
    data = _.extend(data, { title: 'Data', expanded_id: 'menu_game_mgmt' });
    //data = _.extend(data, { action_list : [{ id: 1, description: '111' }, { id: 2, description: '222' }] });
    data.action_list = active_cdkey_cfg;
    console.log("data: ", data);
    return data;
}

let exp = module.exports;
exp.get = async function (data) {
    return logicResponse.askEjs('admin/pages-gm-active', _makeVar());
};

exp.post = async function (data) {
    return new Promise(function (resolve, reject) {
        buzz_admin_utils.checkTokenPost({
            body: data
        }, function (err, user_auth) {
            if (err) {
                logger.error('pages-gm-active err:', err);
                reject(err);
            }
            var params = _makeVar();
            params = _.extend(params, { user_auth: user_auth });
            resolve(logicResponse.askEjs("admin/pages-gm-active", params));
        });
    });
};