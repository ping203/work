const _ = require("underscore");
const buzz_cst_sdk = require('../../buzz/cst/buzz_cst_sdk');
const StringUtil = require('../../utils/StringUtil');
const ObjUtil = require('../../buzz/ObjUtil');

let ERROR = 1;
let DEBUG = 0;

const TAG = "【channel】";

exports.getUserInfoByChannelId = getUserInfoByChannelId;
exports.getChannelPrefix = _getChannelPrefix;
exports.getNickname = _getNickname;

/**
 * 使用渠道ID获取用户信息
 */
function getUserInfoByChannelId(pool, field, channel, channel_account_id, cb) {
    const FUNC = TAG + "getUserInfoByChannelId() --- ";
    let sql = "SELECT " + field + " FROM `tbl_account` WHERE `channel_account_id`=? ";
    let sql_data = [channel_account_id];

    pool.query(sql, sql_data, function (err, rows) {
        if (err) {
            logger.error(FUNC + 'err:\n', err);
            logger.error(FUNC + 'sql:\n', sql);
            logger.error(FUNC + 'sql_data:\n', sql_data);
            cb(err);
            return;
        }
        cb(null, rows[0]);
    });
}

function _getNickname(channel_account_info) {
    const FUNC = TAG + "_getNickname() --- ";
    
    channel_account_info = ObjUtil.str2Data(channel_account_info);
    let channel_account_name = null;
    if (channel_account_info != null) {
        if (channel_account_info['name'] != null) {
            channel_account_name = channel_account_info['name'];
        }
    }
    logger.info(FUNC + "channel_account_name: ", channel_account_name);
    return channel_account_name;
}

// 获取渠道前缀
function _getChannelPrefix(data) {
    let channelPrefix = "" + data['channel'];
    // 如果长度为4, 需要查找前缀
    if (StringUtil.strLen(channelPrefix) == 4) {
        channelPrefix = buzz_cst_sdk.CHANNEL[channelPrefix].PREFIX;
    }
    return channelPrefix;
}