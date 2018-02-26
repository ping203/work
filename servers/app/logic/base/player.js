const Entity = require('./entity');
const omelo = require('omelo');
const messageService = require('../net/messageService');
const rpc = require('../net/rpc');

class Player extends Entity{
    constructor(opts){
        super(opts);
        this._sid = opts.sid || '';
        this._uid = opts.uid || '';
        this._activeTime = Date.now();
    }

    get uid(){
        return this._uid;
    }

    get sid(){
        return this._sid;
    }

    set sid(value){
        this._sid = value;
    }

    send(route, msg){
        messageService.send(route, msg, {uid: this._uid, sid: this._sid});
    }

    get activeTime(){
        return this._activeTime
    }

    updateActiveTime(){
        this._activeTime = Date.now();
    }

    c_heartbeat(data, cb){
        this.updateActiveTime();
        utils.invokeCallback(cb, CONSTS.SYS_CODE.OK);
    }

}

module.exports = Player;