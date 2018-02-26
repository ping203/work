const omelo = require('omelo');

const serverType = {
    gate: 'gate',
    auth: 'auth',
    balance: 'balance',
    dataSync: 'dataSync',
    matching: 'matching',
    rankMatch: 'rankMatch',
    game: 'game'
}

class Rpc {
    constructor() {
        this._serverType = {
            gate: 'gate',
            auth: 'auth',
            balance: 'balance',
            dataSync: 'dataSync',
            matching: 'matching',
            rankMatch: 'rankMatch',
            game: 'game'
        };

        this._serverIdKey = {
            gate: 'gateSid',
            auth: 'authSid',
            balance: 'balanceSid',
            dataSync: 'dataSyncSid',
            matching: 'matchingSid',
            rankMatch: 'rankMatchSid',
            game: 'gameSid'
        };

        this._serverModule = {
            gate: {},
            auth: {
                authRemote: 'authRemote'
            },
            balance: {
                balanceRemote: 'balanceRemote'
            },
            dataSync: {},
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