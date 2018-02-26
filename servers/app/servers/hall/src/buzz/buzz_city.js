/**
 * 设置城市
 * Created by zhenghang on 2017/9/21.
 */
const BuzzUtil = require('../utils/BuzzUtil');
const DaoCommon = require('../dao/dao_common');
const CacheAccount = require('./cache/CacheAccount');
const logger = loggerEx(__filename);
const TAG = "【buzz_city】";

exports.setCity = setCity;

function setCity(req, dataObj, cb) {
    const FUNC = TAG + "setCity() --- ";
    if (!lPrepare(dataObj)) return;

    _setCity(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'city'], "buzz_city", cb);
    }
}

function _setCity(req, dataObj, cb) {
    const FUNC = TAG + "_setCity() --- ";
    let pool = req.pool;
    let token = dataObj.token;
    let city = dataObj.city;
    logger.info(FUNC + "dataObj:");
    DaoCommon.checkAccount(pool, token, function (err, account) {
        if (err) {
            cb(err);
            return;
        }
        CacheAccount.setCity(account.id, city);
        cb(null, []);
    });
}