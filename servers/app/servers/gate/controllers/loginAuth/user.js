const _ = require('lodash');
const async = require('async');
const REDISKEY = require('../../../../database').dbConsts.REDISKEY;
const KEYTYPEDEF = require('../../../../database').dbConsts.KEYTYPEDEF;
const redisAccountSync = require('../../../../utils/redisAccountSync');
const moment = require('moment');
const vip_vip_cfg = require('../../../../utils/imports').GAME_CFGS.vip_vip_cfg;
const utils = require('../../../../utils/utils');
const CharmUtil = require('../../../hall/src/utils/CharmUtil');
const common = require('../../../hall/src/dao/account/common');
const buzz_cst_game = require('../../../hall/src/buzz/cst/buzz_cst_game');
const logBuilder = require('../../../../utils/logSync').logBuilder;
const RewardModel = require('../../../../utils/account/RewardModel');

class User {
    constructor() {
    }

    isRegiste(data) {
        return new Promise(function (resolve, reject) {
            redisConnector.cmd.hget(REDISKEY.OPENID_UID, data.openid, function (err, uid) {
                if (err) {
                    reject(err);
                    return;
                }

                if (!uid) {
                    let sql = "SELECT id FROM `tbl_account` WHERE `channel_account_id`=? ";
                    let sql_data = [data.openid];

                    mysqlConnector.query(sql, sql_data, function (err, rows) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        let uid = rows && rows[0];
                        if (uid) {
                            async.waterfall([function (cb) {
                                common.getAccountById(mysqlConnector, uid, cb);
                            }, function (result, cb) {
                                redisConnector.cmd.hset(REDISKEY.OPENID_UID, data.openid, uid, cb);
                            }], function (err, result) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(result.id);
                                }
                            })
                        } else {
                            resolve(null);
                        }

                    });

                } else {
                    resolve(uid);
                }

            });
        });

    }

    async registe(userInfo) {
        let uid = await redisAccountSync.Util.genUid();
        await this._genAccount(uid, userInfo);
        return uid;
    }

    login(data) {
        let self = this;
        return new Promise(function (resolve, reject) {
            redisAccountSync.getAccount(data.uid, function (err, account) {
                if (err) {
                    reject(err);
                    return;
                }

                logBuilder.addSLoginLog(account.id);

                self._someOptAfterLogin(account, function (err, account) {
                    resolve(account);
                });

            });

        });
    }

    loginStatus(token) {
    }

    getUserInfo(data) {
    }

    /**
     * 产生一个新玩家，并及时写入redis
     */
    _genAccount(id, data) {

        let AccountDefault = KEYTYPEDEF.AccountDef;
        let OtherDef = KEYTYPEDEF.OtherDef;
        let newAccount = {};

        for (let k in AccountDefault) {
            newAccount[k] = _.cloneDeep(AccountDefault[k].def);
        }
        for (let k in OtherDef) {
            newAccount[k] = _.cloneDeep(OtherDef[k].def);
        }

        let timeNow = (new Date()).format("yyyy-MM-dd hh:mm:ss");
        newAccount.created_at = timeNow;
        newAccount.updated_at = timeNow;
        newAccount.last_online_time = timeNow;

        var daysInMonth = (moment(new Date()).endOf('month')).date();
        for (var i = 0; i < daysInMonth; i++) {
            newAccount.month_sign[i] = 0;
        }
        newAccount.id = id;
        newAccount.platform = data.device;
        newAccount.channel_account_id = data.openid;
        newAccount.nickname = data.nickname;
        newAccount.figure_url = data.figure_url;
        newAccount.channel = data.channel.toString();
        newAccount.city = data.city;

        if (data.saltPassword) {
            newAccount.password = data.saltPassword
        }
        if (data.phone) {
            newAccount.phone = data.phone
        }

        return new Promise(function (resolve, reject) {
            async.waterfall([function (cb) {
                redisConnector.cmd.hset(REDISKEY.OPENID_UID, data.openid, id, cb);
            }, function (ret, cb) {
                redisAccountSync.setAccount(id, newAccount, cb);
            }, function (res, cb) {
                redisAccountSync.getAccount(id, cb);
            }], function (err, account) {
                if (err) {
                    reject(err);
                    return;
                }
                account.nickname = account.nickname;
                account.commit();
                resolve(err, account.id);
            })

        });
    };

    /**
     * 当前月卡是否有效
     * @param card_type 月卡类型，取值为normal
     */
    _isCardValid(buyDate) {
        if (buyDate) {
            let curDate = moment(new Date());
            let offDate = moment(buyDate).date() - curDate.date();
            return offDate < 30;
        }
        return true;
    }

    /**
     * 登录后相关数据操作
     */
    _someOptAfterLogin(account, cb) {
        let id = account.id;
        let token = utils.generateSessionToken(id);
        let timeNow = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

        account.token = token;
        account.updated_at = timeNow;
        account.last_online_time = timeNow;

        //月卡是否过期、魅力值变化
        let card = account.card;
        let oldCard = _.cloneDeep(card);
        let cp = account.charm_point;
        if (card.normal && !this._isCardValid(card.normal.start_date)) {
            delete card.normal;
        }
        if (card.senior && !this._isCardValid(card.senior.start_date)) {
            delete card.senior;
        }
        account.card = card;

        //补足vip
        let vip = account.vip;
        if (vip > 0 && account.vip_daily_fill == 1) {
            var vip_info = null;
            for (let i in vip_vip_cfg) {
                if (vip_vip_cfg[i].vip_level == vip) {
                    vip_info = vip_vip_cfg[i];
                    break;
                }
            }
            if (vip_info && account.first_login === 1) {
                let gold = Math.max(account.gold, vip_info.vip_dailyGold) - account.gold;
                if (gold > 0) {
                    account.gold = gold;
                }
                let pearl = Math.max(account.pearl, vip_info.vip_dailyDiamond) - account.pearl;
                if (pearl > 0) {
                    account.pearl = pearl;
                }
            }
        }

        //登录次数
        account.login_count = account.login_count + 1;

        //
        buzz_cst_game.addFamousOnlineBroadcast(account, account.platform);
        //重设魅力值
        CharmUtil.getCurrentCharmPoint(account, function (charmPoint) {
            if (charmPoint) {
                account.charm_point = charmPoint;
            }
            if (account.first_login === 1) {
                account.first_login = 0;
                //累计登录任务数据统计dfc
                let mission = new RewardModel();
                mission.resetLoginData(account.mission_only_once, account.mission_daily_reset);
                mission.addProcess(RewardModel.TaskType.CONTINUE_LOGIN, 1);
                account.mission_only_once = mission.getReadyData2Send(RewardModel.Type.ACHIEVE);
                account.mission_daily_reset = mission.getReadyData2Send(RewardModel.Type.EVERYDAY);
            }
            account.commit();
            cb && cb(null, account);
        });
    }
}

module.exports = User;