const _ = require('underscore');
const CommonUtil = require('./CommonUtil');
const ObjUtil = require('./ObjUtil');
const ArrayUtil = require('../utils/ArrayUtil');
const CstError = require('./cst/buzz_cst_error');
const RedisUtil = require('../utils/RedisUtil');
const BuzzUtil = require('../utils/BuzzUtil');
const redisKeys = require('../../../../database').dbConsts.REDISKEY;
const buzz_cst_sdk = require('./cst/buzz_cst_sdk');
const buzz_sdk_tencent = require('./sdk/tencent');
const CacheAccount = require('./cache/CacheAccount');
const ERROR_OBJ = CstError.ERROR_OBJ;
const logger = loggerEx(__filename);

const TAG = "【buzz_friends】";

exports.getAppFriends = getAppFriends;
exports.addFriend = addFriend;
exports.delFriend = delFriend;
//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 获取游戏好友列表
 */
function getAppFriends(req_client, data, cb) {
    // 1. 参数验证
    if (!_prepare(data, cb)) return;

    _callFriendsApi(data, req_client, cb);
}

function _prepare(data, cb) {
    const FUNC = TAG + "_prepare() --- ";
    logger.info(FUNC + "data:", data);

    let channelid = data["channelid"];
    let openid = data["openid"];
    let openkey = data["openkey"];
    let zoneid = data["zoneid"];


    if (!CommonUtil.isParamExist("buzz_friends", channelid, "接口调用请传参数channelid(渠道ID, 用于选择渠道参数)", cb)) return false;
    if (channelid == buzz_cst_sdk.CHANNEL_ID.WANBA) {
        if (!CommonUtil.isParamExist("buzz_friends", openid, "接口调用请传参数openid(玩家在平台的唯一标识)", cb)) return false;
        if (!CommonUtil.isParamExist("buzz_friends", openkey, "接口调用请传参数openkey(玩家身份验证)", cb)) return false;
        if (!CommonUtil.isParamExist("buzz_friends", zoneid, "接口调用请传参数zoneid(Android-1, iOS-2)", cb)) return false;
    }
    else {
        // do nothing
    }

    return true;

}

function _callFriendsApi(data, req_client, cb) {

    let channelid = data["channelid"];

    if (channelid == buzz_cst_sdk.CHANNEL_ID.WANBA) {
        buzz_sdk_tencent.callFriendsApi(data, req_client, cb);
    }
    //TODO 白鹭SDK
    else {
        // do nothing
    }
}

function addFriend(req, dataObj, cb) {
    const FUNC = TAG + "give_reward() --- ";
    if (!lPrepare(dataObj)) return;
    //BuzzUtil.cacheLinkDataApi(dataObj, "addFriend");

    _addFriend1(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'type', 'id'], "buzz_friends", cb);
    }
}

/**
 * 使用有序集合处理
 * @param req
 * @param dataObj
 * @param cb
 * @private
 */
function _addFriend1(req, dataObj, cb) {
    const FUNC = TAG + "_addFriend() --- ";
    logger.info(FUNC + "dataObj:",dataObj);
    let id = dataObj.id;
    let uid = dataObj.token.split("_")[0];
    RedisUtil.zrem(`${redisKeys.MSG.ASK_FRIEND}_${uid}`, id);
    //拒绝添加好友
    if (dataObj.type == 1) {
        cb(null, "success");
        return;
    }
    //查看用户好友信息
    let tmp = [
        ['hget', redisKeys.UID_QQ_FRIEND, uid],
        ['hget', redisKeys.UID_GAME_FRIEND, uid],
        //['hget', redisKeys.UID_QQ_FRIEND, id],
        ['hget', redisKeys.UID_GAME_FRIEND, id],
        ['hget', redisKeys.UID_VIP, uid],
        ['hget', redisKeys.UID_VIP, id]
    ];
    RedisUtil.multi(tmp, function (err, replies) {
        if (err) {
            logger.error(FUNC + "err:", err);
            cb(err);
            return;
        }
        let c_friend = replies[0] && JSON.parse(replies[0]) || [];
        let g_friend = replies[1] && JSON.parse(replies[1]) || [];
        //let c_friend1 = replies[2] && JSON.parse(replies[2]) || [];
        let g_friend1 = replies[2] && JSON.parse(replies[2]) || [];
        let myvip = replies[3] && JSON.parse(replies[3]) || 0;
        let yourvip = replies[4] && JSON.parse(replies[4]) || 0;
        let myFrindCount = g_friend.length;
        let yourFrindCount = g_friend1.length;
        if (ArrayUtil.contain(c_friend, id) || ArrayUtil.contain(g_friend, id)) {
            cb("已经是好友");
        }
        else if(BuzzUtil.getMaxFriendNum(myvip)<=myFrindCount){
            cb("好友已经达到上限,请提升vip等级");
        }
        else if(BuzzUtil.getMaxFriendNum(yourvip)<=yourFrindCount){
            cb("对方好友满了");
        }
        else {
            g_friend.push(id);
            g_friend1.push(uid);
            RedisUtil.hset(redisKeys.UID_GAME_FRIEND, id, ObjUtil.data2String(g_friend1));
            RedisUtil.hset(redisKeys.UID_GAME_FRIEND, uid, ObjUtil.data2String(g_friend));
            
            CacheAccount.setCharmPointWithFriendChange(uid);
            CacheAccount.setCharmPointWithFriendChange(id);

            logger.info(FUNC + "game_friends:", g_friend);
            cb(null, "success");
        }
    });
}

function delFriend(req, dataObj, cb) {
    const FUNC = TAG + "delFriend() --- ";
    if (!lPrepare(dataObj)) return;
    //BuzzUtil.cacheLinkDataApi(dataObj, "addFriend");

    _delFriend(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'id'], "buzz_friends", cb);
    }
}

function _delFriend(req, dataObj, cb) {
    const FUNC = TAG + "_delFriend() --- ";
    logger.info(FUNC + "CALL...");
    let id = dataObj.id;
    let uid = dataObj.token.split("_")[0];

    //查看用户好友信息
    let tmp = [
        ['hget', redisKeys.UID_GAME_FRIEND, uid],
        ['hget', redisKeys.UID_GAME_FRIEND, id]
    ];
    RedisUtil.multi(tmp, function (err, replies) {
        if (err) {
            logger.error(FUNC + "err:", err);
            cb(err);
            return;
        }
        let me = replies[0] && JSON.parse(replies[0]);
        let he = replies[1] && JSON.parse(replies[1]);
        if (me) {
            let myFrindCount = me.length;
            ArrayUtil.removeByValue(me, id);
            logger.info(FUNC + "me:", me);
            RedisUtil.hset(redisKeys.UID_GAME_FRIEND, uid, ObjUtil.data2String(me));
            CacheAccount.setCharmPointWithFriendChange(uid);
            if(he) {
                let yourFrindCount = he.length;
                ArrayUtil.removeByValue(he, uid);
                logger.info(FUNC + "he:", he);
                RedisUtil.hset(redisKeys.UID_GAME_FRIEND, id, ObjUtil.data2String(he));
                CacheAccount.setCharmPointWithFriendChange(id);
            }
            cb(null, me);
        }
        else {
            cb(ERROR_OBJ.CHAT_FRIEND_GAME_ERROR);
        }
    });
}