const managerCmd = require('../../../cmd/managerCmd');
const RemoteHandler = require('../../common/remoteHandler');
const managerApp = require('../managerApp');

function ManagerRemote(app) {
    this.app = app;
}

let remote = managerCmd.remote;
for(let k of Object.keys(remote)){
    RemoteHandler.registe(remote[k].route, ManagerRemote.prototype, managerApp);
}

module.exports = function (app) {
    return new ManagerRemote(app);
};