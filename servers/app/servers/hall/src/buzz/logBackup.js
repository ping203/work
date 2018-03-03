const async = require('async');
const schedule = require('node-schedule');
const RedisUtil = require('../utils/RedisUtil');
const util = require('util');
const utils = require('utils');

class LogBackup{
    constructor(cfg){
        this.bakCfg = cfg;
        this.schedule = null;
    }


    /**
     * 检查是否需要备份数据
     * @param task
     * @private
     */
    _isNeedBak(task, cb){
        mysqlPool.query(`SELECT COUNT(*) FROM ${task.table}`, null, function (err, result) {
            if(err){
                utils.invokeCallback(cb, err);
                return;
            }

            task.count = result[0]['COUNT(*)'];
            let needBak = task.count >= task.retain + task.bak;
            logger.info('----------------_isNeedBak:', task.count, needBak, result);
            if(needBak){
                mysqlPool.query(`SELECT id FROM ${task.table} LIMIT ${task.retain},1`, function (err, result) {
                    if(err){
                        utils.invokeCallback(cb, err);
                        return;
                    }

                    logger.info('--------task.begin_id:', result[0].id);
                    task.begin_id = result[0].id;

                    mysqlPool.query(`SELECT id FROM ${task.table} LIMIT ${task.count - 1},1`, function (err, result) {
                        if(err){
                            utils.invokeCallback(cb, err);
                            return;
                        }
                        logger.info('--------task.end_id:', result[0].id);
                        task.end_id = result[0].id;
                        utils.invokeCallback(cb, null, needBak);
                    });
                });

            }
        });
    }

    /**
     * 计算备份表索引
     * @param task
     * @param cb
     * @private
     */
    _getBakIndex(task, cb){
        RedisUtil.incr(`logbak:${task.table}`, function (err, result) {
            if(err){
                utils.invokeCallback(cb, err);
                return;
            }
            utils.invokeCallback(cb, null, result % task.max_bak_file);
        });

    }

    /**
     * 创建备份表
     * @param task
     * @param index
     * @param cb
     * @private
     */
    _createBakTable(task, index, cb){
        let tname = `${task.table}_${index}`;
        let sql = util.format(task.structure, tname);
        mysqlPool.query(sql, function (err, result) {
            logger.info('create table'+tname+'err:'+err+'result:'+result);
            utils.invokeCallback(cb, err, tname);
        });

    }

    //SELECT email FROM xxxxxx where email is not null and email <> ''  into  outfile '/mail.txt' lines terminated by '\r\n' ;
    // --secure-file-priv
    _exportBakData(tname, cb){
        let path = `./data/${tname}_${Date.now()}.txt`;
        let sql = `SELECT * FROM ${tname} INTO OUTFILE \'${path}\' lines terminated by '\\r\\n'`;
        logger.info('-----_exportBakData:', path, '       ', sql);
        mysqlPool.query(sql, function (err, result) {
            if(err){
                // logger.info('-----_exportBakData:', err);
            }
            mysqlPool.query(`TRUNCATE ${tname}`, function (err, result) {
                logger.info('-----_exportBakData truncate result:', result);
                utils.invokeCallback(cb, null, tname);
            });
        });
    }


    /**
     * 拷贝数据到备份表
     * @param task
     * @param tname
     * @param skip
     * @param limit
     * @param cb
     * @private
     */
    _moveData(task, tname, skip, limit, cb){
        let sql = `INSERT INTO ${tname} SELECT * FROM ${task.table} WHERE id >= ${task.begin_id} AND id <= ${task.end_id} LIMIT ${skip}, ${limit}`;
        mysqlPool.query(sql, function (err, result) {
            if(err){
                logger.info('-------------------_moveData', err);
                utils.invokeCallback(cb, err);
            }

            logger.info('-------------------_moveData', result.affectedRows);
            let affectedRows = !!result && result.affectedRows ? result.affectedRows:0;
            utils.invokeCallback(cb, err, skip, affectedRows, cb);
        });
    }

    /**
     * 移动数据到备份表 // INSERT INTO bak_tbl_gold_log_0005 SELECT * FROM tbl_gold_log WHERE id>34000000 AND id<=42000000;
     * @param task
     * @param tname
     * @param cb
     * @private
     */
    _backupData(task, tname, cb){
        this._moveData(task, tname, 0, task.bak, function (err, skip, affectedRows, callback) {
            if(affectedRows < task.bak){
                mysqlPool.query(`DELETE FROM ${task.table} WHERE id >= ${task.begin_id} AND id <= ${task.end_id}`, function (err, result) {
                    utils.invokeCallback(cb, null);
                });
                return;
            }
            this._moveData(task, tname, skip + affectedRows, task.bak, callback);
        }.bind(this));
    }

    /**
     * 执行定时任务
     * @private
     */
    _exeTask(){
        let tasks = this.bakCfg.task;
        let self = this;
        logger.info('执行任务列表:', tasks);
        tasks.forEach(function (task) {
            async.waterfall([function (cb) {
                self._isNeedBak(task, cb);
            },function (need, cb) {
                if(!need){
                    cb(`暂时不需要备份该数据表${task.table}`);
                    return;
                }
                self._getBakIndex(task, cb);
            },function (index, cb) {
                self._createBakTable(task, index, cb);
            },function(tname,cb)
            {
                self._exportBakData(tname, cb);
            },function (tname, cb) {
                self._backupData(task, tname, cb);
            }], function (err) {
                if(err){
                    logger.info(err);
                }
                else {
                    logger.info(`执行${task.table}日志备份完成`);
                }
            });
        });
    }

    /**
     * 启动定时任务
     */
    run(){
        let timesArr = this.bakCfg.time.split(',');
        let time_str = `${timesArr[0]} ${timesArr[1]} ${timesArr[2]} ${timesArr[3]} ${timesArr[4]} ${timesArr[5]}`;
        logger.info('启动定时任务配置信息', time_str);
        this.schedule = schedule.scheduleJob(time_str, function(){
            logger.info('定时任务开始执行...');
            this._exeTask();
        }.bind(this));
    }

    /**
     * 取消定时任务
     */
    cancle(){
        if(this.schedule){
            this.schedule.cancle();
            this.schedule = null;
        }
    }

}

module.exports =  LogBackup;
