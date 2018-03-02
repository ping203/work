const omelo = require('omelo');

class Rpc {
    constructor() {
        this._serverType = {
            gate: 'gate',
            manager: 'manager',
            event: 'event',
            matching: 'matching',
            rankMatch: 'rankMatch',
            game: 'game'
        };

        this._serverIdKey = {
            gate: 'gateSid',
            manager: 'managerSid',
            event: 'eventSid',
            matching: 'matchingSid',
            rankMatch: 'rankMatchSid',
            game: 'uid'
        };

        this._serverModule = {
            gate: {},
            manager: {
                managerRemote: 'managerRemote'
            },
            event: {},
            matching: {
                matchingRemote: 'matchingRemote'
            },
            rankMatch: {
                rankMatchRemote: 'rankMatchRemote'
            },
            game: {
                playerRemote: 'playerRemote'
            }
        }
    }

    get serverType() {
        return this._serverType;
    }

    get serverModule() {
        return this._serverModule;
    }

    invoke(target, session, data, cb) {
        target(session, data, cb);
    }

    getRPCTarget(serverType, moduleNname, method) {
        return omelo.app.rpc[serverType][moduleNname][method];
    }

    /**
     * 获取rpc调用session
     * @param {服务类型} serverType 
     * @param {服务ID} sid 
     */
    getSession(serverType, sid) {
        let session = {};
        session[this._serverIdKey[serverType]] = sid;
        return session;
    }
}

module.exports = new Rpc();