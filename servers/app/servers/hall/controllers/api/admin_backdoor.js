const _ = require('underscore');
const CacheAccount = require('../../src/buzz/cache/CacheAccount');
const CacheMail = require('../../src/buzz/cache/CacheMail');
const CacheGold = require('../../src/buzz/cache/CacheGold');
const buzz_charts = require('../../src/buzz/buzz_charts');
const buzz_bigdata = require('../../src/buzz/buzz_bigdata');
const DateUtil = require('../../src/utils/DateUtil');
const RedisUtil = require('../../src/utils/RedisUtil');
const SYS_LOG = require('../../src/buzz/cst/buzz_cst_log').SYS_LOG,
    SYS_LOG_TYPE = SYS_LOG.TYPE;
const logicResponse = require('../../../common/logicResponse');

const TAG = "【routes/api/admin_backdoor】";

exports.getCacheAccount = getCacheAccount;
exports.delCacheAccount = delCacheAccount;
exports.getCacheAccountStatistics = getCacheAccountStatistics;
exports.getCacheMail = getCacheMail;
exports.queryCfgs = queryCfgs;
exports.getGoldLog = getGoldLog;
exports.resetDaily = resetDaily;
exports.resetWeekly = resetWeekly;
exports.generateRetention = generateRetention;
exports.modifyUserData = modifyUserData;
exports.kickUser = kickUser;
exports.accountForbidden = accountForbidden;
exports.accountAuth = accountAuth;
exports.switchMatch = switchMatch;
exports.switchCik = switchCik;
exports.generateCycleReward = generateCycleReward;
exports.queryAdminLog = queryAdminLog;

exports.queryGold = queryGold;
exports.queryLog = queryLog;

async function accountForbidden(data) {
    return new Promise(function (resolve, reject) {
        myDao.accountForbidden(data, function (err, results) {
            if (err) {
                logger.error('重置账号 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

async function accountAuth(data) {
    return new Promise(function (resolve, reject) {
        myDao.accountAuth(data, function (err, results) {
            if (err) {
                logger.error('账号权限设置 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

async function switchMatch(data) {
    return new Promise(function (resolve, reject) {
        myDao.switchMatch(data, function (err, results) {
            if (err) {
                logger.error('排位赛开关 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

async function switchCik(data) {
    return new Promise(function (resolve, reject) {
        myDao.switchCik(data, function (err, results) {
            if (err) {
                logger.error('实物兑换开关 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

async function generateCycleReward(data) {
    switch (data.type) {
        case 1:
            buzz_charts.generateDailyReward();
            break;
        case 2:
            buzz_charts.generateWeeklyReward();
            break;
        case 3:
            buzz_charts.generateMonthlyReward();
            break;
    }
    var err = null;
    if (!data.type) {
        err = {
            code: 100001,
            msg: "请传入生成的类型"
        };
    }

    if (err) {
        throw err;
    }
    return logicResponse.ask("success:" + data.type, "生成排行奖励")
}

async function kickUser(data) {
    return new Promise(function (resolve, reject) {
        myDao.kickUser(data, function (err, results) {
            if (err) {
                logger.error('踢出玩家 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

async function modifyUserData(data) {
    return new Promise(function (resolve, reject) {
        myDao.modifyUserData(data, function (err, results) {
            if (err) {
                logger.error('修改玩家数据 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

async function generateRetention(data) {
    return new Promise(function (resolve, reject) {
        myDao.fillDayData(data, function (err, results) {
            if (err) {
                logger.error('手动生成留存数据 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

async function resetDaily(data) {
    let id_list = data.id_list;
    CacheAccount.dailyReset(id_list);
    return new Promise(function (resolve, reject) {
        myDao.resetDayInfoForAll(id_list, function (err, results) {
            if (err) {
                logger.error('重置每日数据失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}

async function resetWeekly(data) {
    let id_list = data.id_list;
    return new Promise(function (resolve, reject) {
        myDao.resetWeeklyInfoForAll(id_list, function (err, results) {
            if (err) {
                logger.error('重置每周数据 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    });
}



function cacheAndRedisDiff(cache_data, redis_data) {

    let diff = {
        diffVal: {},
        cacheOwn: {},
        redisOwn: {}
    };
    if (JSON.stringify(cache_data) === JSON.stringify(redis_data)) {
        return diff;
    }

    for (let key in cache_data) {
        if (redis_data[key]) {
            if (redis_data[key] !== cache_data[key]) {
                diff.diffVal[key] = {
                    cache: cache_data[key],
                    redis: redis_data[key]
                };
            }
        } else {
            diff.cacheOwn[key] = cache_data[key];
        }
    }

    for (let key in redis_data) {
        if (!cache_data[key]) {
            diff.redisOwn[key] = redis_data[key];
        }
    }

    return diff;
}

async function getCacheAccount(data) {
    let uid = data.account_id;
    let field = data.field;

    return new Promise(function (resolve, reject) {
        if (CacheAccount.contains(uid)) {
            var ret = {
                cacheData: null,
                redisData: null,
                diffData: null
            };
            if (isNull(field)) {
                CacheAccount.getAccountById(uid, function (err, account) {
                    if (account) {
                        ret.redisData = account;
                    }
                    resolve(logicResponse.ask(ret));
                });
            } else {
                CacheAccount.getAccountById(uid, function (err, account) {
                    if (account) {
                        ret.redisData = account[field];
                    }
                    resolve(logicResponse.ask(ret));
                });
            }
        } else {
            var ret = {};
            CacheAccount.getAccountById(uid, function (err, account) {
                if (account) {
                    ret.redisData = account;
                }
                resolve(logicResponse.ask(ret));
            });
        }
    });
}

async function delCacheAccount(data) {
    let uid = data.account_id;
    if (CacheAccount.contains(uid)) {
        var err = null;
        var ret = {
            msg: "删除缓存数据完成"
        };
        CacheAccount.remove(uid);
        return logicResponse.ask(ret);
    } else {
        logger.error("没有在内存中找到联系人");
    }

}

////////////////////////////////////////
/**
 * 获取玩家统计信息
 * @return 返回给管理后台如下信息:
 * (1) 内存中的玩家总数
 * (2) 内存中的玩家updated_at字段
 */
async function getCacheAccountStatistics(data) {
    return logicResponse.ask({});
}

async function getCacheMail(data) {
    const FUNC = TAG + "getCacheMail()---";
    var min = data.min;
    var max = data.max;

    if (!isNull(min)) min = parseInt(min);
    if (!isNull(max)) max = parseInt(max);

    var err = null;
    var ret = {};
    var mail = CacheMail.cache();
    if (isNull(min) && isNull(max)) {
        logger.info(FUNC + "没有参数, 返回整个邮件列表");
        ret = _.keys(mail);
    } else if (!isNull(min) && !isNull(max)) {
        logger.info(FUNC + "设置返回邮件ID的最大最小值");
        ret = _.filter(mail, function (obj) {
            return obj.id >= min && obj.id <= max;
        });
        ret = _.pluck(ret, "id");
    } else if (!isNull(min) && isNull(max)) {
        logger.info(FUNC + "设置返回邮件ID的最小值");
        ret = _.filter(mail, function (obj) {
            return obj.id >= min;
        });
        ret = _.pluck(ret, "id");
    } else if (isNull(min) && !isNull(max)) {
        logger.info(FUNC + "设置返回邮件ID的最大值");
        ret = _.filter(mail, function (obj) {
            return obj.id <= max;
        });
        ret = _.pluck(ret, "id");
    }
    logger.info(FUNC + "ret:\n", ret);

    return logicResponse.ask(ret);

}

async function queryCfgs(data) {
    const FUNC = TAG + "queryCfgs()---";

    var cfg_name = data.cfg_name;

    try {
        var target = require('../../../../utils/imports').GAME_CFGS[cfg_name];
        return logicResponse.ask(target);
    } catch (err) {
        throw err;
    }

}

async function getGoldLog(data) {
    
    var account_id = data.account_id;

    logger.info("account_id:", account_id);

    var ret = CacheGold.getLogListByAccountId(account_id);

    return logicResponse.ask(ret);
}

async function queryAdminLog(data) {
    let redis_key = SYS_LOG_TYPE[0].redis_key;

    return new Promise(function (resolve, reject) {
        RedisUtil.lrange(redis_key, function (err, ret) {
            if (err) {
                logger.error('获取管理员日志失败 err:', err);
                reject(err);
            }
            for (var i = 0; i < ret.length; i++) {
                ret[i] = JSON.parse(ret[i]);
                ret[i].timestamp = DateUtil.format(new Date(ret[i].timestamp), "yyyy-MM-dd hh:mm:ss");
            }
            resolve(logicResponse.ask(ret));
        });
    });
}

async function queryGold(data) {
    let start_date = data.start_date || DateUtil.getCurrentByFormat('yyyy-MM-dd');
    let end_date = data.end_date || DateUtil.getCurrentByFormat('yyyy-MM-dd');
    return new Promise(function (resolve, reject) {
        buzz_bigdata.queryGold(start_date, end_date, function (err, ret) {
            if (err) {
                logger.error('获取金币数据失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(ret));
        });
    });
}

async function queryLog(data) {
    let start_date = data.start_date || DateUtil.getCurrentByFormat('yyyy-MM-dd');
    let end_date = data.end_date || DateUtil.getNextDayByFormat('yyyy-MM-dd');
    return new Promise(function (resolve, reject) {
        buzz_bigdata.queryLog(data, start_date, end_date, function (err, ret) {
            if (err) {
                logger.error('获取日志数据 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(ret));
        });
    });
}

//==============================================================================
// private
//==============================================================================

function isNull(field) {
    return field == null || field == undefined || field == "";
}