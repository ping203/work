const _ = require("underscore");
const ArrayUtil = require('../utils/ArrayUtil'),
    SORT_RULE = ArrayUtil.SORT_RULE;
const BuzzUtil = require('../utils/BuzzUtil');
const RedisUtil = require("../utils/RedisUtil");
const redisKeys = require('../../../../database').dbConsts.REDISKEY;
const RANK_TYPE = require('../rankCache/cacheConf').RANK_TYPE;
const DaoCommon = require('../dao/dao_common');
const CstError = require('./cst/buzz_cst_error');
const ERROR_OBJ = CstError.ERROR_OBJ;
const cache = require('../rankCache/cache');
const buzz_reward = require('./buzz_reward');
const logger = loggerEx(__filename);
const TAG = "【buzz_charts】";

exports.updateRankGoddess = updateRankGoddess;
exports.updateRankMatch = updateRankMatch;
exports.updateRankAquarium = updateRankAquarium;
exports.updateRankCharm = updateRankCharm;
exports.updateRankBp = updateRankBp;
exports.updateRankFlower = updateRankFlower;
exports.getCharts = getCharts;
exports.getFriendsCharts = getFriendsCharts;
exports.getUserRank = getUserRank;
exports.getChartReward = getChartReward;


// 排行榜更新

function updateRankGoddess(platform, uid, max_wave) {
    const FUNC = TAG + "updateRankGoddess() --- ";
    logger.info(FUNC + "1.max_wave:", max_wave);
    logger.info(FUNC + "2.max_wave:", max_wave);
    RedisUtil.updateRank(redisKeys.RANK.GODDESS, platform, max_wave, uid);
}

function updateRankMatch(platform, uid, point, rank) {
    RedisUtil.updateRank(redisKeys.RANK.MATCH, platform, point, uid);
    // 需要一个hash表存所有玩家的比赛信息，用于玩家的好友排名
    RedisUtil.hset(redisKeys.MATCH_POINTS, uid, point);
    RedisUtil.hset(redisKeys.MATCH_RANK, uid, rank);
}

function updateRankAquarium(platform, uid, total_level) {
    RedisUtil.updateRank(redisKeys.RANK.AQUARIUM, platform, total_level, uid);
}

function updateRankCharm(platform, uid, point) {
    RedisUtil.updateRank(redisKeys.RANK.CHARM, platform, point, uid);
}

function updateRankBp(platform, uid, bp) {
    RedisUtil.updateRank(redisKeys.RANK.BP, platform, bp, uid);
}

function updateRankFlower(platform, uid, flowerCount) {
    RedisUtil.updateRank(redisKeys.RANK.FLOWER, platform, flowerCount, uid);
}

/**
 * 获取玩家历史排名(用于奖励发放, 分类为昨日，上周，上月)
 */
function getUserRank(req, dataObj, cb) {
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_user_rank");

    _getUserRank(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'account_id', 'type'], "buzz_charts", cb);
    }
}

/**
 * 获取排行榜奖励(根据玩家ID从排行榜中获取名次并发给对应的奖励)
 */
function getChartReward(req, dataObj, cb) {
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_chart_reward");

    _getChartReward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'type'], "buzz_charts", cb);
    }
}

/**
 * 客户端接口获取排行榜入口
 */
function getCharts(req, dataObj, cb) {
    const FUNC = TAG + "getCharts() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_ranking");

    _getCharts(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'account_id', 'ranking_count',], "buzz_charts", cb);
    }
}

/**
 * buzz_social调用接口
 */
function getFriendsCharts(pool, list, cb) {
    const FUNC = TAG + "getFriendsCharts() --- ";
    // 需要将uid_list中的空值去掉
    var uid_list = [];
    for (var i = 0; i < list.length; i++) {
        if (list[i] && !ArrayUtil.contain(uid_list, list[i])) uid_list.push(list[i]);
    }
    getFriendsDetailInfo(pool, uid_list, function (err, rank_list) {
        if (err) return cb && cb(err);
        // TODO: 按比赛胜点进行排序
        ArrayUtil.sort(rank_list, "points", SORT_RULE.DESC, "timestamp", SORT_RULE.INC);
        cb && cb(null, rank_list);
    });
}

function getFriendsDetailInfo(pool, uid_list, cb) {
    if (uid_list.length === 0) {
        cb(null, []);
        return;
    }
    const FUNC = TAG + "getFriendsDetailInfo() --- ";

    var rank_list = [];
    for (var i = 0; i < uid_list.length; i++) {
        rank_list.push({id: uid_list[i]});
    }

    var field = [
        "nickname",
        "rank",
        "points",
        "vip",
        "weapon",
        "weapons",
        "figure_url",
        "timestamp",
        "charm_rank",
        "channel_account_name",
        "tempname"
    ];

    var data = [
        ['hmget', redisKeys.NICKNAME, uid_list],
        ['hmget', redisKeys.MATCH_RANK, uid_list],
        ['hmget', redisKeys.MATCH_POINTS, uid_list],
        ['hmget', redisKeys.VIP, uid_list],
        ['hmget', redisKeys.WEAPON, uid_list],
        ['hmget', redisKeys.WEAPON_SKIN, uid_list],
        ['hmget', redisKeys.FIGURE_URL, uid_list],
        ['hmget', redisKeys.MATCH_TIMESTAMP, uid_list],
        ['hmget', redisKeys.CHARM_RANK, uid_list],
        ['hmget', redisKeys.CHANNEL_ACCOUNT_NAME, uid_list],
        ['hmget', redisKeys.TEMPNAME, uid_list],
    ];

    RedisUtil.multi(data, function (err, res) {
        if (err) return cb && cb(err);
        for (var i = 0; i < res.length; i++) {
            setOneProperty(i, res);
        }
        var noid = [];

        // 设置客户端需要的值
        for (var i = 0; i < rank_list.length; i++) {
            var account = rank_list[i];
            //todo 查询数据库
            if (account.nickname == null) {
                if (account.channel_account_name && account.channel_account_name != "") {
                    account.nickname = account.channel_account_name;
                }
                else if (account.tempname && account.channel_account_name != "") {
                    account.nickname = account.tempname;
                }
                else {
                    noid.push(account.id);
                }
            }
            if (account.nickname == "") {
                if (account.channel_account_name && account.channel_account_name != "") {
                    account.nickname = account.channel_account_name;
                }
                else if (account.tempname && account.tempname != "") {
                    account.nickname = account.tempname;
                }
            }
        }
        if (noid.length > 0) {
            var sql = "SELECT ";
            sql += "a.id,";
            sql += "a.tempname,";
            sql += "a.channel_account_name,";
            sql += "a.nickname,";
            sql += "i.`web_url` AS figure_url,";
            sql += "a.vip,";
            sql += "a.weapon,";
            sql += "a.weapon_skin,";
            sql += "a.charm_rank,";
            sql += "r.rank,";
            sql += "r.points ";
            sql += "FROM `tbl_account` a ";
            sql += "left join `tbl_img` i on a.figure=i.id ";
            sql += "left join `tbl_rankgame` r on r.id=a.id ";
            sql += "where a.id in (" + noid.toString() + ")";

            var sql_data = [];

            pool.query(sql, sql_data, function (err, row) {
                if (err) {
                    cb(err);
                    return;
                }
                for (var j = 0; j < row.length; j++) {
                    var result = row[j];
                    let acc = {};
                    for (let k in rank_list) {
                        if (rank_list[k].id == result.id) {
                            acc = rank_list[k];
                        }
                    }

                    acc.nickname = result.channel_account_name;
                    if (!acc.nickname || acc.nickname == "") acc.nickname = result.nickname;
                    if (!acc.nickname || acc.nickname == "") acc.nickname = result.tempname;
                    acc.figure_url = result.figure_url;
                    acc.weapon = result.weapon;
                    var weapon_skin = result.weapon_skin && JSON.parse(result.weapon_skin);
                    acc.weapons = weapon_skin && weapon_skin.own;
                    acc.charm_rank = result.charm_rank;
                    acc.rank = result.rank;
                    acc.vip = result.vip;
                    acc.points = result.points;
                }
                cb && cb(null, rank_list);
            });
        } else {
            cb && cb(null, rank_list);
        }

    });

    function setOneProperty(i, res) {
        for (var rank_idx = 0; rank_idx < rank_list.length; rank_idx++) {
            setUserRank(i, rank_idx, res);
        }
    }

    function setUserRank(i, rank_idx, res) {
        var user_rank = rank_list[rank_idx];
        user_rank[field[i]] = res[i][rank_idx];
        switch (field[i]) {
            case "timestamp":
            case "vip":
            case "weapon":
            case "rank":
            case "charm_rank":
                user_rank[field[i]] = user_rank[field[i]] && parseInt(user_rank[field[i]]) || 0;
                break;

            case "weapons":
                try {
                    // 临时处理代码, 处理用户好友数据不匹配的问题
                    if (JSON.parse(user_rank[field[i]]) == null) {
                        user_rank[field[i]] = [1];
                    }
                    else {
                        user_rank[field[i]] = ArrayUtil.delRepeat(JSON.parse(user_rank[field[i]]).own);
                    }
                }
                catch (err) {
                    logger.error(FUNC + "err", err);
                    logger.error(FUNC + "user_rank[field[i]]:", user_rank[field[i]]);
                }
                break;
        }
    }

}


function _getUserRank(req, dataObj, cb) {
    var token = dataObj.token;
    var type = dataObj.type;

    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        getRewardInfo(account);
    });

    //dfc
    function getRewardInfo(account) {
        let obj_key = _getRewardKey(type);
        buzz_reward.getRewardInfo(account, obj_key.redis_key, function (err, res) {
            if (err) {
                cb(err);
                return;
            }
            let ret = {
                my_rank: 10001,
                reward: 0
            };
            if (res) {
                if (res.rank) {
                    ret.my_rank = res.rank;
                }
                if (res.award) {
                    ret.reward = 1;
                }
                if (res.score) {
                    ret.score = res.score;
                }
            }
            cb(null, ret);
        })

    }
}


function _getChartReward(req, dataObj, cb) {
    var token = dataObj.token;
    var type = dataObj.type;

    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        getAward(account);
    });

    function getAward(account) {
        let obj_key = _getRewardKey(type);
        buzz_reward.resetReward(req, token, obj_key.redis_key, obj_key.hash, account, function (err, res) {
            cb(err, res);
        })
    }
}

function _getCharts(req, dataObj, cb) {
    const FUNC = TAG + "_getCharts() --- uid:" + dataObj.account_id;
    const EFUNC = TAG + "_getCharts() --- uid:" + dataObj.account_id;
    logger.info(FUNC + "CALL...");

    var uid = dataObj.account_id;
    var token = dataObj.token;
    var ranking_count = dataObj.ranking_count;
    var offset = dataObj.offset || 0;
    var type = dataObj.type || RANK_TYPE.ALL;

    var pool = req.pool;

    var start = offset;
    var stop = offset + ranking_count;

    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        if (ranking_count > 100) {
            logger.error(EFUNC + "请求的排名数超过了限制: 最大排名:100, 请求参数:" + ranking_count);
            cb(ERROR_OBJ.RANK_COUNT_TOO_LARGE);
            return;
        }

        var platform = account.platform;

        var chart_goddess = null;
        var chart_match = null;
        var chart_aquarium = null;
        var chart_charm = null;
        var chart_bp = null;
        var chart_flower = null;

        logger.info(FUNC + "type:", type);

        if (RANK_TYPE.ALL == type || RANK_TYPE.GODDESS == type) {
            let chart = cache.getChart(platform, RANK_TYPE.GODDESS, start, stop);
            let my_rank = cache.getRank(platform, RANK_TYPE.GODDESS, uid);
            my_rank['score'] = account.max_wave;
            chart_goddess = {"rank": chart, "my_rank": my_rank};
        }
        if (RANK_TYPE.ALL == type || RANK_TYPE.RANKING == type) {
            let chart = cache.getChart(platform, RANK_TYPE.MATCH, start, stop);
            let my_rank = cache.getRank(platform, RANK_TYPE.MATCH, uid);
            my_rank['score'] = account.match_rank;
            chart_match = {"rank": chart, "my_rank": my_rank};
        }
        if (RANK_TYPE.ALL == type || RANK_TYPE.PETFISH == type) {
            let chart = cache.getChart(platform, RANK_TYPE.AQUARIUM, start, stop);
            let my_rank = cache.getRank(platform, RANK_TYPE.AQUARIUM, uid);
            my_rank['score'] = account.petfish_total_level;
            chart_aquarium = {"rank": chart, "my_rank": my_rank};
        }
        if (RANK_TYPE.ALL == type || RANK_TYPE.CHARM == type) {
            let chart = cache.getChart(platform, RANK_TYPE.CHARM, start, stop);
            let my_rank = cache.getRank(platform, RANK_TYPE.CHARM, uid);
            my_rank['score'] = account.charm_point;
            chart_charm = {"rank": chart, "my_rank": my_rank};
        }
        if (RANK_TYPE.ALL == type || RANK_TYPE.BP == type) {
            let chart = cache.getChart(platform, RANK_TYPE.BP, start, stop);
            let my_rank = cache.getRank(platform, RANK_TYPE.BP, uid);
            my_rank['score'] = account.bp;
            chart_bp = {"rank": chart, "my_rank": my_rank};
        }
        if (RANK_TYPE.ALL == type || RANK_TYPE.FLOWER == type) {
            let chart = cache.getChart(platform, RANK_TYPE.FLOWER, start, stop);
            let my_rank = cache.getRank(platform, RANK_TYPE.FLOWER, uid);
            my_rank['score'] = account.flower_receive_weekly;
            chart_flower = {"rank": chart, "my_rank": my_rank};
        }
        var ret = {
            "rankgame": chart_match,
            "goddess": chart_goddess,
            "aquarium": chart_aquarium,
            "charm": chart_charm,
            "integral": chart_bp,
            "flower": chart_flower,
        };
        logger.info(FUNC + "ret:", ret);
        cb(null, ret);
    }
}

/**
 * 返回当前客户端支持的格式
 */
function formatChart(chart, field, offset) {
    for (var i = 0; i < chart.length; i++) {
        var account = chart[i];
        account.id = account.uid;
        if (account.match_rank) {
            account.rank = account.match_rank;
        }
        account[field] = account.score;
    }
}

function _getRewardKey(type) {
    let redis_key = null;
    // 每日奖励
    if (type > 100 && type < 1000) {
        type = type % 100;
        switch (type) {
            case RANK_TYPE.CHARM:
                redis_key = redisKeys.CHART.RANK_DAILY_AWARD + ":" + redisKeys.RANK.CHARM;
                break;
            case RANK_TYPE.FLOWER:
                redis_key = redisKeys.CHART.RANK_DAILY_AWARD + ":" + redisKeys.RANK.FLOWER;
                break;
            case RANK_TYPE.BP:
                redis_key = redisKeys.CHART.RANK_DAILY_AWARD + ":" + redisKeys.RANK.BP;
                break;
            case RANK_TYPE.AQUARIUM:
                redis_key = redisKeys.CHART.RANK_DAILY_AWARD + ":" + redisKeys.RANK.AQUARIUM;
                break;
            case RANK_TYPE.GODDESS:
                redis_key = redisKeys.CHART.RANK_DAILY_AWARD + ":" + redisKeys.RANK.GODDESS;
                break;
            case RANK_TYPE.MATCH:
                redis_key = redisKeys.CHART.RANK_DAILY_AWARD + ":" + redisKeys.RANK.MATCH;
                break;
        }

    }
    // 每周奖励
    else if (type > 1000 && type < 10000) {
        redis_key = redisKeys.CHART.RANK_WEEK_AWARD + ":" + redisKeys.RANK.GODDESS;
    }
    // 每月奖励
    else if (type > 10000) {
        redis_key = redisKeys.CHART.RANK_MONTH_AWARD + ":" + redisKeys.RANK.MATCH;
    }
    let hash = redis_key && redis_key + ":hash";
    return {
        redis_key: redis_key,
        hash: hash
    }
}