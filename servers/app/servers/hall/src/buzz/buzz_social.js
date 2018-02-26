const BuzzUtil = require('../utils/BuzzUtil');
const CacheAccount = require('./cache/CacheAccount');
const CommonUtil = require('./CommonUtil');
const ObjUtil = require('./ObjUtil');
const RedisUtil = require('../utils/RedisUtil');
const DateUtil = require('../utils/DateUtil');
const buzz_charts = require('./buzz_charts');
const redisKeys = require('../../../../database').dbConsts.REDISKEY;
const DaoCommon = require('../dao/dao_common');
const account_def = require('../dao/account/account_def');
const logger = loggerEx(__filename);

const TAG = "【buzz_social】";

// 加入的类型
const JOIN_TYPE = {
    /** 邀请 */
    INVITE: 100,
    /** 分享 */
    SHARE: 101,
    /** 收藏 */
    ENSHRINE: 102,
    /** 自己来的 */
    SELF: 103,
    /** 每日邀请 */
    INVITE_DAILY: 104,
};
exports.JOIN_TYPE = JOIN_TYPE;

// 分享的状态
const SHARE_STATUS = {
    /** 待分享 */
    SHARE: 0,
    /** 未领取 */
    REWARD: 1,
    /** 已领取 */
    GOTTEN: 2,
};
exports.SHARE_STATUS = SHARE_STATUS;

// 收藏的状态
const ENSHRINE_STATUS = {
    /** 待收藏 */
    TOBE_ENSHRINE: 0,
    /** 未领取 */
    REWARD: 1,
    /** 已领取 */
    GOTTEN: 2,
};
exports.ENSHRINE_STATUS = ENSHRINE_STATUS;

// 分享的重复类型
const REPEAT_TYPE = {
    /** 不重置 */
    NONE: 0,
    /** 每日重置 */
    DAILY: 1,
    /** 每周重置 */
    WEEKLY: 2,
};
exports.REPEAT_TYPE = REPEAT_TYPE;

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getInviteProgress = getInviteProgress;
exports.getShareStatus = getShareStatus;
exports.getEnshrineStatus = getEnshrineStatus;
exports.inviteSuccess = inviteSuccess;
exports.shareSuccess = shareSuccess;
exports.enshrineSuccess = enshrineSuccess;
exports.getSocialReward = getSocialReward;
exports.getFriendsCharts = getFriendsCharts;
exports.inviteDaily = inviteDaily;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取好友的排行榜.
 */
function getFriendsCharts(req, dataObj, cb) {
    const FUNC = TAG + "getFriendsCharts() --- ";
    logger.info(FUNC + "CALL----");

    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_friends_ranking");

    _getFriendsCharts(req, dataObj, cb);

    function lPrepare(input) {
        return _checkParams(input, ['token'], "buzz_social", cb);
    }
}

/**
 * 获取好友邀请进度.
 */
function getInviteProgress(req, dataObj, cb) {
    const FUNC = TAG + "getInviteProgress() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_invite_progress");

    // 数据库操作
    myDao.getInviteProgress(dataObj, function (err, result) {
        cb(null, result);
    });

    function lPrepare(input) {
        return _checkParams(input, ['token'], "buzz_social", cb);
    }
}

/**
 * 获取好友分享状态.
 */
function getShareStatus(req, dataObj, cb) {
    const FUNC = TAG + "getShareStatus() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_share_status");

    // 数据库操作
    myDao.getShareStatus(dataObj, function (err, result) {
        cb(null, result);
    });

    function lPrepare(input) {
        return _checkParams(input, ['token'], "buzz_social", cb);
    }
}

/**
 * 获取收藏状态.
 */
function getEnshrineStatus(req, dataObj, cb) {
    const FUNC = TAG + "getEnshrineStatus() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_enshrine_status");

    // 数据库操作
    myDao.getEnshrineStatus(dataObj, function (err, result) {
        cb(null, result);
    });

    function lPrepare(input) {
        return _checkParams(input, ['token'], "buzz_social", cb);
    }
}

/**
 * 接收邀请好友进度记录.
 */
function inviteSuccess(req, dataObj, cb) {
    const FUNC = TAG + "inviteSuccess() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "invite_success");

    // 数据库操作
    myDao.inviteSuccess(dataObj, function (err, result) {
        let data = {is_ok: 1};
        cb(null, data);
    });

    function lPrepare(input) {
        // type = 100(邀请) | 101(分享)
        let commonCheck = _checkParams(input, ['token', 'type'], "buzz_social", cb);
        if (dataObj.type != JOIN_TYPE.SELF) {
            commonCheck = commonCheck || _checkParams(input, ['fuid'], "buzz_social", cb);
        }
        return commonCheck;
    }
}

/**
 * 记录每日邀请好友
 */
function inviteDaily(req, dataObj, cb) {
    const FUNC = TAG + "inviteDaily() --- ";
    if (!lPrepare(dataObj)) return;
    //BuzzUtil.cacheLinkDataApi(dataObj, "inviteDaily");

    //Redis操作
    let token = dataObj["token"];
    let uid = token.split("_")[0];

    CacheAccount.getAccountFieldById(uid, [account_def.OtherDef.social_invite_daily_state.name], function (err, account) {

        if (!account.social_invite_daily_state) {
            account.social_invite_daily_state = 1;
            logger.info(FUNC + "UID_SOCIAL_INVITE_DAILY:1");
        }
        account.commit();
        RedisUtil.expire('pair:uid:social_invite_daily_state', DateUtil.getNexyDayBySeconds());
        cb(null, "sucess");

    });
    function lPrepare(input) {
        return _checkParams(input, ['token'], "buzz_social", cb);
    }
}

/**
 * 接收邀请好友进度记录.
 */
function shareSuccess(req, dataObj, cb) {
    const FUNC = TAG + "shareSuccess() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "share_success");

    // 数据库操作
    myDao.shareSuccess(dataObj, function (err, result) {
        let data = {is_ok: 1};
        cb(null, data);
    });

    function lPrepare(input) {
        // type = 100(邀请) | 101(分享)
        return _checkParams(input, ['token', 'share_id'], "buzz_social", cb);
    }
}

/**
 * 收藏成功.
 */
function enshrineSuccess(req, dataObj, cb) {
    const FUNC = TAG + "enshrineSuccess() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "enshrine_success");

    // 数据库操作
    myDao.enshrineSuccess(dataObj, function (err, result) {
        let data = {is_ok: 1};
        cb(null, data);
    });


    function lPrepare(input) {
        return _checkParams(input, ['token'], "buzz_social", cb);
    }
}

/**
 * 社交奖励领取.
 */
function getSocialReward(req, dataObj, cb) {
    const FUNC = TAG + "getSocialReward() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_social_reward");

    let type = dataObj["type"];
    if(type==JOIN_TYPE.INVITE_DAILY) {
        myDao.getInviteDailyReward(dataObj,function(err,result) {
            cb(err, result);
        })
    }else{
        // 数据库操作
        myDao.getSocialReward(dataObj, function (err, result) {
            cb(err, result);
        });
    }

    function lPrepare(input) {
        let commonCheck = _checkParams(input, ['token', 'type'], "buzz_social", cb);
        if (dataObj.type == JOIN_TYPE.SHARE) {
            commonCheck = commonCheck || _checkParams(input, ['share_id'], "buzz_social", cb);
        }
        return commonCheck;
    }
}

//==============================================================================
// private
//==============================================================================

function _getFriendsCharts(req, data, cb) {
    const FUNC = TAG + "_getFriendsCharts() --- ";
    let token = data['token'];
    let fopenids = data['fopenids'];
    let offset = data['offset'] || 0;
    let ranking_count = data['ranking_count'];
    let pool = req.pool;

    fopenids = ObjUtil.str2Arr(fopenids);// 转换为数组.


    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        let ret = {
            rank_change: 0,
            notify_friends: [],
            rank_list: [],
        };
        let platform = account.platform;
        /*let openid = account.channel_account_id;

        // 去掉平台后缀(Android-1, IOS-2)
        openid = openid && StringUtil.subString(openid, 0, openid.length - 2);
        openid && fopenids.push(openid);*/
        let uid = account.id;
        if (fopenids.length === 0) {
            getAllFriend(pool,uid, [], function (err, rank_list) {
                if (err) return cb && cb(err);
                let ret = {
                    rank_change: 0,
                    notify_friends: [],
                    rank_list: rank_list,
                    charm_point: account.charm_point,
                    charm_rank: account.charm_rank,
                };
                cb && cb(null, ret);
            });
        } else {
            getFriendsChart(pool, fopenids, offset, ranking_count, platform, uid, function (err, rank_list) {
                if (err) return cb && cb(err);
                let ret = {
                    rank_change: 0,
                    notify_friends: [],
                    rank_list: rank_list,
                    charm_point: account.charm_point,
                    charm_rank: account.charm_rank,
                };
                cb && cb(null, ret);
            });
        }

    }

    function getFriendsChart(pool, fopenids, offset, ranking_count, platform, uid, cb) {
        // 为每一个openid加上平台后缀
        for (let i = 0; i < fopenids.length; i++) {
            fopenids[i] += "_" + platform;
        }

        // 获取PAIR.OPENID_UID中所有玩家的uid.
        RedisUtil.hmget(redisKeys.OPENID_UID, fopenids, function (err, uid_list) {
            if (err) return cb && cb(err);
            getAllFriend(pool,uid, uid_list, cb);
        });
    }

    function getAllFriend(pool,uid, open_uid_list, cb) {
        RedisUtil.hget(redisKeys.UID_GAME_FRIEND, uid, function (err, uid_list) {
            if (err) return cb && cb(err);
            uid_list = ObjUtil.str2Arr(uid_list);
            logger.info(FUNC + "game_uid_list:", uid_list);
            logger.info(FUNC + "game_uid_list1:", open_uid_list);
            let list = [];
            list.push(uid);
            if(uid_list&&uid_list.length>0) {
                list = list.concat(uid_list);
            }
            if(open_uid_list&&open_uid_list.length>0) {
                list = list.concat(open_uid_list);
            }

            buzz_charts.getFriendsCharts(pool,list, function (err, charts) {
                if (err) return cb && cb(err);
                cb && cb(null, charts);
            });
        })
    }
}


function _checkParams(input, params, hint, cb) {
    for (let i = 0; i < params.length; i++) {
        let param_name = params[i];
        let param = input[params[i]];
        if (!CommonUtil.isParamExist(hint, param, "接口调用请传参数" + param_name, cb)) return false;
    }
    return true;
}