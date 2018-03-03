const config = require('../config');
const MatchingUser = require('./matchingUser');
const MatchingRobotUser = require('./matchingRobotUser');
const omelo = require('omelo');
const messageService = require('../../../net/messageService');
const matchingCmd = require('../../../../cmd/matchingCmd');
const managerCmd = require('../../../../cmd/managerCmd');
const rankMatchCmd = require('../../../../cmd/rankMatchCmd');
const robotBuilder = require('../robot/robotBuilder');
const AiData = require('./AiData');
const redisClient = require('../../../../utils/dbclients').redisClient;
const REDISKEY = require('../../../../database').dbConsts.REDISKEY;
const fishCode = require('../fishCode');
const omeloNickname = require('omelo-nickname');
const consts = require('../consts');

class RankMatching {
    constructor() {
        this._users = new Map();
        this._canRun = true;
    }

    runTask() {
        if (!this._canRun) return;
        setTimeout(function () {
            this._mate();
            this.runTask();
        }.bind(this), config.MATCH.MATE_INTERVAL);
    }

    start() {
        this.runTask();
        AiData.start();
    }

    stop() {
        this._canRun = false;
    }

    request(route, msg, session, cb) {
        if(!this[route]){
            utils.invokeCallback(cb, fishCode.INTERFACE_DEVELOPPING);
            return;
        }
        this[route](msg, session, cb);
    }

    remoteRpc(method, data, cb){
        if(!this[method]){
            cb(fishCode.INTERFACE_DEVELOPPING);
            return;
        }
        this[method](data, function (err, result) {
            utils.invokeCallback(cb, err, result);
        });
    }

    rpc_cancle_sigup(data, cb){
        this._users.delete(data.uid);
        cb();
        logger.error('剔除报名--', data.uid);
    }

    //排位赛玩家报名
    async c_signup(msg, session, cb) {
        try {
            session.set('matching', true);
            session.push('matching');
            msg.sid = session.frontendId;
            let user = await MatchingUser.allocUser(msg);
            this._users.set(msg.uid, user);
            logger.error('有人报名--', user);
            let waitMs = 10*1000; //todo：返回该玩家适合等待的时间，单位毫秒
            utils.invokeCallback(cb, null, {
                waitMs: waitMs, 
            });

            cb();
        } catch (err) {
            cb(err);
        }
    }

    //取消报名
    c_cancel(msg, session, cb) {
        session.set('matching', false);
        session.push('matching');
        this._users.delete(msg.uid);
        cb();
        logger.error('取消报名--', msg.uid);
    }

    _searchEnemy(user, levels) {
        let mate_enemy = null;
        for (let i = 0; i < levels.length; i++) {
            if (!levels[i]) continue;
            let enemy = levels[i][1];
            if (user.canMatch(enemy.sword)) {
                if (enemy.canMatch(user.sword)) {
                    mate_enemy = enemy;
                    levels[i] = null;
                    break;
                }

            } else {
                break;
            }
        }
        return mate_enemy;
    }

    //分配机器人
    async _allocRobotEnemy(user) {
        let baseInfo = omeloNickname.gen_random();
        let weapon_skin = robotBuilder._genOwnWeaponSkin();
        // yxlDONE:计算机器人的段位
        let match_rank = robotBuilder._calcRank(user.account.match_rank);
        let ior = AiData.getIOR(match_rank);

        let robotInfo = {
            baseInfo: baseInfo,
            weapon_skin: weapon_skin,
            match_rank: match_rank,
            ior: ior,
        };

        let robot = MatchingRobotUser.allocUser(user, robotInfo);
        return robot;
    }

    /**
     * 匹配玩家、段位、武器等级、VIP等
     */
    async _mate() {
        const FUNC  = "\n_mate() --- ";
        let levels = [...this._users];
        levels.sort(function (userA, userB) {
            if (userA.sword != userB.sword) {
                return userA.sword < userB.sword;
            } else {
                return userA.sigupTime > userB.sigupTime;
            }
        });

        for (let i = 0; i < levels.length; i++) {
            if (!levels[i]) continue;

            let user = levels[i][1];
            levels[i] = null;

            let enemy = this._searchEnemy(user, levels);
            if (!enemy) {
                //TODO:读取配置文件，不同段位的玩家，匹配机器人时间不同
                if (Date.now() - user.sigupTime > config.MATCH.MATE_TIMEOUT) {
                    enemy = await this._allocRobotEnemy(user);
                }
            }

            if (enemy) {
                let uids = this._getUids([user, enemy]);
                try {
                    let serverId = await this._allocMatchServer();
                    let matchInfo = await this._joinMatchRoom(serverId, {
                        users: [user.account, enemy.account]
                    });
                    let mateResult = {
                        rankMatch: {
                            serverId: serverId,
                            roomId: matchInfo.roomId,
                        },
                        players: [user.getMatchingInfo(), enemy.getMatchingInfo()],
                    };
                    logger.error(FUNC + 'mateResult:\n', mateResult);
                    for (let i = 0; i < mateResult.players.length; i++) {
                        let player = mateResult.players[i];
                        if (Number(player.uid) > 0) {
                            redisClient.cmd.set(REDISKEY.RANK_MATCH_ING + ':' + player.uid, JSON.stringify(mateResult.rankMatch));
                            redisClient.cmd.expire(REDISKEY.RANK_MATCH_ING + ':' + player.uid, 180);
                        }
                    }
                    this._responseMateResult(null,mateResult, uids);
                    this._remQueue(uids);
                } catch (err) {
                    logger.error('排位赛加入异常', err);
                    this._responseMateResult(err,null, uids);
                    this._remQueue(uids);
                }
            }
        }
    }

    _remQueue(uids) {
        uids.forEach(function (item) {
            this._users.delete(item.uid);
        }.bind(this));
    }

    _getUids(users) {
        let uids = [];
        users.forEach(user => {
            if (user.account.kindId == consts.ENTITY_TYPE.PLAYER) {
                uids.push({
                    uid: user.account.uid,
                    sid: user.account.sid
                });
            }
        });
        return uids;
    }

    _allocMatchServer() {
        return new Promise(function (resolve, reject) {
            omelo.app.rpc.manager.managerRemote[managerCmd.remote.getRankMatchServer.route]({}, function (err, serverId) {
                if (err) {
                    reject(err);
                } else {
                    resolve(serverId);
                }
            });
        });
    }

    //加入比赛房间
    _joinMatchRoom(serverId, data) {
        return new Promise(function (resolve, reject) {
            omelo.app.rpc.rankMatch.rankMatchRemote[rankMatchCmd.remote.join.route]({
                rankMatchSid: serverId
            }, data, function (err, result) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }

    //回应匹配结果
    _responseMateResult(err, info, uids) {
        let data = {};
        if(err){
            data.err = err;
        }else{
            data.matchingInfo = info;
        }
        messageService.broadcast(matchingCmd.push.matchingResult.route, data, uids);
    }
}

module.exports = RankMatching;