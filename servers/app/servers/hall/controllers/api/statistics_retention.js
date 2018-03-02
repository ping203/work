var admin_common = require('./admin_common');
const logicResponse = require('../../../common/logicResponse');

exports.get_retention_data = _get_retention_data;

function _get_retention_data(req, res) {
    myDao.getRetentionData(admin_common.getDataObj(req), function (err, rows) {
        console.log("getRetentionData complete...");
        admin_common.response('获取留存数据', res, err, rows);
    });
}


//==============================================================================
// private
//==============================================================================
