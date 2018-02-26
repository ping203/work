const Task = require('../../base/task/task');
const REDISKEY = require('../../database/consts').REDISKEY;
const ACCOUNTKEY = require('../../database/consts').ACCOUNTKEY;
const dbUtils = require('../../database/').dbUtils;
const rank_rankgame_cfg = require('../../config/index').data_cfg.rank_rankgame_cfg;
const async = require('async');
const utils = require('../../../utils/utils');
const SUBTASK_TYPE = require('../src/consts').SUBTASK_TYPE;
/**
 * 用户数据重置
 */

class MonthTask extends Task {
    constructor(conf) {
        super(conf);
    }

    _setSpecial(task, cb){
        utils.invokeCallback(cb, null);
    }

    _reset(task, cb){
        if (SUBTASK_TYPE.DEL == task.type) {
            this._delKey(task, cb);
        } else if (SUBTASK_TYPE.SPECIAL == task.type) {
            this._setSpecial(task, cb);
        }else if(SUBTASK_TYPE.MODIFY==task.type){
            this._setDefault(task,cb);
        }
        else {
            utils.invokeCallback(cb, null);
        }
    }

    async _exeTask(cb) {
        logger.info('按月任务重置开始');
        let tasks = this.taskConf.subTask;
        async.mapSeries(tasks, this._reset.bind(this), function (err, results) {
            logger.info('按月任务重置完成')
            utils.invokeCallback(cb, null);
        });
    }
}

module.exports = MonthTask;