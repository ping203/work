const Scene = require('./scene');
const robotController = require('./robot/robotController');
const config = require('./config');
const consts = require('./consts');
const PlayerFactory = require('./entity/playerFactory');
const fishCmd = require('../../../cmd/fishCmd');

class Instance {
    constructor() {
        this.scenes = new Map();
        this.uids = new Map();
        this._vacancyQueryTimer = null;
        this._kickOfflineTimer = null;
    }


    start() {
        // if (!this._vacancyQueryTimer) {
        //     this._vacancyQueryTimer = setInterval(this.assignRobot.bind(this), config.ROBOT.VACANCY_QUERY_TIMEOUT);
        // }
        // robotController.run();

        if (!this._kickOfflineTimer) {
            this._kickOfflineTimer = setInterval(this.kick_offline_player.bind(this), config.PLAYER.KICK_OFFLINE_CHECK_TIMEOUT);
        }
    }

    stop() {
        if (this._vacancyQueryTimer) {
            clearInterval(this._vacancyQueryTimer);
            this._vacancyQueryTimer = null;
        }
        // robotController.stop();
    }

    /**
     * 定时加入机器人到房间
     */
    assignRobot() {
        let rooms = this.queryMultiRoom(true);
        robotController.addRobot(rooms);
    }

    kick_offline_player() {
        for (let scene of this.scenes.values()) {
            let scene_uids = scene.kickOfflinePlayer();
            for (let uid of scene_uids) {
                this.uids.delete(uid);
            }
        }
    }

    getLoadStatistics() {
        let roomCount = [...this.scenes.values()].reduce(function (prev, next) {
            return prev + next.getRoomCount();
        }, 0);

        return {
            playerCount: this.uids.size,
            roomCount: roomCount
        };
    }


    /**
     * 查询多人房
     */
    queryMultiRoom(robot) {
        let rooms = [];
        for (let scene of this.scenes.values()) {
            let room = scene.multiRoom(robot);
            if (room) {
                rooms.push({
                    room: room,
                    scene: scene
                });
            }
        }
        return rooms;
    }

    getScene(sceneId) {
        return this.scenes.get(sceneId);
    }

    request(route, msg, session, cb) {
        if(!msg.scene[route]){
            utils.invokeCallback(cb, CONSTS.SYS_CODE.NOT_SUPPORT_SERVICE);
            return;
        }

        msg.scene[route](route, session.uid, msg, function (err, result) {
            utils.invokeCallback(cb, err, result);
        });
    }

    remoteRpc(method, data, cb) {
        if (!this[method]) {
            cb(CONSTS.SYS_CODE.NOT_SUPPORT_SERVICE);
            return;
        }

        this[method](data, function (err, result) {
            utils.invokeCallback(cb, err, result);
        });
    }

    async enterScene(data, cb) {
        if (data.roomType === undefined || !data.sceneId || !data.uid || !data.sid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }

        if (this.uids.has(data.uid)) {
            this.leaveScene(data);
        }

        let scene = this.scenes.get(data.sceneId);
        if (!scene) {
            scene = new Scene(data.sceneId);
            let err = scene.start();
            if (err) {
                utils.invokeCallback(cb, err);
                return;
            }
            this.scenes.set(data.sceneId, scene);
        } 
  
        try {
            let player = await PlayerFactory.createPlayer(data);
            if (player) {
                let [err, roomId] = scene. joinGame(data.roomType, player);
                if (err) {
                    utils.invokeCallback(cb, err);   
                    return;
                }
                this.uids.set(data.uid, scene);
                utils.invokeCallback(cb, null, roomId);
            } else {
                utils.invokeCallback(cb, CONSTS.SYS_CODE.PLAYER_CREATE_FAILED);
            }
        } catch (err) {
            utils.invokeCallback(cb, err);
        }
    }

    /**
     * 离开游戏场景
     * @param {uid:10010,sceneId:'scene-type-1'} data 
     * @param {*} cb 
     */
    leaveScene(data, cb) {
        let scene = this.scenes.get(data.sceneId);
        if (!scene) {
            utils.invokeCallback(cb, null);
            return;
        }
        scene.leaveGame(data.uid);
        this.uids.delete(data.uid);
        utils.invokeCallback(cb, null);
    }

    /**
     * 设置玩家状态
     * @param {uid:10010,state: 0,sid:'game-server-1',sceneId:'scene-type-1'} data 
     * @param {*} cb 
     */
    setPlayerState(data, cb) {
        if (!data.uid || !data.sid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }
        let scene = this.scenes.get(data.sceneId);
        if (!scene) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.PALYER_GAME_ROOM_DISMISS);
            return;
        }
        let room = scene.getSceneRoom(data.uid);
        if (!!room && room.setPlayerState(data.uid, data.state, data.sid)) {
            utils.invokeCallback(cb, null, room.roomId);
        } else {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.PALYER_GAME_ROOM_DISMISS);
        }
    }

    rpc_match_start(data, cb) {
        if (!data.uid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }

        let scene = this.uids.get(data.uid);
        logger.error('#########################333: rpc_match_start ');
        if (!scene) {
            logger.error('setPlayerState data - ', data);
            utils.invokeCallback(cb, CONSTS.SYS_CODE.PALYER_GAME_ROOM_DISMISS);
            return;
        }

        let room = scene.getSceneRoom(data.uid);
        if (room) {
            let player = room.getPlayer(data.uid);
            player && player.startRmatch(data);
            utils.invokeCallback(cb, null);
        }
    }

    rpc_match_finish(data, cb) {
        if (!data.uid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }

        let scene = this.uids.get(data.uid);
        logger.error('#########################333: rpc_match_finish ');
        if (!scene) {
            logger.error('setPlayerState data - ', data);
            utils.invokeCallback(cb, CONSTS.SYS_CODE.PALYER_GAME_ROOM_DISMISS);
            return;
        }

        let room = scene.getSceneRoom(data.uid);
        if (room) {
            let player = room.getPlayer(data.uid);
            player && player.clearRmatch();
            utils.invokeCallback(cb, null);
        }
    }

    rpc_player_data_change(data, cb) {
        if (!data.uid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }

        let scene = this.uids.get(data.uid);
        if (!scene) {
            logger.info('玩家不在游戏中', data.uid);
            utils.invokeCallback(cb, CONSTS.SYS_CODE.PALYER_GAME_ROOM_DISMISS);
            return;
        }

        let room = scene.getSceneRoom(data.uid);
        if (room) {
            let player = room.getPlayer(data.uid);
            //玩家进行数据同步
            player.syncData();
            utils.invokeCallback(cb, null);
        }
    }
    
}

module.exports = Instance;