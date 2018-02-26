const LogHelper = require('../base/logHelper');
const dbConfig = require('../config/db');
const taskPool = require('../base/task').taskPool;
const Application = require('../base/application');
const AccountSync = require('./task/accountSync');
const AccountKick = require('./task/accountKick');
const task_conf = require('./config/task');

class PlayerSyncApp extends Application {
    constructor(appName) {
        super({
            db: {
                redis: dbConfig.redis,
                mysql: dbConfig.mysql
            },
            appName:appName
        });
        this._logHelper.setLevel('INFO');
    }

    async start() {
        let ret = await super.start();
        if (!ret) {
            return;
        }
        this._addTask();
    }

    stop(){
        this._logHelper.flush();
        taskPool.removeTask();
        console.log('-----------------------')
    }

    dbEvent(type, db) {
        // console.log(type, db);
    }

    _addTask() {
        let accountSync = new AccountSync(task_conf.userSync);
        let accountKick = new AccountKick(task_conf.userKick);
        taskPool.addTask('userSync', accountSync);
        taskPool.addTask('userKick', accountKick);
    }
}


let app = new PlayerSyncApp('playerSync');
app.start();