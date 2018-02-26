const dbConfig = require('../config/db');
const taskPool = require('../base/task').taskPool;
const Application = require('../base/application');
const DailyResetTask = require('./task/dailyResetTask');
const MonthResetTask = require('./task/monthResetTask');
const WeekResetTask = require('./task/weekResetTask');
const RankBuildTask = require('./task/rankBuildTask');
const RankRewardTask = require('./task/rankRewardTask');
const RankTrimTask = require('./task/rankTrimTask');
const task_conf = require('./config/task');

class RankSyncApp extends Application {
    constructor(appName) {
        super({
            db: {
                mysql: dbConfig.mysql,
                redis: dbConfig.redis
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

    _addTask() {
        let dailyTask = new DailyResetTask(task_conf.dailyReset);
        let weekTask = new WeekResetTask(task_conf.weekReset);
        let monthTask = new MonthResetTask(task_conf.monthReset);
        let rankBuildTask = new RankBuildTask(task_conf.rankBuild);
        let rankRewardTask = new RankRewardTask(task_conf.rankReward);
        let rankTrimTask = new RankTrimTask(task_conf.rankTrim);
        taskPool.addTask('dailyTask', dailyTask);
        taskPool.addTask('weekTask', weekTask);
        taskPool.addTask('monthTask', monthTask);
        taskPool.addTask('rankBuild', rankBuildTask);
        taskPool.addTask('rankReward', rankRewardTask);
        taskPool.addTask('rankTrim', rankTrimTask);
    }
}


let app = new RankSyncApp('rankSync');
app.start();