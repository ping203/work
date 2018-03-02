const managerApp = require('./managerApp');

module.exports.beforeStartup = function(app, cb) {
    managerApp.start();
    cb();
};


module.exports.afterStartup = function(app, cb) {
    cb();
};


module.exports.beforeShutdown = function(app, cb) {
    managerApp.stop();
    cb();
};

module.exports.afterStartAll = function(app) {
};
