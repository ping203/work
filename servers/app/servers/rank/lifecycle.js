const rankApp = require('./rankApp');

module.exports.beforeStartup = function(app, cb) {
    rankApp.start();
    cb();
};


module.exports.afterStartup = function(app, cb) {
    cb();
};


module.exports.beforeShutdown = function(app, cb) {
    rankApp.stop();
    cb();
};

module.exports.afterStartAll = function(app) {
};
