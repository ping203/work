/**
 * 聊天
 * Created by zhenghang on 2017/9/15.
 */
var buzz_chat = require('../src/buzz/buzz_chat');
const logicResponse = require('../../common/logicResponse');
const logger = loggerEx(__filename);

async function getChat(data) {
    return new Promise(function(resolve, reject){
        buzz_chat.getChat(data, function (err, result) {
            if(err){
                logger.error('获取聊天 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

exports.getChat = getChat;