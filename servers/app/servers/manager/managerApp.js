const omelo = require('omelo');
const omeloAdmin = require('omelo-admin');
const plugins = require('../../logic/plugins');
const GAME_TYPE = require('../../utils/imports').sysConfig.GAME_TYPE;
const BALANCE_PERIOD = require('../../utils/imports').sysConfig.BALANCE_PERIOD;


class ManagerApp {
    constructor() {
        this.app = omelo.app;
        this.connectorMap = new Map();
        this.gameServerMap = new Map();
        this.rankMatchServerMap = new Map();

        this._adminClient = new omeloAdmin.adminClient({
            username: "monitor",
            password: "monitor"
        });

        this._timerHandle = null;
    }
    async start() {
        // this._adminClient.connect('manager-' + Date.now(), "127.0.0.1", "3005", function (err) {
        //     if (err) {
        //         logger.error('负载均衡服务器连接master失败', err);
        //     } else {
        //         logger.info('负载均衡服务器连接master成功');
        //         this.runTick();
        //     }
        // }.bind(this));
        logger.info('管理服务器启动成功');
    }

    stop() {
        if (this._timerHandle) {
            clearInterval(this._timerHandle);
        }
        logger.info('管理服务器关闭');
    }

    remoteRpc(method, data, cb) {
        if (!plugins[GAME_TYPE]) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.NOT_SUPPORT_GAMETYPE);
            return
        }

        if (!this[method]) {
            cb(CONSTS.SYS_CODE.NOT_SUPPORT_SERVICE);
            return;
        }
        this[method](data, cb);
    }

    runTick() {
        this._timerHandle = setInterval(function () {

            //请求游戏服务器业务负载信息
            this._adminClient.request('gameInfo', {}, function (err, data) {
                if (!!err || data === undefined) {
                    return;
                }
                this._updateGameServerLoad(data);
                logger.error('--------------gameInfo:', data);
            }.bind(this));

            this._adminClient.request('matchInfo', {}, function (err, data) {
                if (!!err || data === undefined) {
                    return;
                }
                this._updateRankMatchServerLoad(data);
                logger.error('--------------matchInfo:', data);
            }.bind(this));

            //请求服务器系统负载信息
            // adminClient.request('systemInfo', {}, function(err,data){
            //     if(!!err || data === undefined){
            //         return;
            //     }
            //
            //     // this._updateGameSysLoad(data);
            //
            //     logger.info('--------------systemMonitor:',err, data);
            // }.bind(this));
            //

        }.bind(this), BALANCE_PERIOD);
    }

    /**
     * 分配游戏服务器
     * @param param
     * @param cb
     */
    rpc_get_game_server(data, cb) {
        let gameServers = this.app.getServersByType('game');
        if (!gameServers || gameServers.length === 0) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_DEPLOY_ERROR);
            return;
        }

        if (this.gameServerMap.size === 0) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_NOT_RUNNING);
            return;
        }

        let _cfgGameMap = new Map();
        gameServers.forEach(function (item) {
            _cfgGameMap.set(item.id, item);
        });

        let serverAddress = null;
        let [id, load] = this._getMinLoadGameMap();
        // logger.error('@@@@@@@@@@@@@@@', id, load);
        let item = _cfgGameMap.get(id);
        if (!!item) {
            ++load;
            // logger.error('@@@@@@@@@@@@@@@', item.maxLoad, load);
            if (load > item.maxLoad) {
                utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_RESOURCE_NOT_ENOUGHT);
                return;
            }
            this.gameServerMap.set(id, load);
            serverAddress = {
                host: item.clientHost,
                port: item.clientPort
            };
        }

        if (!serverAddress) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_ILLEGAL);
            return;
        }

        utils.invokeCallback(cb, null, serverAddress);
    }

    _getMinLoadGameMap() {
        let id = null;
        let load = 0;
        for (let [k, v] of this.gameServerMap) {
            if (!id) {
                id = k;
                load = v;
            }

            if (v < load) {
                load = v;
                id = k;
            }
        }
        return [id, load];
    }

    _getMinLoadRankMatchMap() {
        let id = null;
        let load = 0;
        for (let [k, v] of this.rankMatchServerMap) {
            if (!id) {
                id = k;
                load = v;
            }

            if (v < load) {
                load = v;
                id = k;
            }
        }
        return [id, load];
    }

    rpc_get_rankMatch_server(data, cb) {
        let gameServers = this.app.getServersByType('rankMatch');
        if (!gameServers || gameServers.length === 0) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_DEPLOY_ERROR);
            return;
        }

        if (this.rankMatchServerMap.size === 0) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_NOT_RUNNING);
            return;
        }

        let _cfgGameMap = new Map();
        gameServers.forEach(function (item) {
            _cfgGameMap.set(item.id, item);
        });


        let serverId = null;
        let [id, load] = this._getMinLoadRankMatchMap();
        // logger.error('@@@@@@@@@@@@@@@', id, load);
        let item = _cfgGameMap.get(id);
        if (!!item) {
            ++load;
            // logger.error('@@@@@@@@@@@@@@@', item.maxLoad, load);
            if (load > item.maxLoad) {
                utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_RESOURCE_NOT_ENOUGHT);
                return;
            }
            this.rankMatchServerMap.set(id, load);
            serverId = item.id;
        }

        if (!serverId) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_ILLEGAL);
            return;
        }

        utils.invokeCallback(cb, null, serverId);
    }

    //更新游戏服务器系统负载
    _updateGameSysLoad(data) {

    }

    //更新游戏服务器房间人数负载
    _updateGameServerLoad(data) {
        this.gameServerMap.clear();
        for (let id in data) {
            this.gameServerMap.set(id, data[id].playerLoad);
        }
    }

    //更新游戏服务器房间人数负载
    _updateRankMatchServerLoad(data) {
        this.rankMatchServerMap.clear();
        for (let id in data) {
            this.rankMatchServerMap.set(id, data[id].playerLoad);
        }
    }

}

module.exports = new ManagerApp();