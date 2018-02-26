const BuzzUtil = require('../utils/BuzzUtil');
const RedisUtil = require('../utils/RedisUtil');
const redisKesy = require('../../../../database').dbConsts.REDISKEY;
const CommonUtil = require('./CommonUtil');
const RANK_TYPE = require('../rankCache/cacheConf').RANK_TYPE;
const _ = require('underscore');
const buzz_account = require('./buzz_account');
const DaoCommon = require('../dao/dao_common');
const cache = require('../rankCache/cache');
const logger = loggerEx(__filename);

const TAG = "【buzz_rankgame】";

exports.result = result;
exports.info = info;
exports.box = box;
exports.ongoing = ongoing;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取排位赛结果
 */
function result(req, data, cb) {
    const FUNC = TAG + "result() --- ";

    logger.info(FUNC + "CALL...");

    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "rankgame_result");

    buzz_account.getAccountByToken(req, data.token, function (err, account) {
        if (err) {
            cb(err);
            return;
        }
        myDao.getRankgame(data, cb);
    });
}

/**
 * 获取排位赛信息
 */
function info(req, data, cb) {
    const FUNC = TAG + "info() --- ";

    logger.info(FUNC + "CALL...");

    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "rankgame_info");

    // 从Redis中拉取用户的排位赛信息
    _info(req, data, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_rankgame", cb);
    }
}

function _info(req, data, cb) {
    const FUNC = TAG + "_info() --- ";

    let uid = data.uid;
    let token = data.token;
    let pool = req.pool;

    DaoCommon.checkAccount(pool, token, function (err, account) {
        if (err) return cb && cb(err);
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        myDao.rankgameInfo(data, account, function (err, ret) {
            if (err) return cb && cb(err);
            // DONE: 使用Redis中生成的排行榜获取玩家的排位赛数据.
            let my_rank_info = cache.getRank(account.platform, RANK_TYPE.MATCH, uid);
            ret.my_rank = my_rank_info.my_rank;
            // 不仅获取玩家的名次，也要获取玩家的胜点和段位数据.
            // 如果玩家不在排行榜中, 不要覆盖了排行榜的数据
            ret.rank = my_rank_info.rank || account.match_rank;
            ret.points = my_rank_info.points || account.match_points;

            cb && cb(null, ret);
        });
    }
}

/**
 * 排位赛中的宝箱操作相关
 */
function box(req, data, cb) {
    const FUNC = TAG + "box() --- ";

    logger.info(FUNC + "CALL...");

    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "rankgame_box");

    buzz_account.getAccountByToken(req, data.token, function (err, account) {
        if (err) {
            cb(err);
            return;
        }
        myDao.rankgameBox(data, account, cb);
    });
}

/**
 * 获取是否有正在进行中的比赛.
 */
function ongoing(req, data, cb) {
    const FUNC = TAG + "ongoing() --- ";

    logger.info(FUNC + "CALL...");

    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "rankgame_ising");

    buzz_account.getAccountByToken(req, data.token, function (err, account) {

        logger.info(FUNC + "getAccountByToken end");
        if (err) {
            cb(err);
            return;
        }

        // 使用Redis记录比赛房间信息
        RedisUtil.get(redisKesy.RANK_MATCH_ING + ':' + account.id, function (err, res) {
            logger.info(FUNC + 'err:', err);
            logger.info(FUNC + 'res:', res);
            if (res) {
                cb(null, {room: JSON.parse(res)});
            }
            else {
                cb(null, {room: null});
            }
        });
    });
}

//==============================================================================
// private
//==============================================================================

function _prepare(data, cb) {

    let token = data['token'];

    logger.info("token:", token);

    if (!CommonUtil.isParamExist("buzz_rankgame", token, "接口调用请传参数token", cb)) return false;

    return true;

}