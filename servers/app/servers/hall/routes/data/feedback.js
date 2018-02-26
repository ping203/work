const data_util = require('./data_util');
const buzz_account = require('../../src/buzz/buzz_account');
const buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
const logger = loggerEx(__filename);
const TAG = "【data/feedback】";

exports.banUser = banUser;

/**
 * 封号.
 * token, uid_list
 */
function banUser(req, res) {
    const FUNC = TAG + "banUser() --- ";
    const HINT = "玩家封号";
    //----------------------------------
    let aes = req.body.aes;
    let dataObj = _parseDataObj(req, HINT);

    buzz_account.banUser(req, dataObj, function (err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 解析请求中的数据格式.
 * @param req 请求对象.
 * @param hint 提示信息.
 */
function _parseDataObj(req, hint) {
    let dataObj = {};

    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        logger.error("msg:", hint + "失败(json解析错误)");
        logger.error("err:", json_parse_err);
    }

    return dataObj;
}