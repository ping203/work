const omelo = require('omelo');
const async = require('async');
const plugins = require('../plugins');
const Entity = require('../base/entity');
const cacheRunner = require('../../cache/runner');
const redisClient = require('../../utils/dbclients').redisClient;
const mysqlClient = require('../../utils/dbclients').mysqlClient;
const fishCmd = require('../../cmd/fishCmd');
const matchingCmd = require('../../cmd/matchingCmd');
const constsDef = require('../../consts/constDef');
const GAME_TYPE = require('../../utils/imports').sysConfig.GAME_TYPE;
const rpc = require('../net/rpc');

class Game {
    constructor() {}

    async start() {
        let result = await redisClient.start(omelo.app.get('redis'));
        if (!result) {
            process.exit(0);
            return;
        }
        result = await mysqlClient.start(omelo.app.get('mysql'));
        if (!result) {
            process.exit(0);
            return;
        }

        cacheRunner.start();
        this._instance = new plugins[GAME_TYPE].Instance();
        this._instance.start();
        logger.info('游戏战斗服启动成功');
    }

    stop() {
        this._instance.stop();
        redisClient.stop();
        mysqlClient.stop();
    }

    remoteRpc(method, data, cb) {
        this._instance.remoteRpc(method, data, cb);
    }

    request(route, msg, session, cb) {
        if (this._interceptReq(route, msg, session, cb)) {
            return;
        }
        this._instance.request(route, msg, session, cb);
    }

    _interceptReq(route, msg, session, cb) {
        if (!this[route]) return false;
        this[route](msg, session, cb);
        return true;
    }

    c_login(msg, session, cb) {
        let token = msg.token;
        if (!token) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }

        let self = this;
        let _uid = null;
        let sessionService = omelo.app.get('sessionService');
        async.waterfall([
            function (cb) {
                let rpc_target = rpc.getRPCTarget(rpc.serverType.auth, rpc.serverModule.auth.authRemote, 'authenticate');
                rpc.invoke(rpc_target, rpc.getSession(rpc.serverType.auth), token, cb);
                //  omelo.app.rpc.auth.authRemote.authenticate(session, token, cb);
            },
            function (result, cb) {
                _uid = result.uid;
                sessionService.kick(_uid, function (err) {
                    if (err) {
                        cb(CONSTS.SYS_CODE.SYSTEM_ERROR)
                    } else {
                        cb();
                    }
                });
            },
            function (cb) {
                session.bind(_uid, function (err) {
                    if (err) {
                        cb(CONSTS.SYS_CODE.SYSTEM_ERROR)
                    } else {
                        session.on('closed', self._socketClose.bind(self));
                        cb();
                    }
                });
            }
        ], function (err) {
            utils.invokeCallback(cb, err);
            logger.error(`用户[${_uid}]登陆成功`);
        });
    }

    c_logout(msg, session, cb) {
        utils.invokeCallback(cb, null);
    }

    c_enter_room(msg, session, cb) {
        msg.sid = session.frontendId;

        let self = this;
        let _roomId = null;

        session.set('sceneId', msg.sceneId);

        async.waterfall([
            function (cb) {
                if (!!msg.roomId) {
                    logger.error('onEnterGame 玩家重连游戏', msg.roomId);
                    self._reconnectGame(msg, session, cb);
                } else {
                    logger.debug('onEnterGame 新建游戏', msg.uid);
                    self._newGame(msg, session, cb);
                }

            },
            function (roomId, cb) {
                _roomId = roomId;
                session.set('roomId', roomId);
                session.set('gameSid', session.frontendId);
                session.pushAll(cb);
            }
        ], function (err) {
            if (err) {
                utils.invokeCallback(cb, null, err);
                return;
            }

            utils.invokeCallback(cb, null, {
                roomId: _roomId
            });

            logger.info(`用户[${msg.uid}]加入游戏成功`, {
                roomId: _roomId
            });
        });
    }

    c_leave_room(msg, session, cb) {
        logger.info(`用户[${msg.uid}]主动退出房间`);
        msg.sceneId = session.get('sceneId');
        this._playerLeave(msg, function (err, result) {
            logger.info(`用户[${msg.uid}]退出游戏服务`, session.get('gameId'));
            utils.invokeCallback(cb, null, CONSTS.SYS_CODE.OK);
        });
    }

    _newGame(data, session, cb) {
        this._playerJoin(data, function (err, roomId) {
            if (err) {
                cb(err);
            } else {
                cb(null, roomId);
            }
        });
    }

    _reconnectGame(msg, session, cb) {
        let self = this;
        this._updatePlayerConnectState({
            uid: msg.uid,
            state: constsDef.PALYER_STATE.ONLINE,
            sid: msg.sid,
            sceneId: msg.sceneId,
            roomId: msg.roomId
        }, function (err, roomId) {
            if (err) {
                // 重连失败，自动新建游戏
                self._newGame(msg, session, cb);
            } else {
                cb(null, roomId);
            }
        });
    }

    _socketClose(session, reason) {
        if (!session || !session.uid) {
            return;
        }

        let uid = session.uid;
        let matching_state = session.get('matching');
        if (matching_state) {
            omelo.app.rpc.matching.matchingRemote[matchingCmd.remote.cancleSigup.route](session, {
                uid: uid
            }, function (err, result) {
                logger.info(`用户[${uid}] 离开报名服`);
            });
        }

        let serverId = session.get('gameSid');
        if (!!serverId) {
            this._updatePlayerConnectState({
                uid: uid,
                state: constsDef.PALYER_STATE.OFFLINE,
                sid: session.frontendId,
                sceneId: session.get('sceneId')
            }, function (err, result) {
                logger.info(`用户[${uid}] 网络连接断开`, session.get('gameId'));
            });
        }
    }

    getScene(sceneId) {
        return this._instance.getScene(sceneId);
    }

    //获取玩家负载信息
    getLoadInfo() {
        return this._instance.getLoadStatistics();
    }

    /**
     * 玩家连接状态
     * @param {*} data {uid,state, sid,sceneId}
     * @param {*} cb 
     */
    _updatePlayerConnectState(data, cb) {
        this._instance.setPlayerState(data, function (err, roomId) {
            if (err) {
                logger.error('onPlayerConnectState error', err);
                utils.invokeCallback(cb, err);
                return
            }
            utils.invokeCallback(cb, err, roomId);
        });
    }

    //玩家加入
    _playerJoin(msg, cb) {
        this._instance.enterScene(msg, function (err, roomId) {
            if (err) {
                logger.error(`玩家${msg.uid}加入游戏房间失败`, err);
            }
            utils.invokeCallback(cb, err, roomId);
        }.bind(this));
    }

    //玩家离开{uid,sceneId}
    _playerLeave(msg, cb) {
        this._instance.leaveScene(msg, cb);
    }


}

module.exports = new Game();