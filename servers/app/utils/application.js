const logHelper = require('./logHelper');
const database = require('../database/dbclient');
const DBType = require('../database/consts/consts').DBType;
const logger = loggerEx(__filename);

class Application {
    constructor(opts) {
        this._opts = opts;
        logHelper.setAppName(this._opts.appName);
        logHelper.setLevel('error');
        this._logHelper = logHelper;
    }

    async start() {
        let result = true;
        try {

            if (this._opts.db.redis) {
                let redis = await database.runner.connectRedis(this._opts.db.redis);
                if (redis) {
                    this.dbEvent(DBType.REDIS, redis);
                }
            }

            if (this._opts.db.mysql) {
                let mysql = await database.runner.connectMysql(this._opts.db.mysql);
                if (mysql) {
                    this.dbEvent(DBType.MYSQL, mysql);
                }
            }

        } catch (err) {
            logger.error('应用程序基础模块启动失败，err:', err);
            return false;
        }

        this._exception();

        logger.info('应用程序基础模块启动成功');

        return true;
    }

    stop() {

    }

    uncaughtException() {}

    unhandledRejection() {}

    exit() {}

    dbEvent(type, db) {}

    _exception() {
        process.on('exit', (code) => {
            logger.error(`${this._opts.appName} exit`, code)
            this.stop();
        });

        process.on('SIGINT', (code) => {
            logger.error(`${this._opts.appName} SIGINT Press Control-D/Control-C to exit`, code);
            process.exit(1)
        });

        process.on('uncaughtException', (err) => {
            logger.error(`${this._opts.appName} uncaughtException`, err);
            logger.error("stack:", err.stack);
            this.uncaughtException();
        });

        process.on('unhandledRejection', (reason, p) => {
            logger.error(`${this._opts.appName}  Unhandled Rejection at: Promise ${p} reason: `, reason);
            this.unhandledRejection();
        });
    }

}


module.exports = Application;