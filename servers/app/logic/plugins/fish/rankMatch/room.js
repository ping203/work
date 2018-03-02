const moment = require('moment');
const rankMatchCmd = require('../../../../cmd/rankMatchCmd');
const consts = require('../consts');
const config = require('../config');
const fishCode = require('../fishCode');
const uuidv1 = require('uuid/v1');
const RankMatchRobotPlayer = require('./rankMatchRobotPlayer');
const omelo = require('omelo');
const rpc = require('../../../net/rpc');
const fishCmd = require('../../../../cmd/fishCmd');
const PlayerFactory = require('../entity/playerFactory');
const mysqlClient = require('../../../../utils/dbclients').mysqlClient;
const redisClient = require('../../../../utils/dbclients').redisClient;
const redisKey = require('../../../../database').dbConsts.REDISKEY;

class RankMatchRoom {
    constructor(opts) {
        this._playerMap = new Map();
        this._countdown = config.MATCH.MSECONDS;
        this._state = consts.MATCH_ROOM_STATE.WAIT;
        this._createTime = Date.now();
        this._lastUpdateTime = Date.now();
        this._roomId = uuidv1();
        this.channel = omelo.app.get('channelService').getChannel(this._roomId, true);
        this._robot = null;
        this._init(opts.users);
        this._runSettlement = false;
    }

    get countdown() {
        return this._countdown;
    }

    get state() {
        return this._state;
    }

    get roomId() {
        return this._roomId;
    }

    _init(users) {
        users.forEach(async function (user) {
            logger.error('--user = ', user);
            let uid = user.uid;
            let player = null;
            if (user.kindId === consts.ENTITY_TYPE.ROBOT) {
                player = this._genRobot(user);
            } else {
                let sid = user.sid;
                player = await PlayerFactory.createPlayer({
                    uid: uid,
                    sid: sid,
                    roomType: consts.ROOM_TYPE.MATCH
                });
                this.channel.add(uid, sid);
            }
            this._playerMap.set(uid, player);
        }.bind(this));
    }

    /**
     * 创建一个排位赛机器人
     * 机器人默认准备就绪
     * @param {*} user 
     */
    _genRobot(user) {
        const OPT = consts.RMATCH_ROBOT_OPT;
        let player = new RankMatchRobotPlayer({
            ior: user.ior,
            uid: user.uid,
            account: user,
            kindId: consts.ENTITY_TYPE.ROBOT,
        });
        this._robot = player;
        this._robot.registerUpdateFunc(function (type, data) {
            if (type === OPT.WEAPON_CHANGE) {
                this.weaponChange(data);
            } else if (type === OPT.FIGHTING) {
                this.setFightInfo(data);
            } else if (type === OPT.USE_NBOMB) {
                this.useNbomb(data);
            } else if (type === OPT.CANCEL_NBOMB) {
                this.cancelNbomb(data);
            }
        }.bind(this));

        return player;
    }

    _flushCountdown() {
        let subTime = Date.now() - this._lastUpdateTime;
        return subTime;
    }

    //机器人开火
    _robot_fire(dt) {
        this._robot && this._robot.fire(dt);
    }

    update(dt) {
        if (this._state != consts.MATCH_ROOM_STATE.DOING) {
            return;
        }
        //更新倒计时        
        let subTime = this._flushCountdown();
        if (subTime >= 1000) {
            this._countdown -= 1000;
            this._countdown = Math.max(this._countdown, 0);
            this._sendCountdown();
        }
        this._robot_fire(dt);
        this._try2Settlement();
    }

    isGameOver() {
        return this._state === consts.MATCH_ROOM_STATE.OVER;
    }

    setReady(data) {
        let player = this._playerMap.get(data.uid);
        if (!player) {
            return fishCode.MATCH_ROOM_NOPLAYER;
        }
        player.ready = true;
        player.gameSid = data.gameSid;
        if (data.isContinue || this._canStart()) {
            this._startRmatch();
        }
    }

    getPlayersInfo() {
        let players = [];
        for (let player of this._playerMap.values()) {
            players.push(player.getCurrentMatchInfo());
        }
        return players;
    }

    weaponChange(data) {
        let player = this._playerMap.get(data.uid);
        if (!player) {
            return fishCode.MATCH_ROOM_NOT_EXIST;
        }
        this._broadcast(rankMatchCmd.push.weaponChange.route, data);
    }

    setFightInfo(data) {
        let player = this._playerMap.get(data.uid);
        if (!player) {
            return fishCode.MATCH_ROOM_NOT_EXIST;
        }
        player.setFightInfo(data);
        this._broadcast(rankMatchCmd.push.fightInfo.route, data);
    }

    useNbomb(data) {
        let player = this._playerMap.get(data.uid);
        if (!player) {
            return fishCode.MATCH_ROOM_NOT_EXIST;
        }
        player.useNbomb(data);
        this._broadcast(rankMatchCmd.push.useNbomb.route, data);
        this._try2Settlement();
    }

    cancelNbomb(data) {
        let player = this._playerMap.get(data.uid);
        if (!player) {
            return fishCode.MATCH_ROOM_NOT_EXIST;
        }
        player.cancelNbomb(data);
        this._broadcast(rankMatchCmd.push.cancelNbomb.route, data);
        this._try2Settlement();
    }

    rmatchChat(data) {
        let player = this._playerMap.get(data.uid);
        if (!player) {
            return fishCode.MATCH_ROOM_NOT_EXIST;
        }
        this._broadcast(rankMatchCmd.push.rmatchChat.route, data);
    }

    /**
     * 尝试结算
     * 时间到或双方都已开炮完毕则可以结算，反之不可结算
     */
    _try2Settlement() {
        if (this._canOVer()) {
            this._settlement();
        }
    }

    _canStart() {
        for (let player of this._playerMap.values()) {
            if (!player.ready) {
                return false;
            }
        }
        return true;
    }

    _canOVer() {
        if (this._countdown === 0) {
            return true;
        }
        for (let player of this._playerMap.values()) {
            if (!player.isOver()) {
                return false;
            }
        }
        return true;
    }

    _broadcast(route, data) {
        this.channel.pushMessage(route, data);
    }

    //战斗结算
    _settlement() {
        // 已经执行过_settlement()就不要再次执行了
        if (this._runSettlement) {
            return;
        }
        this._runSettlement = true;
        const FUNC = '\n_settlement() --- ';
        let players = [...this._playerMap];
        let p1 = players[0][1];
        let p2 = players[1][1];
        p1.setResult(p2);
        p2.setResult(p1);

        let data = {
            time: moment(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss'),
        };
        let playerIdx = 1;

        for (let player of this._playerMap.values()) {
            let matchDetail = player.getRMatchDetail();
            let recordUid = matchDetail.uid;
            data['player' + playerIdx] = matchDetail.uid;
            data['nickname' + playerIdx] = matchDetail.nickname;
            data['winning_rate' + playerIdx] = matchDetail.winning_rate;
            data['wait_time' + playerIdx] = 10; // TODO
            data['rank' + playerIdx] = matchDetail.rank;
            data['firetime' + playerIdx] = new Date().getTime(); // TODO: 开火结束时间
            data['fish_account' + playerIdx] = matchDetail.fish_account;
            data['figureurl' + playerIdx] = matchDetail.figure_url;
            let bulletScore = 0;
            for (let fishname in matchDetail.fish_account) {
                let fish = matchDetail.fish_account[fishname];
                bulletScore += fish.point;
            }
            data['bullet_score' + playerIdx] = bulletScore;
            data['used_bullet' + playerIdx] = 100; // TODO
            data['nuclear_score' + playerIdx] = matchDetail.nuclear_score;
            data['nuclear_exploded' + playerIdx] = matchDetail.nuclear_score != -1;
            data['nuclear_fish_count' + playerIdx] = matchDetail.nuclear_fish_count;

            data['score' + playerIdx] = data['bullet_score' + playerIdx] + data['nuclear_score' + playerIdx] + (matchDetail.star ? matchDetail.star.score : 0);
            data['star' + playerIdx] = matchDetail.star;
            playerIdx++;
        }
        data.result = {
            player1: {
                nickname: data.nickname1,
                winning_rate: data.winning_rate1,
                uid: data.player1,
                rank: data.rank1,
                score: data.score1,
                bullet: data.used_bullet1,
                nuclear_exploded: data.nuclear_exploded1,
                nuclear_canceled: !data.nuclear_exploded1,
                firetime: data.firetime1,
                bullet_score: data.bullet_score1,
                nuclear_score: data.nuclear_score1,
                fish_account: data.fish_account1,
                figure_url: data.figureurl1,
                nuclear_fish_count: data.nuclear_fish_count1,
                star: data.star1,
                // point_change: data.point_change1,// TODO
                // old_points: data.old_points1,// TODO
                // new_points: data.new_points1,// TODO
                // rank_change: 0,// TODO
                // box: null,// TODO
                // first_win_box: null// TODO
            },
            player2: {
                nickname: data.nickname2,
                winning_rate: data.winning_rate2,
                uid: data.player2,
                rank: data.rank2,
                score: data.score2,
                bullet: data.used_bullet2,
                nuclear_exploded: data.nuclear_exploded2,
                nuclear_canceled: !data.nuclear_exploded2,
                firetime: data.firetime2,
                bullet_score: data.bullet_score2,
                nuclear_score: data.nuclear_score2,
                fish_account: data.fish_account2,
                figure_url: data.figureurl2,
                nuclear_fish_count: data.nuclear_fish_count2,
                star: data.star2,
                // point_change: data.point_change1,// TODO
                // old_points: data.old_points1,// TODO
                // new_points: data.new_points1,// TODO
                // rank_change: 0,// TODO
                // box: null,// TODO
                // first_win_box: null// TODO
            },
            winner: data.score1 > data.score2 ? 1 : 2,
        };

        //统计排位赛胜利dfc
        for (let player of this._playerMap.values()) {
            let pd = player.getPrivateDetail();
            let uid = Number(pd.uid);
            if (uid > 0) {
                if (data.player1 == uid) {
                    data.result.player1.point_change = pd.point_change;
                }
                if (data.player2 == uid) {
                    data.result.player2.point_change = pd.point_change;
                }
            }
            // logger.error('pd = ', pd);
            player.clear();
        }
        this._broadcast(rankMatchCmd.push.pkResult.route, {});

        // yxlTODO: 将玩家信息写入数据库
        this._addRankgameLog([data], 1, function (err, rows) {
            if (err) {
                return;
            }
            if (rows == null) {
                logger.error(FUNC + 'rows == null');
                this._matchFinish();
            } else {
                let rankgame_log_id = rows.insertId;
                let uid1 = data.result.player1.uid;
                let uid2 = data.result.player2.uid;
                this._setMatchUnfinish(uid1, rankgame_log_id, function () {
                    logger.debug(FUNC + `uid1${uid1}的match_unfinish字段已经设置为${rankgame_log_id}`);
                    this._setMatchUnfinish(uid2, rankgame_log_id, function () {
                        logger.debug(FUNC + `uid2${uid2}的match_unfinish字段已经设置为${rankgame_log_id}`);
                        this._matchFinish();
                    }.bind(this));
                }.bind(this));
            }
        }.bind(this));
    }

    _setMatchUnfinish(uid, rankgame_log_id, cb) {
        // 机器人无需设置此字段
        if (uid > 0) {
            redisClient.cmd.hset(redisKey.MATCH_UNFINISH, uid, rankgame_log_id, cb);
        } else {
            cb();
        }
    }

    _addRankgameLog(data, num, cb) {
        const FUNC = '【room】 _addRankgameLog() --- ';
        if (data.length > 0) {
            let sql = "INSERT INTO `tbl_rankgame_log` ";
            sql += "(`time`, ";
            sql += "`player1`, `wait_time1`, `rank1`, `bullet_score1`, `used_bullet1`, `nuclear_score1`, `nuclear_exploded1`, ";
            sql += "`player2`, `wait_time2`, `rank2`, `bullet_score2`, `used_bullet2`, `nuclear_score2`, `nuclear_exploded2`, ";
            sql += "`result`) ";
            sql += "VALUES ";
            for (let i = 0; i < data.length; i++) {
                if (i > 0) sql += ",";
                sql += '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            }

            let sql_data = [];
            for (let i = 0; i < num; i++) {
                let record = data.shift();

                sql_data.push(record.time);

                sql_data.push(record.player1);
                sql_data.push(record.wait_time1);
                sql_data.push(record.rank1);
                sql_data.push(record.bullet_score1);
                sql_data.push(record.used_bullet1);
                sql_data.push(record.nuclear_score1);
                sql_data.push(record.nuclear_exploded1);

                sql_data.push(record.player2);
                sql_data.push(record.wait_time2);
                sql_data.push(record.rank2);
                sql_data.push(record.bullet_score2);
                sql_data.push(record.used_bullet2);
                sql_data.push(record.nuclear_score2);
                sql_data.push(record.nuclear_exploded2);

                sql_data.push(JSON.stringify(record.result));

                // 记录玩家最近的10个对手(Only Redis)
                this._recordRecentEnemy10(record.player1, record.player2);
                this._recordRecentEnemy10(record.player2, record.player1);
            }


            logger.debug(FUNC + 'sql:\n', sql);
            logger.debug(FUNC + 'sql_data:\n', sql_data);

            this._handlePoolQuery(sql, sql_data, FUNC, cb);
        } else {
            if (cb != null) cb("没有需要插入的数据");
        }
    }

    _recordRecentEnemy10(uid1, uid2) {
        const FUNC = '【room】 _recordRecentEnemy10() --- ';
        // 真实玩家才记录
        if (uid1 > 0) {
            redisClient.cmd.hget(redisKey.RECENT_ENEMY_10, uid1, function (err, res) {
                if (err) console.error(FUNC + 'err:', err);
                if (!res) {
                    res = '[]';
                }
                res = JSON.parse(res);
                res.push(parseInt(uid2));
                if (res.length > 10) {
                    res.shift();
                }
                redisClient.cmd.hset(redisKey.RECENT_ENEMY_10, uid1, JSON.stringify(res));
            });
        }
    }

    _handlePoolQuery(sql, sql_data, FUNC, cb) {
        mysqlClient.query(sql, sql_data, function (err, results) {
            if (err) {
                console.error(FUNC + 'err:\n', err);
                console.error(FUNC + 'sql:\n', sql);
                console.error(FUNC + 'sql_data:\n', sql_data);
                cb(err);
                return;
            }
            cb(null, results);
        });
    }

    //发送倒计时
    _sendCountdown() {
        this._broadcast(rankMatchCmd.push.timer.route, {
            countdown: this._countdown
        });
        this._lastUpdateTime = Date.now();
    }

    //双方准备就绪，正式开始
    _startRmatch() {
        this._broadcast(rankMatchCmd.push.start.route, {
            countdown: this._countdown
        });
        this._state = consts.MATCH_ROOM_STATE.DOING;
        this._lastUpdateTime = Date.now();

        for (let player of this._playerMap.values()) {
            if (player.kindId == consts.ENTITY_TYPE.ROBOT) {
                continue;
            }

            let rpc_target = rpc.getRPCTarget(rpc.serverType.game, rpc.serverModule.game.playerRemote, fishCmd.remote.matchStart.route);
            rpc.invoke(rpc_target, rpc.getSession(rpc.serverType.game, player.account.id), {
                uid: player.account.id,
                nbomb_cost: player.nbomb_cost,
            });
        }
    }

    /**
     * 比赛结束
     */
    _matchFinish() {
        const FUNC = '\n_matchFinish() --- '
        for (let player of this._playerMap.values()) {
            if (player.kindId == consts.ENTITY_TYPE.ROBOT) {
                continue;
            } else {
                let matchDetail = player.getRMatchDetail();
                let uid = matchDetail.uid;
                redisClient.cmd.del(redisKey.RANK_MATCH_ING + ':' + uid);
            }

            let rpc_target = rpc.getRPCTarget(rpc.serverType.game, rpc.serverModule.game.playerRemote, fishCmd.remote.matchFinish.route);
            rpc.invoke(rpc_target, rpc.getSession(rpc.serverType.game, player.account.id), {
                uid: player.account.id
            });
        }
        this._state = consts.MATCH_ROOM_STATE.OVER;
        this._robot = null;
    }

}
module.exports = RankMatchRoom;