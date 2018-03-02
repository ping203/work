const eventApp = require('./eventApp');

module.exports.beforeStartup = function(app, cb) {
    eventApp.start();
    cb();
};


module.exports.afterStartup = function(app, cb) {
    cb();
};


module.exports.beforeShutdown = function(app, cb) {
    eventApp.stop();
    cb();
};

module.exports.afterStartAll = function(app) {
};
