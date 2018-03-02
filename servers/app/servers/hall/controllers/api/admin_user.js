//==============================================================================
// import
//==============================================================================
var admin_common = require('./admin_common');
const logicResponse = require('../../../common/logicResponse');

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.add = _add;
exports.delete = _delete;
exports.valid = _valid;
exports.edit = _edit;
exports.signin = _signin;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

////////////////////////////////////////
function _add(req, res) {
    myDao.addUser(admin_common.getDataObj(req), function (err, rows) {
        console.log("addUser complete...");
        admin_common.response('添加用户', res, err, rows);
    });
}

////////////////////////////////////////
function _delete(req, res) {
    myDao.deleteUser(admin_common.getDataObj(req), function (err, rows) {
        console.log("deleteUser complete...");
        admin_common.response('禁止用户', res, err, rows);
    });
}

////////////////////////////////////////
function _valid(req, res) {
    myDao.validUser(admin_common.getDataObj(req), function (err, rows) {
        console.log("validUser complete...");
        admin_common.response('激活用户', res, err, rows);
    });
}

////////////////////////////////////////
function _edit(req, res) {
    myDao.editUser(admin_common.getDataObj(req), function (err, rows) {
        console.log("editUser complete...");
        admin_common.response('修改用户', res, err, rows);
    });
}

////////////////////////////////////////
function _signin(req, res) {
    myDao.userSignin(admin_common.getDataObj(req), function (err, rows) {
        console.log("editUser complete...");
        admin_common.response('用户登录', res, err, rows);
    });
}



//==============================================================================
// private
//==============================================================================
