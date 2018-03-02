const logger = loggerEx(__filename);
const logicResponse = require('../../../common/logicResponse');

exports.showMeActivity = showMeActivity;
exports.getReward = getReward;

/**
 * 创建CD-KEY
 */
async function showMeActivity(data) {
    return new Promise(function(resolve, reject){
        myDao.showMeActivity(data, function (err, results) {
            if(err){
                logger.error('showMeActivity err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results));
        });
    }); 
}

/**
 * 根据传入的action_id获取此活动下所有CD-KEY极其状态
 */
async function getReward(data) {
    return new Promise(function(resolve, reject){
        myDao.getReward(data, function (err, account) {
            if(err){
                logger.error('getReward err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(account));
        });
    }); 
}

