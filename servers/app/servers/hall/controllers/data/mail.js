

var buzz_mail = require('../../src/buzz/buzz_mail');
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var buzz_cst_error = require('../../src/buzz/cst/buzz_cst_error');
var data_util = require('./data_util');
const logicResponse = require('../../../common/logicResponse');

exports.mailList = mailList;

async function mailList(data) {
    return new Promise(function(resolve, reject){
        myDao.mailList( data,  function(err, mail_box) {
            if(err){
                logger.error('获取邮件列表失败 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(mail_box));
        });
    });
}

