

var buzz_mail = require('../../src/buzz/buzz_mail');
const logicResponse = require('../../../common/logicResponse');
exports.readMail = readMail;

async function readMail(data) {
    return new Promise(function(resolve, reject){
        myDao.readMail( data,  function(err, results) {
            if(err){
                logger.error('领取邮件奖励失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(results[0]));
        });
    });
}

