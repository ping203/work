const logicResponse = require('../../../common/logicResponse');

exports.get_retention_data = _get_retention_data;

async function _get_retention_data(data) {
    return new Promise(function (resolve, reject) {
        myDao.getRetentionData(data, function (err, results) {
            if (err) {
                logger.error('获取留存数据 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}


//==============================================================================
// private
//==============================================================================