const async = require('async');
const RedisUtil = require('../../utils/RedisUtil');
const redisKeys = require('../../../../../database').dbConsts.REDISKEY;
const ObjUtil = require('../../buzz/ObjUtil');
const DateUtil = require('../../utils/DateUtil');
const CharmUtil = require('../../utils/CharmUtil');
const account_def = require('./account_def');
const redisSync = require('../../buzz/redisSync');
const common = require('./common');
const utils = require('../../buzz/utils');
const vip_vip_cfg = require('../../../../../utils/imports').GAME_CFGS.vip_vip_cfg;
const mission = require('../../mission/mission');
const channel = require('./channel');
const logger = loggerEx(__filename);

/**
 * 产生一个新玩家，并及时写入redis
 */
let _generateAccount = function (id, data, cb) {
    let AccountDefault = account_def.AccountDef;
    let OtherDef = account_def.OtherDef;

    let newAccount = {};
    for (let k in AccountDefault) {
        newAccount[k] = ObjUtil.clone(AccountDefault[k].def);
    }
    for (let k in OtherDef) {
        newAccount[k] = ObjUtil.clone(OtherDef[k].def);
    }

    let timeNow = (new Date()).format("yyyy-MM-dd hh:mm:ss");
    newAccount.created_at = timeNow;
    newAccount.updated_at = timeNow;
    newAccount.last_online_time = timeNow;
    let daysInMonth = DateUtil.getDaysOfThisMonth();
    for (let i = 0; i < daysInMonth; i++) {
        newAccount.month_sign[i] = 0;
    }
    newAccount.id = id;

    if (!data) {
        newAccount.nickname = 'fj_' + id;
        newAccount.tempname = 'fj_' + id;

        redisSync.setAccountById(id, newAccount, function () {
            logger.info('generate temp account done!');
        });

        cb && cb(null, newAccount);
    }
    else {
        let channel_account_id = data['channel_account_id'];
        newAccount.channel = channel.getChannelPrefix(data);
        let channel_account_info = data['channel_account_info'];
        newAccount.nickname = channel_account_info.name;
        newAccount.figure_url = channel_account_info.figure_url;
        let channelSplit = channel_account_id.split('_');
        if (channelSplit.length === 2) {
            newAccount.platform = channelSplit[1];
        }
        newAccount.channel_account_id = channel_account_id;

        async.waterfall([function (cb) {
                RedisUtil.hset("pair:openid:uid", channel_account_id, id, cb);
            }, function (ret, cb) {
                redisSync.setAccountById(id, newAccount, cb);
            }], function (err, res) {
                cb && cb(err, [{id: id, tempname: "fj_" + id}]);
            }
        )
    }
};

/**
 * 注册
 * 注意：对象要克隆，否则其他玩家使用的是同一数据,直接赋值则为引用;且重新赋值创建日期
 */
exports.register = function (data, cb) {
    if (data) {
        let channel_account_id = data.channel_account_id;
        async.waterfall([function (cb) {
            RedisUtil.hget(redisKeys.OPENID_UID, channel_account_id, cb);
        }, function (uid, cb) {
            if (!uid) {
                channel.getUserInfoByChannelId(mysqlPool, 'id', data.channel, channel_account_id, cb);
            } else {
                cb(null, uid);
            }
        }], function (err, res) {
            if (!res || err) {
                RedisUtil.generateNewId(function (id) {
                    _generateAccount(id, data, cb);
                });
            } else {
                cb(null, {
                    id: res
                });
            }
        });
    } else {
        RedisUtil.generateNewId(function (id) {
            _generateAccount(id, data, cb);
        });
    }
};


/**
 * 当前月卡是否有效
 * @param card_type 月卡类型，取值为normal
 */
let _isCardValid = function (buyDate) {
    if (buyDate) {
        let curDate = DateUtil.format(new Date(), "yyyy-MM-dd");
        let offDate = DateUtil.dateDiff(curDate, buyDate);
        return offDate < 30;
    }
    return true;
}

/**
 * 登录后相关数据操作
 */
let _someOptAfterLogin = function (account, cb) {
    let id = account.id;
    let token = utils.generateSessionToken(id);
    let timeNow = (new Date()).format("yyyy-MM-dd hh:mm:ss");
    account.token = token;
    account.updated_at = timeNow;
    account.last_online_time = timeNow;

    //月卡是否过期、魅力值变化
    let card = account.card;
    if (card.normal && !_isCardValid(card.normal.start_date)) {
        delete card.normal;
    }
    if (card.senior && !_isCardValid(card.senior.start_date)) {
        delete card.senior;
    }
    account.card = card;

    //补足vip
    let vip = account.vip;
    if (vip > 0 && account.vip_daily_fill == 1) {
        let vip_info = null;
        for (let i in vip_vip_cfg) {
            if (vip_vip_cfg[i].vip_level == vip) {
                vip_info = vip_vip_cfg[i];
                break;
            }
        }
        if (vip_info && account.first_login === 1) {
            let gold = Math.max(account.gold, vip_info.vip_dailyGold);
            if (gold - account.gold > 0) {
                account.gold = gold - account.gold;
            }
            account.pearl = Math.max(account.pearl, vip_info.vip_dailyDiamond);
        }
    }

    //登录次数
    account.login_count = account.login_count + 1;

    //
    common.addFamousOnlineBroadcast(account, account.platform);
    //重设魅力值
    CharmUtil.getCurrentCharmPoint(account, function (charmPoint) {
        if (charmPoint) {
            account.charm_point = charmPoint;
        }

        cb && cb(null, account);
        let updateMission = false;
        if (account.first_login === 1) {
            account.first_login = 0;
            updateMission = true;
        }
        // 下面的代码执行后效果等同于account.commit().
        redisSync.setAccountById(account.id, account.toJSON());
        //累计登录任务数据统计dfc
        if (updateMission) {
            mission.add(account.id, mission.MissionType.CONTINUE_LOGIN, 0, 1);
        }
    });
};

/**
 * 登录
 * 注意更新token，在线时间等
 */
exports.login = function (data, cb) {
    let nickname = data.nickname;
    if (!nickname) {
        cb && cb(new Error("登录名不能为空!"));
        return;
    }
    let id = nickname.split("_")[1];
    logger.info("登录信息id:", id);
    async.waterfall(
        [
            function (cb) {
                redisSync.getAccountById(id, cb);
            }
            , function (account, cb) {
            logger.info("登录信息account:", account);
            if (!account) {
                common.getAccountById(mysqlPool, id, cb);
            } else {
                cb(null, account);
            }
        }
        ],
        function (err, account) {
            if (err) {
                cb(err);
                return;
            }
            _someOptAfterLogin(account, cb);
        }
    );
};

exports.login_channel = function (data, cb) {

    let channel_account_id = data.channel_account_id;
    let _redisId = null;
    let _mysqlId = null;
    async.waterfall([
        function (cb) {
            RedisUtil.hget(redisKeys.OPENID_UID, channel_account_id, cb);
        }
        // openid对应关系和玩家platform同时存在才在Redis中查找数据
        // 否则进入MySQL中读取数据
        //----------------------------------------------------------
        , function (uid, cb) {
            if (uid) {
                logger.info("玩家能找到openid对应关系:", uid);
                // redisSync.getAccountById(uid, cb);
                RedisUtil.hget(redisKeys.PLATFORM, uid, function (err, res) {
                    if (res) {
                        cb(err, uid);
                    }
                    else {
                        cb(err, null);
                    }
                });
            }
            else {
                logger.info("玩家不能找到openid对应关系");
                cb(null, null);
            }
        }
        //----------------------------------------------------------
        , function (uid, cb) {
            if (!uid) {
                // channel_account_id = channel_account_id + "_" + data.platform;
                logger.info("玩家数据不在Redis");
                channel.getUserInfoByChannelId(mysqlPool, 'id', data.channel, channel_account_id, function (err, res) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        if (res) {
                            _mysqlId = res.id;
                            cb(null, res);
                        }
                        else {
                            cb && cb(new Error('玩家不存在'));
                        }
                    }
                });
            } else {
                _redisId = uid;
                logger.info("玩家数据在Redis中能找到:", uid);
                redisSync.getAccountById(uid, cb);
            }
        }
        , function (account, cb) {
            if (!!_mysqlId) {
                common.getAccountById(mysqlPool, _mysqlId, cb);
            } else {
                cb(null, account);
            }
        }], function (err, account) {
        if (err) {
            cb(err);
            return;
        }

        if (!account.channel_account_id) {
            account.channel_account_id = channel_account_id;
        }
        if (!account.nickname || account.nickname == '' || account.nickname == 'undefined') {
            account.nickname = account.channel_account_name;
        }
        if (!account.nickname || account.nickname == '' || account.nickname == 'undefined') {
            account.nickname = account.tempname;
        }
        _someOptAfterLogin(account, cb);

        logLogin.push({
            account_id: account.id,
            log_at: new Date(),
        });

        if (!_redisId) {
            RedisUtil.hset(redisKeys.OPENID_UID, channel_account_id, account.id);
        }
    });

};