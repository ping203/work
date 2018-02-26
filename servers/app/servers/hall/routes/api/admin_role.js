﻿//==============================================================================
// import
//==============================================================================
var admin_common = require('./admin_common');


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

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

////////////////////////////////////////
function _add(req, res) {
    myDao.addRole(admin_common.getDataObj(req), function (err, rows) {
        console.log("addRole complete...");
        admin_common.response('添加角色', res, err, rows);
    });
}

////////////////////////////////////////
function _delete(req, res) {
    myDao.deleteRole(admin_common.getDataObj(req), function (err, rows) {
        console.log("deleteRole complete...");
        admin_common.response('禁止角色', res, err, rows);
    });
}

////////////////////////////////////////
function _valid(req, res) {
    myDao.validRole(admin_common.getDataObj(req), function (err, rows) {
        console.log("validRole complete...");
        admin_common.response('激活角色', res, err, rows);
    });
}

////////////////////////////////////////
function _edit(req, res) {
    myDao.editRole(admin_common.getDataObj(req), function (err, rows) {
        console.log("editRole complete...");
        admin_common.response('修改角色', res, err, rows);
    });
}